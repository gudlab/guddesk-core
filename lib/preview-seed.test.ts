import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertPreviewDatabase,
  assertStripeTestMode,
  formatPreviewSeedReport,
  normaliseDatabaseUrl,
  parsePreviewSeedEnv,
  PREVIEW_COLLECTION_SLUG,
  PREVIEW_KB_ARTICLES,
  PREVIEW_SAMPLE_THREADS,
  PREVIEW_SEED_DEFAULTS,
  PreviewSeedError,
  resolvePreviewDatabaseUrl,
  seedPreviewAccounts,
  type PreviewSeedConfig,
  type PreviewSeedMessage,
  type PreviewSeedStore,
} from "./preview-seed";

const VALID_ENV: NodeJS.Dict<string> = {
  PREVIEW_SEED: "1",
  PREVIEW_OWNER_A_PASSWORD: "owner-a-pass",
  PREVIEW_OWNER_B_PASSWORD: "owner-b-pass",
  PREVIEW_AGENT_A_PASSWORD: "agent-a-pass",
  PREVIEW_AGENT_B_PASSWORD: "agent-b-pass",
  PREVIEW_WORKSPACE_A_IDENTITY_SECRET: "hmac-secret-a",
  STRIPE_SECRET_KEY: "sk_test_preview_seed",
};

function parse(overrides: NodeJS.Dict<string> = {}): PreviewSeedConfig {
  return parsePreviewSeedEnv({ ...VALID_ENV, ...overrides });
}

describe("assertStripeTestMode", () => {
  it("accepts sk_test_ and rk_test_ secrets", () => {
    assert.doesNotThrow(() =>
      assertStripeTestMode({ secretKey: "sk_test_abc" }),
    );
    assert.doesNotThrow(() =>
      assertStripeTestMode({ secretKey: "rk_test_abc" }),
    );
  });

  it("accepts a pk_test_ publishable key alongside a test secret", () => {
    assert.doesNotThrow(() =>
      assertStripeTestMode({
        secretKey: "sk_test_abc",
        publishableKey: "pk_test_abc",
      }),
    );
  });

  it("refuses a missing secret", () => {
    assert.throws(
      () => assertStripeTestMode({}),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /STRIPE_SECRET_KEY is required/.test(err.message),
    );
  });

  it("refuses sk_live_ and rk_live_ secrets", () => {
    assert.throws(
      () => assertStripeTestMode({ secretKey: "sk_live_abc" }),
      (err: unknown) =>
        err instanceof PreviewSeedError && /live key/.test(err.message),
    );
    assert.throws(
      () => assertStripeTestMode({ secretKey: "rk_live_abc" }),
      PreviewSeedError,
    );
  });

  it("refuses a pk_live_ publishable key even when the secret is test-mode", () => {
    assert.throws(
      () =>
        assertStripeTestMode({
          secretKey: "sk_test_abc",
          publishableKey: "pk_live_abc",
        }),
      (err: unknown) =>
        err instanceof PreviewSeedError && /pk_live_/.test(err.message),
    );
  });
});

const PROD_URL =
  "postgresql://app:secret@ep-abc.eu-west-2.aws.neon.tech:5432/guddesk";
const PREVIEW_URL =
  "postgresql://app:secret@ep-preview.eu-west-2.aws.neon.tech:5432/guddesk";

function refusesSameDatabase(env: NodeJS.Dict<string>) {
  assert.throws(
    () => resolvePreviewDatabaseUrl(env),
    (err: unknown) =>
      err instanceof PreviewSeedError &&
      /Refusing to seed/.test(err.message) &&
      /XSS test payloads/.test(err.message),
  );
}

