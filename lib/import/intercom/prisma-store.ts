import { Prisma, type PrismaClient } from "@prisma/client";

import { IMPORT_SOURCE_INTERCOM } from "./types";
import type { ImportEntityType } from "./types";
import type {
  ImportArticleInput,
  ImportCollectionInput,
  ImportConversationInput,
  ImportMessageInput,
  ImportStore,
  ImportVisitorInput,
} from "./store";

function jsonValue(
  value: Record<string, unknown>,
): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function createPrismaImportStore(
  prisma: PrismaClient,
  workspaceId: string,
): ImportStore {
  return {
    async findMapping(entityType: ImportEntityType, externalId: string) {
      const row = await prisma.importMapping.findUnique({
        where: {
          workspaceId_source_entityType_externalId: {
            workspaceId,
            source: IMPORT_SOURCE_INTERCOM,
            entityType,
            externalId,
          },
        },
        select: { localId: true },
      });
      return row?.localId ?? null;
    },

    async saveMapping(entityType, externalId, localId) {
      try {
        await prisma.importMapping.create({
          data: {
            workspaceId,
            source: IMPORT_SOURCE_INTERCOM,
            entityType,
            externalId,
            localId,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return;
        }
        throw error;
      }
    },

    async findVisitorByExternalId(externalId) {
      return prisma.visitor.findUnique({
        where: {
          workspaceId_externalId: { workspaceId, externalId },
        },
        select: { id: true },
      });
    },

    async findVisitorByEmail(email) {
      return prisma.visitor.findFirst({
        where: { workspaceId, email },
        select: { id: true },
      });
    },

    async createVisitor(data: ImportVisitorInput) {
      return prisma.visitor.create({
        data: {
          workspaceId,
          externalId: data.externalId,
          name: data.name,
          email: data.email,
          metadata: jsonValue(data.metadata),
          ...(data.createdAt ? { createdAt: data.createdAt } : {}),
        },
        select: { id: true },
      });
    },

    async updateVisitor(id, data) {
      let metadata: Prisma.InputJsonValue | undefined;
      if (data.metadata !== undefined) {
        const current = await prisma.visitor.findUnique({
          where: { id },
          select: { metadata: true },
        });
        const existing =
          current?.metadata &&
          typeof current.metadata === "object" &&
          !Array.isArray(current.metadata)
            ? (current.metadata as Record<string, unknown>)
            : {};
        metadata = jsonValue({ ...existing, ...data.metadata });
      }
      await prisma.visitor.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(metadata !== undefined ? { metadata } : {}),
        },
      });
    },

    async collectionSlugTaken(slug) {
      const row = await prisma.collection.findUnique({
        where: { workspaceId_slug: { workspaceId, slug } },
        select: { id: true },
      });
      return !!row;
    },

    async createCollection(data: ImportCollectionInput) {
      const maxOrder = await prisma.collection.aggregate({
        where: { workspaceId },
        _max: { order: true },
      });
      return prisma.collection.create({
        data: {
          workspaceId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          isPublished: data.isPublished,
          order: (maxOrder._max.order ?? 0) + 1,
        },
        select: { id: true },
      });
    },

    async publishCollection(id) {
      await prisma.collection.update({
        where: { id },
        data: { isPublished: true },
      });
    },

    async articleSlugTaken(slug) {
      const row = await prisma.article.findUnique({
        where: { workspaceId_slug: { workspaceId, slug } },
        select: { id: true },
      });
      return !!row;
    },

    async createArticle(data: ImportArticleInput) {
      const maxOrder = await prisma.article.aggregate({
        where: { workspaceId, collectionId: data.collectionId },
        _max: { order: true },
      });
      return prisma.article.create({
        data: {
          workspaceId,
          title: data.title,
          slug: data.slug,
          body: data.body,
          excerpt: data.excerpt,
          collectionId: data.collectionId,
          isPublished: data.isPublished,
          publishedAt: data.publishedAt,
          authorId: data.authorId,
          order: (maxOrder._max.order ?? 0) + 1,
          ...(data.createdAt ? { createdAt: data.createdAt } : {}),
        },
        select: { id: true },
      });
    },

    async createConversation(data: ImportConversationInput) {
      return prisma.conversation.create({
        data: {
          workspaceId,
          visitorId: data.visitorId,
          status: data.status,
          channel: data.channel,
          subject: data.subject,
          metadata: jsonValue(data.metadata),
          lastMessageAt: data.lastMessageAt,
          lastMessagePreview: data.lastMessagePreview,
          closedAt: data.closedAt,
          ...(data.createdAt ? { createdAt: data.createdAt } : {}),
        },
        select: { id: true },
      });
    },

    async createMessage(data: ImportMessageInput) {
      return prisma.message.create({
        data: {
          conversationId: data.conversationId,
          type: data.type,
          body: data.body,
          senderName: data.senderName,
          ...(data.createdAt ? { createdAt: data.createdAt } : {}),
        },
        select: { id: true },
      });
    },
  };
}
