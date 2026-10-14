/**
 * Seed a dedicated Preview database with QA login accounts.
 *
 *   PREVIEW_SEED=1 pnpm db:seed:preview
 *
 * Reads DATABASE_URL and credentials from the environment (and from .env /
 * .env.local if present). Never commit those files. Refuses live Stripe keys
 * and VERCEL_ENV=production.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  formatPreviewSeedReport,
  parsePreviewSeedEnv,
  PreviewSeedError,
  seedPreviewAccounts,
  type PreviewSeedStore,
} from "../lib/preview-seed";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

function createStore(prisma: PrismaClient): PreviewSeedStore {
  return {
    async upsertUser({ email, name, passwordHash }) {
      const user = await prisma.user.upsert({
        where: { email },
        create: {
          email,
          name,
          password: passwordHash,
          emailVerified: new Date(),
        },
        update: {
          name,
          password: passwordHash,
          emailVerified: new Date(),
        },
        select: { id: true },
      });
      return user;
    },
    async upsertWorkspace({ slug, name }) {
      const workspace = await prisma.workspace.upsert({
        where: { slug },
        create: { slug, name },
        update: { name },
        select: { id: true },
      });
      return workspace;
    },
    async upsertWidgetSettings({ workspaceId, workspaceName, identitySecret }) {
      await prisma.widgetSettings.upsert({
        where: { workspaceId },
        create: {
          workspaceId,
          workspaceName,
          identitySecret,
        },
        update: {
          workspaceName,
          identitySecret,
        },
      });
    },
    async upsertMember({ workspaceId, userId, role }) {
      await prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId, userId } },
        create: { workspaceId, userId, role },
        update: { role },
      });
    },
  };
}

async function main(): Promise<void> {
  const config = parsePreviewSeedEnv(process.env);

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new PreviewSeedError(
      "DATABASE_URL is required. Point it at a dedicated Preview Postgres database, not production.",
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const result = await seedPreviewAccounts(
      createStore(prisma),
      config,
      (password) => bcrypt.hash(password, 12),
    );
    console.log(formatPreviewSeedReport(config, result));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const message =
    error instanceof PreviewSeedError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
  console.error(`Preview seed failed: ${message}`);
  process.exit(1);
});