describe("resolvePreviewDatabaseUrl", () => {
  it("uses PREVIEW_DATABASE_URL when it differs from production", () => {
    const resolved = resolvePreviewDatabaseUrl({
      PREVIEW_DATABASE_URL: PREVIEW_URL,
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
    assert.equal(resolved.url, PREVIEW_URL);
    assert.equal(resolved.source, "PREVIEW_DATABASE_URL");
  });

  it("ignores DATABASE_URL and refuses when PREVIEW_DATABASE_URL is unset", () => {
    assert.throws(
      () =>
        resolvePreviewDatabaseUrl({
          DATABASE_URL: PREVIEW_URL,
          PRODUCTION_DATABASE_URL: PROD_URL,
        }),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /PREVIEW_DATABASE_URL is required/.test(err.message),
    );
  });

  it("never returns DATABASE_URL even when both are set", () => {
    const resolved = resolvePreviewDatabaseUrl({
      DATABASE_URL: PROD_URL,
      PREVIEW_DATABASE_URL: PREVIEW_URL,
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
    assert.equal(resolved.url, PREVIEW_URL);
  });

  it("refuses when no production URL is set", () => {
    assert.throws(
      () => resolvePreviewDatabaseUrl({ PREVIEW_DATABASE_URL: PREVIEW_URL }),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /PRODUCTION_DATABASE_URL \(or PROD_DATABASE_URL\) is required/.test(
          err.message,
        ),
    );
  });

  it("refuses an identical URL in PRODUCTION_DATABASE_URL", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL: PROD_URL,
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
  });

  it("refuses an identical URL in PROD_DATABASE_URL", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL: PROD_URL,
      PROD_DATABASE_URL: PROD_URL,
    });
  });

  it("checks both production variables when both are set", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL: PROD_URL,
      PRODUCTION_DATABASE_URL: PREVIEW_URL.replace("guddesk", "other"),
      PROD_DATABASE_URL: PROD_URL,
    });
  });

  it("refuses the Neon pooler host of the production database", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL:
        "postgresql://app:secret@ep-abc-pooler.eu-west-2.aws.neon.tech:5432/guddesk?sslmode=require",
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
  });

  it("refuses when only host case, credentials, or query differ", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL:
        "postgresql://other:pw@EP-ABC.EU-WEST-2.aws.Neon.Tech/guddesk?sslmode=require",
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
  });

  it("treats a missing port as 5432", () => {
    refusesSameDatabase({
      PREVIEW_DATABASE_URL:
        "postgres://app:secret@ep-abc.eu-west-2.aws.neon.tech/guddesk",
      PRODUCTION_DATABASE_URL: PROD_URL,
    });
  });

  it("allows the same host with a different port", () => {
    assert.doesNotThrow(() =>
      resolvePreviewDatabaseUrl({
        PREVIEW_DATABASE_URL:
          "postgresql://app:secret@ep-abc.eu-west-2.aws.neon.tech:6543/guddesk",
        PRODUCTION_DATABASE_URL: PROD_URL,
      }),
    );
  });

  it("allows the same host with a different database name", () => {
    assert.doesNotThrow(() =>
      resolvePreviewDatabaseUrl({
        PREVIEW_DATABASE_URL:
          "postgresql://app:secret@ep-abc-pooler.eu-west-2.aws.neon.tech/guddesk_preview",
        PRODUCTION_DATABASE_URL: PROD_URL,
      }),
    );
  });

  it("refuses an unparseable URL", () => {
    assert.throws(
      () =>
        resolvePreviewDatabaseUrl({
          PREVIEW_DATABASE_URL: "not a url",
          PRODUCTION_DATABASE_URL: PROD_URL,
        }),
      PreviewSeedError,
    );
  });
});

