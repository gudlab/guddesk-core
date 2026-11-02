import type { ImportEntityType } from "./types";
import type {
  ImportArticleInput,
  ImportCollectionInput,
  ImportConversationInput,
  ImportMessageInput,
  ImportStore,
  ImportVisitorInput,
} from "./store";

interface Row {
  id: string;
  [key: string]: unknown;
}

export interface MemoryImportDb {
  mappings: Map<string, string>;
  visitors: Row[];
  collections: Row[];
  articles: Row[];
  conversations: Row[];
  messages: Row[];
}

export function createMemoryImportDb(): MemoryImportDb {
  return {
    mappings: new Map(),
    visitors: [],
    collections: [],
    articles: [],
    conversations: [],
    messages: [],
  };
}

export function createMemoryImportStore(
  db: MemoryImportDb,
  workspaceId: string,
): ImportStore {
  let n = 0;
  const id = (prefix: string) => `${prefix}_${++n}`;
  const mapKey = (entityType: ImportEntityType, externalId: string) =>
    `${workspaceId}:${entityType}:${externalId}`;

  return {
    async findMapping(entityType, externalId) {
      return db.mappings.get(mapKey(entityType, externalId)) ?? null;
    },
    async saveMapping(entityType, externalId, localId) {
      db.mappings.set(mapKey(entityType, externalId), localId);
    },
    async findVisitorByExternalId(externalId) {
      const row = db.visitors.find((visitor) => visitor.externalId === externalId);
      return row ? { id: row.id } : null;
    },
    async findVisitorByEmail(email) {
      const row = db.visitors.find((visitor) => visitor.email === email);
      return row ? { id: row.id } : null;
    },
    async createVisitor(data: ImportVisitorInput) {
      const row = { id: id("vis"), workspaceId, ...data };
      db.visitors.push(row);
      return { id: row.id };
    },
    async updateVisitor(visitorId, data) {
      const row = db.visitors.find((visitor) => visitor.id === visitorId);
      if (!row) return;
      if (data.name !== undefined) row.name = data.name;
      if (data.email !== undefined) row.email = data.email;
      if (data.metadata !== undefined) {
        const current =
          row.metadata && typeof row.metadata === "object"
            ? (row.metadata as Record<string, unknown>)
            : {};
        row.metadata = { ...current, ...data.metadata };
      }
    },
    async collectionSlugTaken(slug) {
      return db.collections.some((collection) => collection.slug === slug);
    },
    async createCollection(data: ImportCollectionInput) {
      const row = { id: id("col"), workspaceId, ...data };
      db.collections.push(row);
      return { id: row.id };
    },
    async publishCollection(collectionId) {
      const row = db.collections.find((collection) => collection.id === collectionId);
      if (row) row.isPublished = true;
    },
    async articleSlugTaken(slug) {
      return db.articles.some((article) => article.slug === slug);
    },
    async createArticle(data: ImportArticleInput) {
      const row = { id: id("art"), workspaceId, ...data };
      db.articles.push(row);
      return { id: row.id };
    },
    async createConversation(data: ImportConversationInput) {
      const row = { id: id("conv"), workspaceId, ...data };
      db.conversations.push(row);
      return { id: row.id };
    },
    async createMessage(data: ImportMessageInput) {
      const row = { id: id("msg"), ...data };
      db.messages.push(row);
      return { id: row.id };
    },
  };
}
