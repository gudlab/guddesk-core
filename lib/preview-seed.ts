/**
 * Idempotent Preview QA seed: two workspaces, owners, one shared agent,
 * HMAC identity secret on workspace A only, Stripe test-mode keys only.
 *
 * Credentials come from env. This module never prints passwords, identity
 * secrets, or Stripe keys.
 */

export const PREVIEW_SEED_DEFAULTS = {
  ownerAEmail: "qa-owner-a@guddesk.test",
  ownerBEmail: "qa-owner-b@guddesk.test",
  agentEmail: "qa-agent@guddesk.test",
  ownerAName: "QA Owner A",
  ownerBName: "QA Owner B",
  agentName: "QA Agent",
  workspaceASlug: "preview-a",
  workspaceBSlug: "preview-b",
  workspaceAName: "Preview Workspace A",
  workspaceBName: "Preview Workspace B",
} as const;

export const PREVIEW_PASSWORD_ENV = {
  ownerA: "PREVIEW_OWNER_A_PASSWORD",
  ownerB: "PREVIEW_OWNER_B_PASSWORD",
  agent: "PREVIEW_AGENT_PASSWORD",
} as const;

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
  agent: PreviewSeedAccount;
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
  }): Promise<void>;
};

export type PreviewSeedResult = {
  ownerA: { id: string; email: string };
  ownerB: { id: string; email: string };
  agent: { id: string; email: string };
  workspaceA: { id: string; slug: string; identitySecretSet: true };
  workspaceB: { id: string; slug: string; identitySecretSet: false };
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
      "Refusing to seed: VERCEL_ENV=production. Run against a Vercel Preview (or omit VERCEL_ENV) with a dedicated Preview DATABASE_URL.",
    );
  }

  assertStripeTestMode({
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });

  const ownerAPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerA);
  const ownerBPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.ownerB);
  const agentPassword = requirePassword(env, PREVIEW_PASSWORD_ENV.agent);
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
    agent: {
      email: optionalEnv(
        env,
        "PREVIEW_AGENT_EMAIL",
        PREVIEW_SEED_DEFAULTS.agentEmail,
      ).toLowerCase(),
      name: optionalEnv(env, "PREVIEW_AGENT_NAME", PREVIEW_SEED_DEFAULTS.agentName),
      password: agentPassword,
      passwordEnv: PREVIEW_PASSWORD_ENV.agent,
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

export async function seedPreviewAccounts(
  store: PreviewSeedStore,
  config: PreviewSeedConfig,
  hashPassword: (password: string) => Promise<string>,
): Promise<PreviewSeedResult> {
  const [ownerAHash, ownerBHash, agentHash] = await Promise.all([
    hashPassword(config.ownerA.password),
    hashPassword(config.ownerB.password),
    hashPassword(config.agent.password),
  ]);

  const [ownerA, ownerB, agent] = await Promise.all([
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
      email: config.agent.email,
      name: config.agent.name,
      passwordHash: agentHash,
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

  await Promise.all([
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
      userId: agent.id,
      role: "AGENT",
    }),
    store.upsertMember({
      workspaceId: workspaceB.id,
      userId: agent.id,
      role: "AGENT",
    }),
  ]);

  return {
    ownerA: { id: ownerA.id, email: config.ownerA.email },
    ownerB: { id: ownerB.id, email: config.ownerB.email },
    agent: { id: agent.id, email: config.agent.email },
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
  };
}

export function formatPreviewSeedReport(
  config: PreviewSeedConfig,
  result: PreviewSeedResult,
): string {
  const lines = [
    "Preview seed complete (idempotent upsert).",
    "",
    "Workspaces",
    `  A  /${result.workspaceA.slug}  widget identity HMAC secret: set (from PREVIEW_WORKSPACE_A_IDENTITY_SECRET)`,
    `  B  /${result.workspaceB.slug}  widget identity HMAC secret: unset`,
    "",
    "Log in at /login. Passwords are the values of the env vars below (not printed).",
    `  ${result.ownerA.email}  role OWNER of ${result.workspaceA.slug}  password env ${config.ownerA.passwordEnv}`,
    `  ${result.ownerB.email}  role OWNER of ${result.workspaceB.slug}  password env ${config.ownerB.passwordEnv}`,
    `  ${result.agent.email}  role AGENT on both workspaces  password env ${config.agent.passwordEnv}`,
    "",
    "Stripe: test-mode secret accepted. The seed does not create customers; checkout does that on first billing test.",
  ];
  return lines.join("\n");
}