describe("resolvePreviewDatabaseUrl bypasses (pg-connection-string parsing)", () => {
  const PREVIEW_BASE =
    "postgresql://app:secret@ep-preview.eu-west-2.aws.neon.tech:5432/guddesk";

  function refuses(env: NodeJS.Dict<string>, pattern: RegExp) {
    assert.throws(
      () => resolvePreviewDatabaseUrl(env),
      (err: unknown) =>
        err instanceof PreviewSeedError && pattern.test(err.message),
    );
  }

  for (const [param, value] of [
    ["host", "ep-abc.eu-west-2.aws.neon.tech"],
    ["hostaddr", "10.0.0.5"],
    ["port", "5433"],
    ["dbname", "guddesk"],
    ["database", "guddesk"],
    ["user", "neondb"],
    ["options", "-c search_path=public"],
    ["HOST", "ep-abc.eu-west-2.aws.neon.tech"],
  ] as const) {
    it(`refuses ?${param}= in PREVIEW_DATABASE_URL`, () => {
      refuses(
        {
          PREVIEW_DATABASE_URL: `${PREVIEW_BASE}?sslmode=require&${param}=${encodeURIComponent(value)}`,
          PRODUCTION_DATABASE_URL: PROD_URL,
        },
        new RegExp(`"${param}" query param`),
      );
    });
  }

  it("refuses ?host= in the production URL too", () => {
    refuses(
      {
        PREVIEW_DATABASE_URL: PREVIEW_BASE,
        PRODUCTION_DATABASE_URL: `${PROD_URL}?host=elsewhere.example`,
      },
      /PRODUCTION_DATABASE_URL has a "host" query param/,
    );
  });

  it("refuses a percent-encoded host (%2D)", () => {
    refuses(
      {
        PREVIEW_DATABASE_URL:
          "postgresql://app:secret@ep%2Dabc.eu-west-2.aws.neon.tech:5432/guddesk",
        PRODUCTION_DATABASE_URL: PROD_URL,
      },
      /percent-encoded host/,
    );
  });

  it("allows a percent-encoded password, since only the host part is checked", () => {
    assert.doesNotThrow(() =>
      resolvePreviewDatabaseUrl({
        PREVIEW_DATABASE_URL:
          "postgresql://app:p%40ss%2Dword@ep-preview.eu-west-2.aws.neon.tech/guddesk",
        PRODUCTION_DATABASE_URL: PROD_URL,
      }),
    );
  });

  it("refuses a preview URL with no database name (user neondb)", () => {
    for (const url of [
      "postgresql://neondb:secret@ep-abc.eu-west-2.aws.neon.tech",
      "postgresql://neondb:secret@ep-abc.eu-west-2.aws.neon.tech/",
      "postgresql://neondb:secret@ep-abc.eu-west-2.aws.neon.tech/?sslmode=require",
    ]) {
      refuses(
        {
          PREVIEW_DATABASE_URL: url,
          PRODUCTION_DATABASE_URL:
            "postgresql://neondb:secret@ep-abc.eu-west-2.aws.neon.tech/neondb",
        },
        /PREVIEW_DATABASE_URL must name the database explicitly/,
      );
    }
  });

  it("refuses a production URL with no database name", () => {
    refuses(
      {
        PREVIEW_DATABASE_URL: PREVIEW_BASE,
        PRODUCTION_DATABASE_URL:
          "postgresql://neondb:secret@ep-abc.eu-west-2.aws.neon.tech",
      },
      /PRODUCTION_DATABASE_URL must name the database explicitly/,
    );
  });

  it("refuses a socket host", () => {
    refuses(
      {
        PREVIEW_DATABASE_URL:
          "socket://app:secret@/var/run/postgresql?db=guddesk",
        PRODUCTION_DATABASE_URL: PROD_URL,
      },
      /postgresql:\/\/ or postgres:\/\//,
    );
  });
});

describe("normaliseDatabaseUrl", () => {
  it("lowercases the host, strips -pooler from the first label, and defaults the port", () => {
    assert.deepEqual(
      normaliseDatabaseUrl(
        "postgresql://u:p@EP-Abc-Pooler.Region.AWS.neon.tech/GudDesk",
        "X",
      ),
      {
        host: "ep-abc.region.aws.neon.tech",
        port: "5432",
        database: "guddesk",
      },
    );
  });

  it("only strips -pooler from the first host label", () => {
    assert.equal(
      normaliseDatabaseUrl("postgresql://u:p@db.my-pooler.example/x", "X").host,
      "db.my-pooler.example",
    );
  });
});

