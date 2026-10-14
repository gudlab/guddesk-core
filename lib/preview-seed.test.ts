import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertStripeTestMode,
  formatPreviewSeedReport,
  parsePreviewSeedEnv,
  PREVIEW_SEED_DEFAULTS,
  PreviewSeedError,
  seedPreviewAccounts,
  type PreviewSeedConfig,
  type PreviewSeedStore,
} from "./preview-seed";

const VALID_ENV: NodeJS.Dict<string> = {
  PREVIEW_SEED: "1",
  PREVIEW_OWNER_A_PASSWORD: "owner-a-pass",
  PREVIEW_OWNER_B_PASSWORD: "owner-b-pass",
  PREVIEW_AGENT_PASSWORD: "agent-pass-1",
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

describe("parsePreviewSeedEnv", () => {
  it("fills default emails, slugs, and names", () => {
    const config = parse();
    assert.equal(config.ownerA.email, PREVIEW_SEED_DEFAULTS.ownerAEmail);
    assert.equal(config.ownerB.email, PREVIEW_SEED_DEFAULTS.ownerBEmail);
    assert.equal(config.agent.email, PREVIEW_SEED_DEFAULTS.agentEmail);
    assert.equal(config.workspaceA.slug, PREVIEW_SEED_DEFAULTS.workspaceASlug);
    assert.equal(config.workspaceB.slug, PREVIEW_SEED_DEFAULTS.workspaceBSlug);
    assert.equal(config.workspaceA.identitySecret, "hmac-secret-a");
    assert.equal(config.ownerA.passwordEnv, "PREVIEW_OWNER_A_PASSWORD");
    assert.equal(config.ownerB.passwordEnv, "PREVIEW_OWNER_B_PASSWORD");
    assert.equal(config.agent.passwordEnv, "PREVIEW_AGENT_PASSWORD");
  });

  it("honors email and slug overrides and lowercases emails", () => {
    const config = parse({
      PREVIEW_OWNER_A_EMAIL: "Owner.A@Example.com",
      PREVIEW_WORKSPACE_B_SLUG: "qa-b",
    });
    assert.equal(config.ownerA.email, "owner.a@example.com");
    assert.equal(config.workspaceB.slug, "qa-b");
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
        /VERCEL_ENV=production/.test(err.message),
    );
  });

  it("allows VERCEL_ENV=preview", () => {
    assert.doesNotThrow(() => parse({ VERCEL_ENV: "preview" }));
  });

  it("refuses a live Stripe secret from env", () => {
    assert.throws(
      () => parse({ STRIPE_SECRET_KEY: "sk_live_not_for_preview" }),
      PreviewSeedError,
    );
  });

  it("refuses a password shorter than 8 characters", () => {
    assert.throws(
      () => parse({ PREVIEW_AGENT_PASSWORD: "short" }),
      (err: unknown) =>
        err instanceof PreviewSeedError &&
        /PREVIEW_AGENT_PASSWORD must be at least 8/.test(err.message),
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
  widgets: Map<string, { workspaceName: string; identitySecret: string | null }>;
  members: Map<string, "OWNER" | "AGENT">;
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
  const members = new Map<string, "OWNER" | "AGENT">();

  return {
    users,
    workspaces,
    widgets,
    members,
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
      members.set(`${workspaceId}:${userId}`, role);
    },
  };
}

describe("seedPreviewAccounts", () => {
  it("creates two owners, one shared agent, HMAC on A only, and is idempotent", async () => {
    const store = memoryStore();
    const config = parse();
    const hash = async (password: string) => `hash:${password}`;

    const first = await seedPreviewAccounts(store, config, hash);
    const second = await seedPreviewAccounts(store, config, hash);

    assert.equal(first.ownerA.id, second.ownerA.id);
    assert.equal(first.workspaceA.id, second.workspaceA.id);
    assert.equal(store.users.size, 3);
    assert.equal(store.workspaces.size, 2);
    assert.equal(store.members.size, 4);

    const widgetA = store.widgets.get(first.workspaceA.id);
    const widgetB = store.widgets.get(first.workspaceB.id);
    assert.equal(widgetA?.identitySecret, "hmac-secret-a");
    assert.equal(widgetB?.identitySecret, null);

    assert.equal(
      store.members.get(`${first.workspaceA.id}:${first.ownerA.id}`),
      "OWNER",
    );
    assert.equal(
      store.members.get(`${first.workspaceB.id}:${first.ownerB.id}`),
      "OWNER",
    );
    assert.equal(
      store.members.get(`${first.workspaceA.id}:${first.agent.id}`),
      "AGENT",
    );
    assert.equal(
      store.members.get(`${first.workspaceB.id}:${first.agent.id}`),
      "AGENT",
    );

    assert.equal(first.workspaceA.identitySecretSet, true);
    assert.equal(first.workspaceB.identitySecretSet, false);
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

describe("formatPreviewSeedReport", () => {
  it("prints login emails and password env names, never password values", () => {
    const config = parse();
    const report = formatPreviewSeedReport(config, {
      ownerA: { id: "1", email: config.ownerA.email },
      ownerB: { id: "2", email: config.ownerB.email },
      agent: { id: "3", email: config.agent.email },
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
    });

    assert.match(report, /qa-owner-a@guddesk\.test/);
    assert.match(report, /qa-owner-b@guddesk\.test/);
    assert.match(report, /qa-agent@guddesk\.test/);
    assert.match(report, /PREVIEW_OWNER_A_PASSWORD/);
    assert.match(report, /HMAC secret: set/);
    assert.match(report, /HMAC secret: unset/);
    assert.equal(report.includes("owner-a-pass"), false);
    assert.equal(report.includes("hmac-secret-a"), false);
    assert.equal(report.includes("sk_test_preview_seed"), false);
  });
});
