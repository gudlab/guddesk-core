export const IMPORT_SOURCE_INTERCOM = "intercom";

/** Vercel request bodies are small; Preview QA uses the in-repo fixture. */
export const MAX_IMPORT_BYTES = 4 * 1024 * 1024;
export const MAX_UNCOMPRESSED_BYTES = 8 * 1024 * 1024;
export const MAX_ZIP_FILES = 100;
export const MAX_IMPORT_ERRORS = 20;
export const MAX_ARTICLE_BODY = 100_000;

export type ImportEntityType =
  | "contact"
  | "collection"
  | "article"
  | "conversation"
  | "message";

export type ImportedMessageType =
  | "VISITOR"
  | "AGENT"
  | "NOTE"
  | "SYSTEM"
  | "BOT";

export type ImportedConversationStatus = "OPEN" | "CLOSED" | "SNOOZED";
export type ImportedChannel = "WIDGET" | "EMAIL" | "API";

export interface NormalizedContact {
  id: string;
  email: string | null;
  name: string | null;
  /** Customer's app user id (`external_id`), used for widget identify(). */
  externalId: string | null;
  createdAt: Date | null;
}

export interface NormalizedCollection {
  id: string;
  name: string;
  description: string | null;
}

export interface NormalizedArticle {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  published: boolean;
  collectionId: string | null;
  createdAt: Date | null;
  publishedAt: Date | null;
}

export interface NormalizedMessage {
  id: string;
  body: string;
  type: ImportedMessageType;
  authorName: string | null;
  createdAt: Date | null;
  hasAttachments: boolean;
}

export interface NormalizedConversation {
  id: string;
  contactIds: string[];
  status: ImportedConversationStatus;
  channel: ImportedChannel;
  subject: string | null;
  createdAt: Date | null;
  closedAt: Date | null;
  messages: NormalizedMessage[];
}

export interface NormalizedDump {
  contacts: NormalizedContact[];
  collections: NormalizedCollection[];
  articles: NormalizedArticle[];
  conversations: NormalizedConversation[];
  warnings: string[];
}

export interface EntityCount {
  created: number;
  skipped: number;
  errors: number;
}

export interface ImportError {
  entity: ImportEntityType;
  externalId: string | null;
  message: string;
}

export interface ImportResult {
  contacts: EntityCount;
  collections: EntityCount;
  articles: EntityCount;
  conversations: EntityCount;
  messages: EntityCount;
  errors: ImportError[];
  warnings: string[];
}

export interface PreviewCounts {
  contacts: number;
  collections: number;
  articles: number;
  articlesPublished: number;
  conversations: number;
  conversationsClosed: number;
  messages: number;
}

export function emptyEntityCount(): EntityCount {
  return { created: 0, skipped: 0, errors: 0 };
}

export function previewCounts(dump: NormalizedDump): PreviewCounts {
  return {
    contacts: dump.contacts.length,
    collections: dump.collections.length,
    articles: dump.articles.length,
    articlesPublished: dump.articles.filter((article) => article.published)
      .length,
    conversations: dump.conversations.length,
    conversationsClosed: dump.conversations.filter(
      (conversation) => conversation.status === "CLOSED",
    ).length,
    messages: dump.conversations.reduce(
      (sum, conversation) => sum + conversation.messages.length,
      0,
    ),
  };
}