describe("parsePreviewSeedEnv", () => {
  it("fills default emails, slugs, and names for two owners and two agents", () => {
    const config = parse();
    assert.equal(config.ownerA.email, PREVIEW_SEED_DEFAULTS.ownerAEmail);
    assert.equal(config.ownerB.email, PREVIEW_SEED_DEFAULTS.ownerBEmail);
    assert.equal(config.agentA.email, PREVIEW_SEED_DEFAULTS.agentAEmail);
    assert.equal(config.agentB.email, PREVIEW_SEED_DEFAULTS.agentBEmail);
    assert.equal(config.workspaceA.slug, PREVIEW_SEED_DEFAULTS.workspaceASlug);
    assert.equal(config.workspaceB.slug, PREVIEW_SEED_DEFAULTS.workspaceBSlug);
    assert.equal(config.workspaceA.identitySecret, "hmac-secret-a");
    assert.equal(config.ownerA.passwordEnv, "PREVIEW_OWNER_A_PASSWORD");
    assert.equal(config.agentA.passwordEnv, "PREVIEW_AGENT_A_PASSWORD");
    assert.equal(config.agentB.passwordEnv, "PREVIEW_AGENT_B_PASSWORD");
  });

  it("honors email and slug overrides and lowercases emails", () => {
    const config = parse({
      PREVIEW_OWNER_A_EMAIL: "Owner.A@GudDesk.test",
      PREVIEW_AGENT_B_EMAIL: "Agent.B@guddesk.test",
      PREVIEW_WORKSPACE_B_SLUG: "preview-qa-b",
    });
    assert.equal(config.ownerA.email, "owner.a@guddesk.test");
    assert.equal(config.agentB.email, "agent.b@guddesk.test");
    assert.equal(config.workspaceB.slug, "preview-qa-b");
  });

  for (const key of [
    "PREVIEW_OWNER_A_EMAIL",
    "PREVIEW_OWNER_B_EMAIL",
    "PREVIEW_AGENT_A_EMAIL",
    "PREVIEW_AGENT_B_EMAIL",
  ]) {
    it(`refuses a ${key} outside @guddesk.test`, () => {
      for (const email of [
        "real.user@example.com",
        "qa@guddesk.test.example.com",
        "qa@sub.guddesk.test.evil",
        "@guddesk.test",
        "a@b@guddesk.test",
      ]) {
        assert.throws(
          () => parse({ [key]: email }),
          (err: unknown) =>
            err instanceof PreviewSeedError &&
            err.message.includes(key) &&
            /@guddesk\.test/.test(err.message),
          email,
        );
      }
    });
  }

  for (const key of ["PREVIEW_WORKSPACE_A_SLUG", "PREVIEW_WORKSPACE_B_SLUG"]) {
    it(`refuses a ${key} that does not start with preview-`, () => {
      for (const slug of ["acme", "qa-b", "preview", "preview-", "Preview-a"]) {
        assert.throws(
          () => parse({ [key]: slug }),
          (err: unknown) =>
            err instanceof PreviewSeedError &&
            err.message.includes(key) &&
            /preview-/.test(err.message),
          slug,
        );
      }
    });
  }

  it("refuses identical workspace A and B slugs", () => {
    assert.throws(
      () => parse({ PREVIEW_WORKSPACE_B_SLUG: "preview-a" }),
      PreviewSeedError,
    );
  });

  it("falls back to PREVIEW_AGENT_PASSWORD when per-workspace agent passwords are unset", () => {
    const config = parse({
      PREVIEW_AGENT_A_PASSWORD: undefined,
      PREVIEW_AGENT_B_PASSWORD: undefined,
      PREVIEW_AGENT_PASSWORD: "shared-agent-pass",
    });
    assert.equal(config.agentA.password, "shared-agent-pass");
    assert.equal(config.agentB.password, "shared-agent-pass");
    assert.equal(config.agentA.passwordEnv, "PREVIEW_AGENT_PASSWORD");
  });

  it("refuses to run without PREVIEW_SEED=1", () => {
    assert.throws(() => parse({ PREVIEW_SEED: undefined }), PreviewSeedError);
    assert.throws(() => parse({ PREVIEW_SEED: "true" }), PreviewSeedError);
  });

  it("refuses VERCEL_ENV=production", () => {
    assert.throws(
      () => parse({ VERCEL_ENV: "production" }),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /VERCEL_ENV=production/.test(err.message) &&
        /XSS test payloads/.test(err.message),
    );
  });

  it("refuses VERCEL_ENV values other than preview, in any case", () => {
    for (const value of [
      " Production ",
      "PRODUCTION",
      "development",
      "Development",
      "staging",
      "prev",
    ]) {
      assert.throws(
        () => parse({ VERCEL_ENV: value }),
        PreviewSeedError,
        value,
      );
    }
  });

  it("allows VERCEL_ENV unset, empty, or preview in any case", () => {
    for (const value of [
      undefined,
      "",
      "  ",
      "preview",
      " Preview ",
      "PREVIEW",
    ]) {
      assert.doesNotThrow(() => parse({ VERCEL_ENV: value }), String(value));
    }
  });

  it("refuses a live Stripe secret from env", () => {
    assert.throws(
      () => parse({ STRIPE_SECRET_KEY: "sk_live_not_for_preview" }),
      PreviewSeedError,
    );
  });

  it("refuses a password shorter than 8 characters", () => {
    assert.throws(
      () => parse({ PREVIEW_AGENT_A_PASSWORD: "short" }),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /PREVIEW_AGENT_A_PASSWORD must be at least 8/.test(err.message),
    );
  });

  it("refuses a missing workspace A identity secret", () => {
    assert.throws(
      () => parse({ PREVIEW_WORKSPACE_A_IDENTITY_SECRET: "  " }),
      PreviewSeedError,
    );
  });
});

