import type {
  ImportEntityType,
  ImportedChannel,
  ImportedConversationStatus,
  ImportedMessageType,
} from "./types";

export interface ImportVisitorInput {
  externalId: string | null;
  name: string | null;
  email: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date | null;
}

export interface ImportCollectionInput {
  name: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
}

export interface ImportArticleInput {
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  collectionId: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date | null;
  authorId: string;
}

export interface ImportConversationInput {
  visitorId: string;
  status: ImportedConversationStatus;
  channel: ImportedChannel;
  subject: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date | null;
  closedAt: Date | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
}

export interface ImportMessageInput {
  conversationId: string;
  type: ImportedMessageType;
  body: string;
  senderName: string | null;
  createdAt: Date | null;
}

export interface ImportStore {
  findMapping(
    entityType: ImportEntityType,
    externalId: string,
  ): Promise<string | null>;
  saveMapping(
    entityType: ImportEntityType,
    externalId: string,
    localId: string,
  ): Promise<void>;

  findVisitorByExternalId(externalId: string): Promise<{ id: string } | null>;
  findVisitorByEmail(email: string): Promise<{ id: string } | null>;
  createVisitor(data: ImportVisitorInput): Promise<{ id: string }>;
  updateVisitor(
    id: string,
    data: { name?: string | null; email?: string | null; metadata?: Record<string, unknown> },
  ): Promise<void>;

  collectionSlugTaken(slug: string): Promise<boolean>;
  createCollection(data: ImportCollectionInput): Promise<{ id: string }>;
  publishCollection(id: string): Promise<void>;

  articleSlugTaken(slug: string): Promise<boolean>;
  createArticle(data: ImportArticleInput): Promise<{ id: string }>;

  createConversation(data: ImportConversationInput): Promise<{ id: string }>;
  createMessage(data: ImportMessageInput): Promise<{ id: string }>;
}
