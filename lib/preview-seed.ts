/**
 * Idempotent Preview QA seed: two workspaces, each with an owner and its own
 * agent, HMAC identity secret on workspace A only, Stripe test-mode keys
 * only, plus sample KB articles and conversations.
 *
 * Credentials come from env. This module never prints passwords, identity
 * secrets, or Stripe keys. Preview may receive XSS test payloads. Never
 * point the seed at production data.
 *
 * Safety guards, all checked before any write:
 * - PREVIEW_SEED must be "1".
 * - VERCEL_ENV must be unset, empty, or "preview" (trimmed, any case).
 * - Stripe keys must be test-mode keys.
 * - Every seeded login email must end in @guddesk.test and every seeded
 *   workspace slug must start with "preview-", even when overridden from env.
 *   The upserts reset passwords and identity secrets, so they must never
 *   match a real user or a real workspace.
 * - The database URL comes only from PREVIEW_DATABASE_URL. There is no
 *   DATABASE_URL fallback. PRODUCTION_DATABASE_URL (or PROD_DATABASE_URL)
 *   must also be set. Both URLs are parsed with pg-connection-string, the
 *   parser pg itself uses, so the guard sees the host, port, and database
 *   that pg will really connect to. The seed refuses when both point at the
 *   same database after normalising host (lowercased, Neon "-pooler" suffix
 *   stripped from the first label), port (default 5432), and database name.
 *   It also refuses either URL outright when it has a query param that
 *   overrides the target (host, hostaddr, port, dbname, database, db, user,
 *   options), a "%" in the host part, or no explicit database name
 *   (Postgres would default the database to the user name).
 * - In-DB guard: before the first write the seed asks the store for any
 *   workspace whose slug does not start with "preview-". If one exists, the
 *   target holds real data, so the seed stops. A dedicated Preview database
 *   only ever holds preview- workspaces.
 */

import { parse as parsePgConnectionString } from "pg-connection-string";

export const PREVIEW_SEED_DEFAULTS = {
  ownerAEmail: "qa-owner-a@guddesk.test",
  ownerBEmail: "qa-owner-b@guddesk.test",
  agentAEmail: "qa-agent-a@guddesk.test",
  agentBEmail: "qa-agent-b@guddesk.test",
  ownerAName: "QA Owner A",
  ownerBName: "QA Owner B",
  agentAName: "QA Agent A",
  agentBName: "QA Agent B",
  workspaceASlug: "preview-a",
  workspaceBSlug: "preview-b",
  workspaceAName: "Preview Workspace A",
  workspaceBName: "Preview Workspace B",
} as const;

export const PREVIEW_PASSWORD_ENV = {
  ownerA: "PREVIEW_OWNER_A_PASSWORD",
  ownerB: "PREVIEW_OWNER_B_PASSWORD",
  agentA: "PREVIEW_AGENT_A_PASSWORD",
  agentB: "PREVIEW_AGENT_B_PASSWORD",
  agentShared: "PREVIEW_AGENT_PASSWORD",
} as const;

export const PREVIEW_COLLECTION_SLUG = "getting-started";

export const PREVIEW_KB_ARTICLES = [
  {
    slug: "reset-password",
    title: "Reset your password",
    excerpt: "How a teammate resets a login password.",
    body: "Open /login, choose Forgot password, and use the email for that account. Preview QA accounts use passwords from env vars, not this flow.",
    order: 0,
  },
  {
    slug: "install-widget",
    title: "Install the chat widget",
    excerpt: "Snippet for embedding the widget on a test page.",
    body: "Copy the workspace App ID from Settings → Widget. Load /widget.js on a test origin. Workspace A requires a valid identity HMAC. Workspace B does not.",
    order: 1,
  },
  {
    slug: "billing-and-plans",
    title: "Billing and plans",
    excerpt: "Cloud plans for Preview billing tests.",
    body: "Free is the default after seed. Checkout uses Stripe test mode only. Do not use live keys on Preview.",
    order: 2,
  },
] as const;