function memoryStore(): PreviewSeedStore & {
  users: Map<string, { id: string; name: string; passwordHash: string }>;
  workspaces: Map<string, { id: string; name: string }>;
  widgets: Map<
    string,
    { workspaceName: string; identitySecret: string | null }
  >;
  members: Map<string, { id: string; role: "OWNER" | "AGENT" }>;
  collections: Map<string, { id: string; slug: string }>;
  articles: Map<string, { slug: string; title: string }>;
  visitors: Map<string, { id: string; externalId: string }>;
  conversations: Map<
    string,
    { id: string; created: boolean; messages: PreviewSeedMessage[] }
  >;
} {
  let nextId = 1;
  const users = new Map<
    string,
    { id: string; name: string; passwordHash: string }
  >();
  const workspaces = new Map<string, { id: string; name: string }>();
  const widgets = new Map<
    string,
    { workspaceName: string; identitySecret: string | null }
  >();
  const members = new Map<string, { id: string; role: "OWNER" | "AGENT" }>();
  const collections = new Map<string, { id: string; slug: string }>();
  const articles = new Map<string, { slug: string; title: string }>();
  const visitors = new Map<string, { id: string; externalId: string }>();
  const conversations = new Map<
    string,
    { id: string; created: boolean; messages: PreviewSeedMessage[] }
  >();

  return {
    async findNonPreviewWorkspaceSlug() {
      for (const slug of workspaces.keys()) {
        if (!slug.startsWith("preview-")) return slug;
      }
      return null;
    },
    users,
    workspaces,
    widgets,
    members,
    collections,
    articles,
    visitors,
    conversations,
    async upsertUser({ email, name, passwordHash }) {
      const existing = users.get(email);
      if (existing) {
        existing.name = name;
        existing.passwordHash = passwordHash;
        return { id: existing.id };
      }
      const id = `user_${nextId++}`;
      users.set(email, { id, name, passwordHash });
      return { id };
    },
    async upsertWorkspace({ slug, name }) {
      const existing = workspaces.get(slug);
      if (existing) {
        existing.name = name;
        return { id: existing.id };
      }
      const id = `ws_${nextId++}`;
      workspaces.set(slug, { id, name });
      return { id };
    },
    async upsertWidgetSettings({ workspaceId, workspaceName, identitySecret }) {
      widgets.set(workspaceId, { workspaceName, identitySecret });
    },
    async upsertMember({ workspaceId, userId, role }) {
      const key = `${workspaceId}:${userId}`;
      const existing = members.get(key);
      if (existing) {
        existing.role = role;
        return { id: existing.id };
      }
      const id = `mem_${nextId++}`;
      members.set(key, { id, role });
      return { id };
    },
    async upsertCollection({ workspaceId, slug }) {
      const key = `${workspaceId}:${slug}`;
      const existing = collections.get(key);
      if (existing) return { id: existing.id };
      const id = `col_${nextId++}`;
      collections.set(key, { id, slug });
      return { id };
    },
    async upsertArticle({ workspaceId, slug, title }) {
      const key = `${workspaceId}:${slug}`;
      const existing = articles.get(key);
      if (existing) {
        existing.title = title;
        return { id: existing.slug };
      }
      const id = `art_${nextId++}`;
      articles.set(key, { slug, title });
      return { id };
    },
    async upsertVisitor({ workspaceId, externalId }) {
      const key = `${workspaceId}:${externalId}`;
      const existing = visitors.get(key);
      if (existing) return { id: existing.id };
      const id = `vis_${nextId++}`;
      visitors.set(key, { id, externalId });
      return { id };
    },
    async upsertConversation({ visitorId, messages }) {
      const existing = conversations.get(visitorId);
      if (existing) return { id: existing.id, created: false };
      const id = `convo_${nextId++}`;
      conversations.set(visitorId, {
        id,
        created: true,
        messages: [...messages],
      });
      return { id, created: true };
    },
  };
}

