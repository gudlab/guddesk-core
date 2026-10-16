/**
 * Idempotent Preview QA seed: two workspaces, each with an owner and its own
 * agent, HMAC identity secret on workspace A only, Stripe test-mode keys
 * only, plus sample KB articles and conversations.
 *
 * Credentials come from env. This module never prints passwords, identity
 * secrets, or Stripe keys. Preview may receive XSS test payloads. Never
 * point the seed at production data.
 */

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
    visitorMessage: "The chat bubble does not show on the checkout page after a refresh.",
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
  upsertUser(input: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<{ id: string }>;
  upsertWorkspace(input: { slug: string; name: string }): Promise<{ id: string }>;
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

/**
 * Prefer PREVIEW_DATABASE_URL so a local .env.local can keep a production
 * DATABASE_URL without the seed writing to it. Preview may receive XSS test
 * payloads, so this URL must never be production.
 */
export function resolvePreviewDatabaseUrl(env: NodeJS.Dict<string>): {
  url: string;
  source: "PREVIEW_DATABASE_URL" | "DATABASE_URL";
} {
  const preview = env.PREVIEW_DATABASE_URL?.trim() ?? "";
  const fallback = env.DATABASE_URL?.trim() ?? "";
  const url = preview || fallback;
  if (!url) {
    throw new PreviewSeedError(
      "Set PREVIEW_DATABASE_URL (preferred) or DATABASE_URL to a dedicated Preview Postgres database. Never point the seed at production. Preview may receive XSS test payloads.",
    );
  }

  const production =
    env.PRODUCTION_DATABASE_URL?.trim() || env.PROD_DATABASE_URL?.trim() || "";
  if (production && url === production) {
    throw new PreviewSeedError(
      "Refusing to seed: the database URL matches PRODUCTION_DATABASE_URL / PROD_DATABASE_URL. Preview may receive XSS test payloads. Point PREVIEW_DATABASE_URL at a separate database.",
    );
  }

  return {
    url,
    source: preview ? "PREVIEW_DATABASE_URL" : "DATABASE_URL",
  };
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

  throw new PreviewSeedError(`${specificKey} is required and must not be empty.`);
}

export function parsePreviewSeedEnv(
  env: NodeJS.Dict<string>,
): PreviewSeedConfig {
  if (env.PREVIEW_SEED !== "1") {
    throw new PreviewSeedError(
      "Set PREVIEW_SEED=1 to run the Preview seed. This guard keeps the script from writing QA users into an unintended database.",
    );
  }

  if (env.VERCEL_ENV === "production") {
    throw new PreviewSeedError(
      "Refusing to seed: VERCEL_ENV=production. Run against a Vercel Preview (or omit VERCEL_ENV) with a dedicated Preview DATABASE_URL. Preview may receive XSS test payloads.",
    );
  }

  assertStripeTestMode({
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });

  const ownerAPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerA);
  const ownerBPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerB);
  const agentA = requireAgentPassword(env, PREVIEW_PASSWORD_ENV.agentA);
  const agentB = requireAgentPassword(env, PREVIEW_PASSWORD_ENV.agentB);
  const identitySecret = requireEnv(
    env,
    "PREVIEW_WORKSPACE_A_IDENTITY_SECRET",
  );

  const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  return {
    ownerA: {
      email: optionalEnv(
        env,
        "PREVIEW_OWNER_A_EMAIL",
        PREVIEW_SEED_DEFAULTS.ownerAEmail,
      ).toLowerCase(),
      name: optionalEnv(env, "PREVIEW_OWNER_A_NAME", PREVIEW_SEED_DEFAULTS.ownerAName),
      password: ownerAPassword,
      passwordEnv: PREVIEW_PASSWORD_ENV.ownerA,
    },
    ownerB: {
      email: optionalEnv(
        env,
        "PREVIEW_OWNER_B_EMAIL",
        PREVIEW_SEED_DEFAULTS.ownerBEmail,
      ).toLowerCase(),
      name: optionalEnv(env, "PREVIEW_OWNER_B_NAME", PREVIEW_SEED_DEFAULTS.ownerBName),
      password: ownerBPassword,
      passwordEnv: PREVIEW_PASSWORD_ENV.ownerB,
    },
    agentA: {
      email: optionalEnv(
        env,
        "PREVIEW_AGENT_A_EMAIL",
        PREVIEW_SEED_DEFAULTS.agentAEmail,
      ).toLowerCase(),
      name: optionalEnv(env, "PREVIEW_AGENT_A_NAME", PREVIEW_SEED_DEFAULTS.agentAName),
      password: agentA.password,
      passwordEnv: agentA.passwordEnv,
    },
    agentB: {
      email: optionalEnv(
        env,
        "PREVIEW_AGENT_B_EMAIL",
        PREVIEW_SEED_DEFAULTS.agentBEmail,
      ).toLowerCase(),
      name: optionalEnv(env, "PREVIEW_AGENT_B_NAME", PREVIEW_SEED_DEFAULTS.agentBName),
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
  databaseSource?: "PREVIEW_DATABASE_URL" | "DATABASE_URL",
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