export const PREVIEW_SAMPLE_THREADS = [
  {
    seedKey: "open",
    visitorExternalId: "preview-seed-open",
    visitorName: "Sam Rivera",
    visitorEmail: "sam.rivera@example.test",
    status: "OPEN" as const,
    subject: "Widget not loading on checkout",
    visitorMessage:
      "The chat bubble does not show on the checkout page after a refresh.",
    agentMessage: "Thanks Sam. Checking the snippet on that URL next.",
  },
  {
    seedKey: "closed",
    visitorExternalId: "preview-seed-closed",
    visitorName: "Jordan Lee",
    visitorEmail: "jordan.lee@example.test",
    status: "CLOSED" as const,
    subject: "How do I change the welcome message?",
    visitorMessage: "Where is the welcome message edited?",
    agentMessage: "Settings → Widget → Welcome message. Closing this out.",
  },
] as const;

const MIN_PASSWORD_LENGTH = 8;

export const PREVIEW_EMAIL_DOMAIN = "@guddesk.test";
export const PREVIEW_SLUG_PREFIX = "preview-";
const DEFAULT_POSTGRES_PORT = "5432";

export class PreviewSeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreviewSeedError";
  }
}

export type PreviewSeedAccount = {
  email: string;
  name: string;
  password: string;
  passwordEnv: string;
};

export type PreviewSeedConfig = {
  ownerA: PreviewSeedAccount;
  ownerB: PreviewSeedAccount;
  agentA: PreviewSeedAccount;
  agentB: PreviewSeedAccount;
  workspaceA: {
    slug: string;
    name: string;
    identitySecret: string;
  };
  workspaceB: {
    slug: string;
    name: string;
  };
  stripeSecretKey: string;
  stripePublishableKey?: string;
};

export type PreviewSeedMessage = {
  type: "VISITOR" | "AGENT";
  body: string;
  senderId?: string;
  senderName?: string;
};