describe("seedPreviewAccounts", () => {
  it("creates two owners, one agent per workspace, HMAC on A only, KB, inbox, and is idempotent", async () => {
    const store = memoryStore();
    const config = parse();
    const hash = async (password: string) => `hash:${password}`;

    const first = await seedPreviewAccounts(store, config, hash);
    const second = await seedPreviewAccounts(store, config, hash);

    assert.equal(first.ownerA.id, second.ownerA.id);
    assert.equal(first.workspaceA.id, second.workspaceA.id);
    assert.equal(first.agentA.id, second.agentA.id);
    assert.equal(first.agentB.id, second.agentB.id);
    assert.equal(store.users.size, 4);
    assert.equal(store.workspaces.size, 2);
    assert.equal(store.members.size, 4);
    assert.equal(store.articles.size, PREVIEW_KB_ARTICLES.length * 2);
    assert.equal(store.conversations.size, PREVIEW_SAMPLE_THREADS.length * 2);
    assert.equal(first.articleCount, PREVIEW_KB_ARTICLES.length * 2);
    assert.equal(first.conversationCount, PREVIEW_SAMPLE_THREADS.length * 2);

    const widgetA = store.widgets.get(first.workspaceA.id);
    const widgetB = store.widgets.get(first.workspaceB.id);
    assert.equal(widgetA?.identitySecret, "hmac-secret-a");
    assert.equal(widgetB?.identitySecret, null);

    assert.equal(
      store.members.get(`${first.workspaceA.id}:${first.ownerA.id}`)?.role,
      "OWNER",
    );
    assert.equal(
      store.members.get(`${first.workspaceB.id}:${first.ownerB.id}`)?.role,
      "OWNER",
    );
    assert.equal(
      store.members.get(`${first.workspaceA.id}:${first.agentA.id}`)?.role,
      "AGENT",
    );
    assert.equal(
      store.members.get(`${first.workspaceB.id}:${first.agentB.id}`)?.role,
      "AGENT",
    );
    assert.equal(
      store.members.has(`${first.workspaceA.id}:${first.agentB.id}`),
      false,
    );
    assert.equal(
      store.members.has(`${first.workspaceB.id}:${first.agentA.id}`),
      false,
    );

    assert.equal(first.workspaceA.identitySecretSet, true);
    assert.equal(first.workspaceB.identitySecretSet, false);
    assert.ok(
      store.collections.has(
        `${first.workspaceA.id}:${PREVIEW_COLLECTION_SLUG}`,
      ),
    );
  });

  it("does not rewrite existing conversation messages on a later run", async () => {
    const store = memoryStore();
    const config = parse();
    const first = await seedPreviewAccounts(store, config, async (p) => p);
    const visitorKey = `${first.workspaceA.id}:${PREVIEW_SAMPLE_THREADS[0].visitorExternalId}`;
    const visitor = store.visitors.get(visitorKey);
    assert.ok(visitor);
    const conversation = store.conversations.get(visitor.id);
    assert.ok(conversation);
    conversation.messages.push({
      type: "VISITOR",
      body: "<script>alert(1)</script>",
    });

    await seedPreviewAccounts(store, config, async (p) => p);
    const after = store.conversations.get(visitor.id);
    assert.equal(after?.id, conversation.id);
    assert.equal(
      after?.messages.some((message) =>
        message.body.includes("<script>alert(1)</script>"),
      ),
      true,
    );
  });

  it("clears workspace B identity secret on a later run", async () => {
    const store = memoryStore();
    const config = parse();
    const first = await seedPreviewAccounts(store, config, async (p) => p);
    await store.upsertWidgetSettings({
      workspaceId: first.workspaceB.id,
      workspaceName: config.workspaceB.name,
      identitySecret: "should-be-cleared",
    });
    await seedPreviewAccounts(store, config, async (p) => p);
    assert.equal(store.widgets.get(first.workspaceB.id)?.identitySecret, null);
  });
});

