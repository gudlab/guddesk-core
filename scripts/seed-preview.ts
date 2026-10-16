/**
 * Seed a dedicated Preview database with QA login accounts.
 *
 *   PREVIEW_SEED=1 pnpm db:seed:preview
 *
 * Reads PREVIEW_DATABASE_URL (preferred) or DATABASE_URL, plus credentials,
 * from the environment (and from .env / .env.local if present). Never commit
 * those files. Refuses live Stripe keys, VERCEL_ENV=production, and a URL
 * that matches PRODUCTION_DATABASE_URL. Preview may receive XSS test
 * payloads; never point this at production data.
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
  resolvePreviewDatabaseUrl,
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
      return prisma.user.upsert({
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
    },
    async upsertWorkspace({ slug, name }) {
      return prisma.workspace.upsert({
        where: { slug },
        create: { slug, name },
        update: { name },
        select: { id: true },
      });
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
      return prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId, userId } },
        create: { workspaceId, userId, role },
        update: { role },
        select: { id: true },
      });
    },
    async upsertCollection({ workspaceId, slug, name, description }) {
      return prisma.collection.upsert({
        where: { workspaceId_slug: { workspaceId, slug } },
        create: {
          workspaceId,
          slug,
          name,
          description,
          isPublished: true,
          order: 0,
        },
        update: {
          name,
          description,
          isPublished: true,
        },
        select: { id: true },
      });
    },
    async upsertArticle({
      workspaceId,
      collectionId,
      slug,
      title,
      body,
      excerpt,
      authorId,
      order,
    }) {
      return prisma.article.upsert({
        where: { workspaceId_slug: { workspaceId, slug } },
        create: {
          workspaceId,
          collectionId,
          slug,
          title,
          body,
          excerpt,
          authorId,
          order,
          isPublished: true,
          publishedAt: new Date(),
        },
        update: {
          collectionId,
          title,
          body,
          excerpt,
          authorId,
          order,
          isPublished: true,
        },
        select: { id: true },
      });
    },
    async upsertVisitor({ workspaceId, externalId, name, email }) {
      return prisma.visitor.upsert({
        where: { workspaceId_externalId: { workspaceId, externalId } },
        create: {
          workspaceId,
          externalId,
          name,
          email,
          lastSeenAt: new Date(),
        },
        update: {
          name,
          email,
          lastSeenAt: new Date(),
        },
        select: { id: true },
      });
    },
    async upsertConversation({
      workspaceId,
      visitorId,
      assigneeMemberId,
      status,
      subject,
      lastMessagePreview,
      messages,
    }) {
      const existing = await prisma.conversation.findFirst({
        where: { workspaceId, visitorId },
        select: { id: true },
      });
      if (existing) {
        return { id: existing.id, created: false };
      }

      const now = new Date();
      const conversation = await prisma.conversation.create({
        data: {
          workspaceId,
          visitorId,
          assigneeId: assigneeMemberId,
          channel: "WIDGET",
          status,
          subject,
          lastMessageAt: now,
          lastMessagePreview,
          firstResponseAt: now,
          closedAt: status === "CLOSED" ? now : null,
          messages: {
            create: messages.map((message) => ({
              type: message.type,
              body: message.body,
              senderId: message.senderId ?? null,
              senderName: message.senderName ?? null,
            })),
          },
        },
        select: { id: true },
      });
      return { id: conversation.id, created: true };
    },
  };
}

async function main(): Promise<void> {
  const config = parsePreviewSeedEnv(process.env);
  const database = resolvePreviewDatabaseUrl(process.env);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: database.url }),
  });

  try {
    const result = await seedPreviewAccounts(
      createStore(prisma),
      config,
      (password) => bcrypt.hash(password, 12),
    );
    console.log(formatPreviewSeedReport(config, result, database.source));
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