export type PreviewSeedStore = {
  /**
   * Read-only lookup used by the in-DB guard before any write. Returns the
   * slug of any workspace that does not start with "preview-", or null.
   */
  findNonPreviewWorkspaceSlug(): Promise<string | null>;
  upsertUser(input: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<{ id: string }>;
  upsertWorkspace(input: {
    slug: string;
    name: string;
  }): Promise<{ id: string }>;
  upsertWidgetSettings(input: {
    workspaceId: string;
    workspaceName: string;
    identitySecret: string | null;
  }): Promise<void>;
  upsertMember(input: {
    workspaceId: string;
    userId: string;
    role: "OWNER" | "AGENT";
  }): Promise<{ id: string }>;
  upsertCollection(input: {
    workspaceId: string;
    slug: string;
    name: string;
    description: string;
  }): Promise<{ id: string }>;
  upsertArticle(input: {
    workspaceId: string;
    collectionId: string;
    slug: string;
    title: string;
    body: string;
    excerpt: string;
    authorId: string;
    order: number;
  }): Promise<{ id: string }>;
  upsertVisitor(input: {
    workspaceId: string;
    externalId: string;
    name: string;
    email: string;
  }): Promise<{ id: string }>;
  upsertConversation(input: {
    workspaceId: string;
    visitorId: string;
    assigneeMemberId: string;
    status: "OPEN" | "CLOSED";
    subject: string;
    lastMessagePreview: string;
    messages: PreviewSeedMessage[];
  }): Promise<{ id: string; created: boolean }>;
};

export type PreviewSeedResult = {
  ownerA: { id: string; email: string };
  ownerB: { id: string; email: string };
  agentA: { id: string; email: string };
  agentB: { id: string; email: string };
  workspaceA: { id: string; slug: string; identitySecretSet: true };
  workspaceB: { id: string; slug: string; identitySecretSet: false };
  articleCount: number;
  conversationCount: number;
};

export function isStripeTestSecretKey(key: string): boolean {
  return key.startsWith("sk_test_") || key.startsWith("rk_test_");
}

export function isStripeLiveSecretKey(key: string): boolean {
  return key.startsWith("sk_live_") || key.startsWith("rk_live_");
}

export function isStripeTestPublishableKey(key: string): boolean {
  return key.startsWith("pk_test_");
}

export function isStripeLivePublishableKey(key: string): boolean {
  return key.startsWith("pk_live_");
}

export function assertStripeTestMode(opts: {
  secretKey?: string;
  publishableKey?: string;
}): void {
  const secret = opts.secretKey?.trim() ?? "";
  if (!secret) {
    throw new PreviewSeedError(
      "STRIPE_SECRET_KEY is required. Use a Stripe test-mode secret (sk_test_ or rk_test_). Live keys are refused.",
    );
  }
  if (isStripeLiveSecretKey(secret)) {
    throw new PreviewSeedError(
      "STRIPE_SECRET_KEY is a live key. Preview seed refuses sk_live_ / rk_live_. Set a test-mode key instead.",
    );
  }
  if (!isStripeTestSecretKey(secret)) {
    throw new PreviewSeedError(
      "STRIPE_SECRET_KEY must start with sk_test_ or rk_test_. Preview seed does not run against live Stripe.",
    );
  }

  const publishable = opts.publishableKey?.trim() ?? "";
  if (!publishable) return;
  if (isStripeLivePublishableKey(publishable)) {
    throw new PreviewSeedError(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is a live key (pk_live_). Preview seed refuses live Stripe keys.",
    );
  }
  if (!isStripeTestPublishableKey(publishable)) {
    throw new PreviewSeedError(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ when set.",
    );
  }
}

export type NormalisedDatabaseTarget = {
  host: string;
  port: string;
  database: string;
};

/**
 * Query params that pg-connection-string copies onto the pg config and that
 * change which server, database, or role pg connects as. Any of them makes
 * the URL refused outright, so the guard never has to reason about them.
 */
export const FORBIDDEN_DATABASE_URL_PARAMS = [
  "host",
  "hostaddr",
  "port",
  "dbname",
  "database",
  "db",
  "user",
  "options",
] as const;

/**
 * Parse a Postgres URL the way pg does (pg-connection-string) and reduce it
 * to the parts that identify the target database: host (lowercased, with a
 * Neon style "-pooler" suffix removed from the first label), port (the URL's
 * port, else `defaultPort`, which the caller sets from PGPORT the same way pg
 * does, else 5432), and database name (lowercased, so a case-only difference still
 * counts as the same database).
 *
 * Refuses: non postgres URLs, target-changing query params, a "%" or ","
 * in the host part (a "," lists several hosts), a missing host, a socket
 * host, and a missing database name.
 */
export function normaliseDatabaseUrl(
  raw: string,
  label: string,
  defaultPort: string = DEFAULT_POSTGRES_PORT,
): NormalisedDatabaseTarget {
  const value = raw.trim();
  const scheme = /^postgres(?:ql)?:\/\//i.exec(value);
  if (!scheme) {
    throw new PreviewSeedError(
      `${label} must be a postgresql:// or postgres:// URL.`,
    );
  }

  const rest = value.slice(scheme[0].length);
  const authority = rest.split(/[/?#]/, 1)[0] ?? "";
  const hostPart = authority.slice(authority.lastIndexOf("@") + 1);
  if (hostPart.includes("%")) {
    throw new PreviewSeedError(
      `${label} has a percent-encoded host. Write the host in plain text.`,
    );
  }
  if (hostPart.includes(",")) {
    throw new PreviewSeedError(
      `${label} lists more than one host. Use a single host.`,
    );
  }

  const queryStart = value.indexOf("?");
  if (queryStart !== -1) {
    const query = value.slice(queryStart + 1).split("#", 1)[0] ?? "";
    for (const key of new URLSearchParams(query).keys()) {
      const lowered = key.toLowerCase();
      if (
        (FORBIDDEN_DATABASE_URL_PARAMS as readonly string[]).includes(lowered)
      ) {
        throw new PreviewSeedError(
          `${label} has a "${key}" query param. Refusing URLs whose query string can change the host, port, database, or user.`,
        );
      }
    }
  }

  let config: ReturnType<typeof parsePgConnectionString>;
  try {
    config = parsePgConnectionString(value);
  } catch {
    throw new PreviewSeedError(`${label} is not a valid database URL.`);
  }

  const rawHost = (config.host ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (!rawHost || rawHost.startsWith("/")) {
    throw new PreviewSeedError(`${label} must name a network host.`);
  }
  const labels = rawHost.split(".");
  labels[0] = labels[0].replace(/-pooler$/, "");
  const host = labels.join(".");

  const port = String(config.port || defaultPort);
  if (!/^\d+$/.test(port)) {
    throw new PreviewSeedError(`${label} has an invalid port.`);
  }

  const database = (config.database ?? "").trim();
  if (!database) {
    throw new PreviewSeedError(
      `${label} must name the database explicitly (for example /guddesk). Without it Postgres uses the user name as the database.`,
    );
  }

  return { host, port, database: database.toLowerCase() };
}

export function isSameDatabaseTarget(
  a: NormalisedDatabaseTarget,
  b: NormalisedDatabaseTarget,
): boolean {
  return a.host === b.host && a.port === b.port && a.database === b.database;
}

/**
 * The seed only ever uses PREVIEW_DATABASE_URL. DATABASE_URL is ignored on
 * purpose, so a local .env.local that points DATABASE_URL at production can
 * never be picked up. A production URL must also be set so the seed can
 * prove the two targets differ. Preview may receive XSS test payloads.
 */
export function resolvePreviewDatabaseUrl(env: NodeJS.Dict<string>): {
  url: string;
  source: "PREVIEW_DATABASE_URL";
} {
  const url = env.PREVIEW_DATABASE_URL?.trim() ?? "";
  if (!url) {
    throw new PreviewSeedError(
      "PREVIEW_DATABASE_URL is required. Point it at a dedicated Preview Postgres database. DATABASE_URL is never used by the seed. Never point the seed at production. Preview may receive XSS test payloads.",
    );
  }

  const productionKeys = (
    ["PRODUCTION_DATABASE_URL", "PROD_DATABASE_URL"] as const
  ).filter((key) => env[key]?.trim());
  if (productionKeys.length === 0) {
    throw new PreviewSeedError(
      "PRODUCTION_DATABASE_URL (or PROD_DATABASE_URL) is required so the seed can check that PREVIEW_DATABASE_URL is not the production database. The value is only compared, never connected to.",
    );
  }

  // pg falls back to PGPORT when a URL has no port, so compare with it too.
  const pgPort = env.PGPORT?.trim();
  if (pgPort && !/^\d+$/.test(pgPort)) {
    throw new PreviewSeedError("PGPORT must be a port number when set.");
  }
  const defaultPort = pgPort || DEFAULT_POSTGRES_PORT;

  const previewTarget = normaliseDatabaseUrl(
    url,
    "PREVIEW_DATABASE_URL",
    defaultPort,
  );
  for (const key of productionKeys) {
    const productionTarget = normaliseDatabaseUrl(env[key]!, key, defaultPort);
    if (isSameDatabaseTarget(previewTarget, productionTarget)) {
      throw new PreviewSeedError(
        `Refusing to seed: PREVIEW_DATABASE_URL points at the same host, port, and database as ${key}. Preview may receive XSS test payloads. Point PREVIEW_DATABASE_URL at a separate database.`,
      );
    }
  }

  return { url, source: "PREVIEW_DATABASE_URL" };
}

export function assertPreviewEmail(email: string, key: string): void {
  const local = email.slice(0, -PREVIEW_EMAIL_DOMAIN.length);
  if (!email.endsWith(PREVIEW_EMAIL_DOMAIN) || !local || local.includes("@")) {
    throw new PreviewSeedError(
      `${key} must be an address ending in ${PREVIEW_EMAIL_DOMAIN}. The seed resets passwords, so it only touches synthetic QA accounts.`,
    );
  }
}

export function assertPreviewSlug(slug: string, key: string): void {
  if (
    !slug.startsWith(PREVIEW_SLUG_PREFIX) ||
    slug.length === PREVIEW_SLUG_PREFIX.length
  ) {
    throw new PreviewSeedError(
      `${key} must start with "${PREVIEW_SLUG_PREFIX}". The seed overwrites widget identity secrets, so it only touches Preview workspaces.`,
    );
  }
}

export function assertPreviewVercelEnv(value: string | undefined): void {
  const normalised = value?.trim().toLowerCase() ?? "";
  if (normalised === "" || normalised === "preview") return;
  throw new PreviewSeedError(
    `Refusing to seed: VERCEL_ENV=${value?.trim()}. Only an unset VERCEL_ENV or VERCEL_ENV=preview is allowed. Preview may receive XSS test payloads.`,
  );
}

/**
 * In-DB guard. Runs before any write. A dedicated Preview database only
 * holds preview- workspaces, so any other workspace means the target holds
 * real data (production or a copy of it) and the seed stops.
 */
export async function assertPreviewDatabase(
  store: Pick<PreviewSeedStore, "findNonPreviewWorkspaceSlug">,
): Promise<void> {
  const slug = await store.findNonPreviewWorkspaceSlug();
  if (slug !== null) {
    throw new PreviewSeedError(
      `Refusing to seed: this database has workspace "${slug}", which does not start with "${PREVIEW_SLUG_PREFIX}". A Preview database must only hold ${PREVIEW_SLUG_PREFIX} workspaces. Preview may receive XSS test payloads.`,
    );
  }
}

function requireEnv(env: NodeJS.Dict<string>, key: string): string {
  const value = env[key]?.trim() ?? "";
  if (!value) {
    throw new PreviewSeedError(`${key} is required and must not be empty.`);
  }
  return value;
}

function optionalEnv(
  env: NodeJS.Dict<string>,
  key: string,
  fallback: string,
): string {
  const value = env[key]?.trim();
  return value ? value : fallback;
}

function requirePassword(env: NodeJS.Dict<string>, key: string): string {
  const value = requireEnv(env, key);
  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new PreviewSeedError(
      `${key} must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  return value;
}

function requireAgentPassword(
  env: NodeJS.Dict<string>,
  specificKey: string,
): { password: string; passwordEnv: string } {
  const specific = env[specificKey]?.trim() ?? "";
  if (specific) {
    if (specific.length < MIN_PASSWORD_LENGTH) {
      throw new PreviewSeedError(
        `${specificKey} must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }
    return { password: specific, passwordEnv: specificKey };
  }

  const shared = env[PREVIEW_PASSWORD_ENV.agentShared]?.trim() ?? "";
  if (shared) {
    if (shared.length < MIN_PASSWORD_LENGTH) {
      throw new PreviewSeedError(
        `${PREVIEW_PASSWORD_ENV.agentShared} must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }
    return {
      password: shared,
      passwordEnv: PREVIEW_PASSWORD_ENV.agentShared,
    };
  }

  throw new PreviewSeedError(
    `${specificKey} is required and must not be empty.`,
  );
}

export function parsePreviewSeedEnv(
  env: NodeJS.Dict<string>,
): PreviewSeedConfig {
  if (env.PREVIEW_SEED !== "1") {
    throw new PreviewSeedError(
      "Set PREVIEW_SEED=1 to run the Preview seed. This guard keeps the script from writing QA users into an unintended database.",
    );
  }

  assertPreviewVercelEnv(env.VERCEL_ENV);

  assertStripeTestMode({
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });

  const ownerAPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerA);
  const ownerBPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerB);
  const agentA = requireAgentPassword(env, PREVIEW_PASSWORD_ENV.agentA);
  const agentB = requireAgentPassword(env, PREVIEW_PASSWORD_ENV.agentB);
  const identitySecret = requireEnv(env, "PREVIEW_WORKSPACE_A_IDENTITY_SECRET");

  const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  const config: PreviewSeedConfig = {
    ownerA: {
      email: optionalEnv(
        env,
        "PREVIEW_OWNER_A_EMAIL",
        PREVIEW_SEED_DEFAULTS.ownerAEmail,
      ).toLowerCase(),
      name: optionalEnv(
        env,
        "PREVIEW_OWNER_A_NAME",
        PREVIEW_SEED_DEFAULTS.ownerAName,
      ),
      password: ownerAPassword,
      passwordEnv: PREVIEW_PASSWORD_ENV.ownerA,
    },
    ownerB: {
      email: optionalEnv(
        env,
        "PREVIEW_OWNER_B_EMAIL",
        PREVIEW_SEED_DEFAULTS.ownerBEmail,
      ).toLowerCase(),
      name: optionalEnv(
        env,
        "PREVIEW_OWNER_B_NAME",
        PREVIEW_SEED_DEFAULTS.ownerBName,
      ),
      password: ownerBPassword,
      passwordEnv: PREVIEW_PASSWORD_ENV.ownerB,
    },
    agentA: {
      email: optionalEnv(
        env,
        "PREVIEW_AGENT_A_EMAIL",
        PREVIEW_SEED_DEFAULTS.agentAEmail,
      ).toLowerCase(),
      name: optionalEnv(
        env,
        "PREVIEW_AGENT_A_NAME",
        PREVIEW_SEED_DEFAULTS.agentAName,
      ),
      password: agentA.password,
      passwordEnv: agentA.passwordEnv,
    },
    agentB: {
      email: optionalEnv(
        env,
        "PREVIEW_AGENT_B_EMAIL",
        PREVIEW_SEED_DEFAULTS.agentBEmail,
      ).toLowerCase(),
      name: optionalEnv(
        env,
        "PREVIEW_AGENT_B_NAME",
        PREVIEW_SEED_DEFAULTS.agentBName,
      ),
      password: agentB.password,
      passwordEnv: agentB.passwordEnv,
    },
    workspaceA: {
      slug: optionalEnv(
        env,
        "PREVIEW_WORKSPACE_A_SLUG",
        PREVIEW_SEED_DEFAULTS.workspaceASlug,
      ),
      name: optionalEnv(
        env,
        "PREVIEW_WORKSPACE_A_NAME",
        PREVIEW_SEED_DEFAULTS.workspaceAName,
      ),
      identitySecret,
    },
    workspaceB: {
      slug: optionalEnv(
        env,
        "PREVIEW_WORKSPACE_B_SLUG",
        PREVIEW_SEED_DEFAULTS.workspaceBSlug,
      ),
      name: optionalEnv(
        env,
        "PREVIEW_WORKSPACE_B_NAME",
        PREVIEW_SEED_DEFAULTS.workspaceBName,
      ),
    },
    stripeSecretKey: env.STRIPE_SECRET_KEY!.trim(),
    stripePublishableKey: publishable || undefined,
  };

  assertPreviewEmail(config.ownerA.email, "PREVIEW_OWNER_A_EMAIL");
  assertPreviewEmail(config.ownerB.email, "PREVIEW_OWNER_B_EMAIL");
  assertPreviewEmail(config.agentA.email, "PREVIEW_AGENT_A_EMAIL");
  assertPreviewEmail(config.agentB.email, "PREVIEW_AGENT_B_EMAIL");
  assertPreviewSlug(config.workspaceA.slug, "PREVIEW_WORKSPACE_A_SLUG");
  assertPreviewSlug(config.workspaceB.slug, "PREVIEW_WORKSPACE_B_SLUG");
  if (config.workspaceA.slug === config.workspaceB.slug) {
    throw new PreviewSeedError(
      "PREVIEW_WORKSPACE_A_SLUG and PREVIEW_WORKSPACE_B_SLUG must differ.",
    );
  }

  return config;
}

async function seedWorkspaceContent(
  store: PreviewSeedStore,
  input: {
    workspaceId: string;
    authorId: string;
    agentUserId: string;
    agentMemberId: string;
    agentName: string;
  },
): Promise<{ articleCount: number; conversationCount: number }> {
  const collection = await store.upsertCollection({
    workspaceId: input.workspaceId,
    slug: PREVIEW_COLLECTION_SLUG,
    name: "Getting started",
    description: "Synthetic Preview QA articles. Not production content.",
  });

  let articleCount = 0;
  for (const article of PREVIEW_KB_ARTICLES) {
    await store.upsertArticle({
      workspaceId: input.workspaceId,
      collectionId: collection.id,
      slug: article.slug,
      title: article.title,
      body: article.body,
      excerpt: article.excerpt,
      authorId: input.authorId,
      order: article.order,
    });
    articleCount += 1;
  }

  let conversationCount = 0;
  for (const thread of PREVIEW_SAMPLE_THREADS) {
    const visitor = await store.upsertVisitor({
      workspaceId: input.workspaceId,
      externalId: thread.visitorExternalId,
      name: thread.visitorName,
      email: thread.visitorEmail,
    });
    await store.upsertConversation({
      workspaceId: input.workspaceId,
      visitorId: visitor.id,
      assigneeMemberId: input.agentMemberId,
      status: thread.status,
      subject: thread.subject,
      lastMessagePreview: thread.agentMessage,
      messages: [
        {
          type: "VISITOR",
          body: thread.visitorMessage,
          senderName: thread.visitorName,
        },
        {
          type: "AGENT",
          body: thread.agentMessage,
          senderId: input.agentUserId,
          senderName: input.agentName,
        },
      ],
    });
    conversationCount += 1;
  }

  return { articleCount, conversationCount };
}

export async function seedPreviewAccounts(
  store: PreviewSeedStore,
  config: PreviewSeedConfig,
  hashPassword: (password: string) => Promise<string>,
): Promise<PreviewSeedResult> {
  assertPreviewEmail(config.ownerA.email, "ownerA.email");
  assertPreviewEmail(config.ownerB.email, "ownerB.email");
  assertPreviewEmail(config.agentA.email, "agentA.email");
  assertPreviewEmail(config.agentB.email, "agentB.email");
  assertPreviewSlug(config.workspaceA.slug, "workspaceA.slug");
  assertPreviewSlug(config.workspaceB.slug, "workspaceB.slug");
  await assertPreviewDatabase(store);

  const [ownerAHash, ownerBHash, agentAHash, agentBHash] = await Promise.all([
    hashPassword(config.ownerA.password),
    hashPassword(config.ownerB.password),
    hashPassword(config.agentA.password),
    hashPassword(config.agentB.password),
  ]);

  const [ownerA, ownerB, agentA, agentB] = await Promise.all([
    store.upsertUser({
      email: config.ownerA.email,
      name: config.ownerA.name,
      passwordHash: ownerAHash,
    }),
    store.upsertUser({
      email: config.ownerB.email,
      name: config.ownerB.name,
      passwordHash: ownerBHash,
    }),
    store.upsertUser({
      email: config.agentA.email,
      name: config.agentA.name,
      passwordHash: agentAHash,
    }),
    store.upsertUser({
      email: config.agentB.email,
      name: config.agentB.name,
      passwordHash: agentBHash,
    }),
  ]);

  const [workspaceA, workspaceB] = await Promise.all([
    store.upsertWorkspace({
      slug: config.workspaceA.slug,
      name: config.workspaceA.name,
    }),
    store.upsertWorkspace({
      slug: config.workspaceB.slug,
      name: config.workspaceB.name,
    }),
  ]);

  const [, , , , agentAMember, agentBMember] = await Promise.all([
    store.upsertWidgetSettings({
      workspaceId: workspaceA.id,
      workspaceName: config.workspaceA.name,
      identitySecret: config.workspaceA.identitySecret,
    }),
    store.upsertWidgetSettings({
      workspaceId: workspaceB.id,
      workspaceName: config.workspaceB.name,
      identitySecret: null,
    }),
    store.upsertMember({
      workspaceId: workspaceA.id,
      userId: ownerA.id,
      role: "OWNER",
    }),
    store.upsertMember({
      workspaceId: workspaceB.id,
      userId: ownerB.id,
      role: "OWNER",
    }),
    store.upsertMember({
      workspaceId: workspaceA.id,
      userId: agentA.id,
      role: "AGENT",
    }),
    store.upsertMember({
      workspaceId: workspaceB.id,
      userId: agentB.id,
      role: "AGENT",
    }),
  ]);

  const [contentA, contentB] = await Promise.all([
    seedWorkspaceContent(store, {
      workspaceId: workspaceA.id,
      authorId: ownerA.id,
      agentUserId: agentA.id,
      agentMemberId: agentAMember.id,
      agentName: config.agentA.name,
    }),
    seedWorkspaceContent(store, {
      workspaceId: workspaceB.id,
      authorId: ownerB.id,
      agentUserId: agentB.id,
      agentMemberId: agentBMember.id,
      agentName: config.agentB.name,
    }),
  ]);

  return {
    ownerA: { id: ownerA.id, email: config.ownerA.email },
    ownerB: { id: ownerB.id, email: config.ownerB.email },
    agentA: { id: agentA.id, email: config.agentA.email },
    agentB: { id: agentB.id, email: config.agentB.email },
    workspaceA: {
      id: workspaceA.id,
      slug: config.workspaceA.slug,
      identitySecretSet: true,
    },
    workspaceB: {
      id: workspaceB.id,
      slug: config.workspaceB.slug,
      identitySecretSet: false,
    },
    articleCount: contentA.articleCount + contentB.articleCount,
    conversationCount: contentA.conversationCount + contentB.conversationCount,
  };
}

export function formatPreviewSeedReport(
  config: PreviewSeedConfig,
  result: PreviewSeedResult,
  databaseSource?: "PREVIEW_DATABASE_URL",
): string {
  const lines = [
    "Preview seed complete (idempotent upsert).",
    databaseSource
      ? `Database source: ${databaseSource}. Preview may receive XSS test payloads. Never point this seed at production data.`
      : "Preview may receive XSS test payloads. Never point this seed at production data.",
    "",
    "Workspaces",
    `  A  /${result.workspaceA.slug}  widget identity HMAC secret: set (from PREVIEW_WORKSPACE_A_IDENTITY_SECRET)`,
    `  B  /${result.workspaceB.slug}  widget identity HMAC secret: unset`,
    `  KB  ${result.articleCount} articles (${PREVIEW_KB_ARTICLES.length} per workspace) in collection ${PREVIEW_COLLECTION_SLUG}`,
    `  Inbox  ${result.conversationCount} sample conversations (${PREVIEW_SAMPLE_THREADS.length} per workspace: open + closed)`,
    "",
    "Log in at /login. Passwords are the values of the env vars below (not printed).",
    `  ${result.ownerA.email}  role OWNER of ${result.workspaceA.slug}  password env ${config.ownerA.passwordEnv}`,
    `  ${result.ownerB.email}  role OWNER of ${result.workspaceB.slug}  password env ${config.ownerB.passwordEnv}`,
    `  ${result.agentA.email}  role AGENT of ${result.workspaceA.slug}  password env ${config.agentA.passwordEnv}`,
    `  ${result.agentB.email}  role AGENT of ${result.workspaceB.slug}  password env ${config.agentB.passwordEnv}`,
    "",
    "Stripe: test-mode secret accepted. The seed does not create customers; checkout does that on first billing test.",
  ];
  return lines.join("\n");
}