describe("in-DB production guard", () => {
  it("refuses before any write when a non-preview workspace exists", async () => {
    const store = memoryStore();
    store.workspaces.set("preview-a", { id: "ws_a", name: "A" });
    store.workspaces.set("acme", { id: "ws_prod", name: "Acme" });
    const config = parse();

    await assert.rejects(
      seedPreviewAccounts(store, config, async (p) => p),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /"acme"/.test(err.message) &&
        /preview-/.test(err.message),
    );
    assert.equal(store.users.size, 0);
    assert.equal(store.workspaces.size, 2);
    assert.equal(store.workspaces.get("preview-a")?.name, "A");
    assert.equal(store.widgets.size, 0);
    assert.equal(store.members.size, 0);
    assert.equal(store.collections.size, 0);
    assert.equal(store.articles.size, 0);
    assert.equal(store.visitors.size, 0);
    assert.equal(store.conversations.size, 0);
  });

  it("passes on an empty database", async () => {
    await assert.doesNotReject(assertPreviewDatabase(memoryStore()));
  });

  it("passes when only preview- workspaces exist, so re-runs work", async () => {
    const store = memoryStore();
    const config = parse();
    await seedPreviewAccounts(store, config, async (p) => p);
    await assert.doesNotReject(assertPreviewDatabase(store));
    await assert.doesNotReject(
      seedPreviewAccounts(store, config, async (p) => p),
    );
  });

  it("treats a slug that only contains preview- as non-preview", async () => {
    const store = memoryStore();
    store.workspaces.set("my-preview-a", { id: "ws_x", name: "X" });
    await assert.rejects(assertPreviewDatabase(store), PreviewSeedError);
  });

  it("refuses a hand-built config with a non-preview slug or email", async () => {
    const store = memoryStore();
    const base = parse();
    await assert.rejects(
      seedPreviewAccounts(
        store,
        { ...base, workspaceB: { ...base.workspaceB, slug: "acme" } },
        async (p) => p,
      ),
      PreviewSeedError,
    );
    await assert.rejects(
      seedPreviewAccounts(
        store,
        { ...base, ownerA: { ...base.ownerA, email: "ceo@acme.com" } },
        async (p) => p,
      ),
      PreviewSeedError,
    );
    assert.equal(store.users.size, 0);
    assert.equal(store.workspaces.size, 0);
  });
});

describe("formatPreviewSeedReport", () => {
  it("prints login emails and password env names, never password values", () => {
    const config = parse();
    const report = formatPreviewSeedReport(
      config,
      {
        ownerA: { id: "1", email: config.ownerA.email },
        ownerB: { id: "2", email: config.ownerB.email },
        agentA: { id: "3", email: config.agentA.email },
        agentB: { id: "4", email: config.agentB.email },
        workspaceA: {
          id: "a",
          slug: config.workspaceA.slug,
          identitySecretSet: true,
        },
        workspaceB: {
          id: "b",
          slug: config.workspaceB.slug,
          identitySecretSet: false,
        },
        articleCount: 6,
        conversationCount: 4,
      },
      "PREVIEW_DATABASE_URL",
    );

    assert.match(report, /qa-owner-a@guddesk\.test/);
    assert.match(report, /qa-owner-b@guddesk\.test/);
    assert.match(report, /qa-agent-a@guddesk\.test/);
    assert.match(report, /qa-agent-b@guddesk\.test/);
    assert.match(report, /PREVIEW_OWNER_A_PASSWORD/);
    assert.match(report, /PREVIEW_AGENT_A_PASSWORD/);
    assert.match(report, /HMAC secret: set/);
    assert.match(report, /HMAC secret: unset/);
    assert.match(report, /XSS test payloads/);
    assert.match(report, /PREVIEW_DATABASE_URL/);
    assert.equal(report.includes("owner-a-pass"), false);
    assert.equal(report.includes("hmac-secret-a"), false);
    assert.equal(report.includes("sk_test_preview_seed"), false);
    assert.equal(report.includes("agent-a-pass"), false);
  });
});
