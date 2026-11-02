import { htmlToText } from "../../inbound-email/payload";

import {
  MAX_ARTICLE_BODY,
  type ImportedChannel,
  type ImportedConversationStatus,
  type ImportedMessageType,
  type NormalizedArticle,
  type NormalizedCollection,
  type NormalizedContact,
  type NormalizedConversation,
  type NormalizedDump,
  type NormalizedMessage,
} from "./types";
import { isZipBuffer, unzipTextFiles } from "./zip";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function stringId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function nestedList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  if (Array.isArray(rec.data)) return rec.data;
  if (Array.isArray(rec.items)) return rec.items;
  if (Array.isArray(rec.contacts)) return rec.contacts;
  if (Array.isArray(rec.conversation_parts)) return rec.conversation_parts;
  if (Array.isArray(rec.articles)) return rec.articles;
  if (Array.isArray(rec.collections)) return rec.collections;
  return [];
}

function toDate(value: unknown): Date | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string" && value.trim()) {
    if (/^\d+(\.\d+)?$/.test(value.trim())) return toDate(Number(value));
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function toPlainBody(value: unknown): string {
  const raw = typeof value === "string" ? value : "";
  if (!raw.trim()) return "";
  const text = looksLikeHtml(raw) ? htmlToText(raw) : raw;
  return text.replace(/\u0000/g, "").trim();
}

function parseJsonPayload(text: string): unknown {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(trimmed);
  } catch {
    const rows: unknown[] = [];
    for (const line of trimmed.split(/\r?\n/)) {
      const row = line.trim();
      if (!row) continue;
      try {
        rows.push(JSON.parse(row));
      } catch {
        throw new Error("The file is not valid JSON or JSONL.");
      }
    }
    if (rows.length === 0) throw new Error("The file is not valid JSON or JSONL.");
    return rows;
  }
}

function classifyFileName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("conversation")) return "conversations";
  if (lower.includes("article")) return "articles";
  if (lower.includes("collection") || lower.includes("folder") || lower.includes("section")) {
    return "collections";
  }
  if (
    lower.includes("contact") ||
    /(^|[^a-z])users?([^a-z]|$)/.test(lower) ||
    lower.includes("lead")
  ) {
    return "contacts";
  }
  return null;
}

function typeName(rec: Record<string, unknown>): string {
  return (asString(rec.type) ?? "").toLowerCase();
}

function isContactType(type: string): boolean {
  return (
    type === "contact" ||
    type === "user" ||
    type === "lead" ||
    type === "visitor"
  );
}

function isCollectionType(type: string): boolean {
  return (
    type === "collection" ||
    type === "help_center_collection" ||
    type === "section" ||
    type === "folder"
  );
}

function readContact(value: unknown): NormalizedContact | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const id = stringId(rec.id) ?? stringId(rec.intercom_id);
  if (!id) return null;
  const emailRaw = asString(rec.email);
  const externalId = asString(rec.external_id);
  return {
    id,
    email: emailRaw ? emailRaw.toLowerCase() : null,
    name: asString(rec.name),
    externalId,
    createdAt: toDate(rec.created_at),
  };
}

function readCollection(value: unknown): NormalizedCollection | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const id = stringId(rec.id);
  const name = asString(rec.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    description: asString(rec.description),
  };
}

function articlePublished(rec: Record<string, unknown>): boolean {
  const state = (asString(rec.state) ?? "").toLowerCase();
  if (state === "published") return true;
  if (state === "draft") return false;
  if (rec.published === true) return true;
  if (rec.published === false) return false;
  return false;
}

function readArticle(value: unknown): NormalizedArticle | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const id = stringId(rec.id);
  const title = asString(rec.title);
  if (!id || !title) return null;
  let body = toPlainBody(rec.body ?? rec.body_html ?? rec.body_markdown);
  if (body.length > MAX_ARTICLE_BODY) body = body.slice(0, MAX_ARTICLE_BODY);
  const published = articlePublished(rec);
  const parentType = (asString(rec.parent_type) ?? "").toLowerCase();
  const collectionId =
    stringId(rec.collection_id) ??
    (parentType === "collection" || parentType === "section" || parentType === "folder" || !parentType
      ? stringId(rec.parent_id)
      : null);
  const createdAt = toDate(rec.created_at);
  const publishedAt = published
    ? toDate(rec.published_at) ?? toDate(rec.updated_at) ?? createdAt
    : null;
  return {
    id,
    title: title.slice(0, 200),
    body: body || title,
    excerpt: asString(rec.description) ?? asString(rec.excerpt),
    published,
    collectionId,
    createdAt,
    publishedAt,
  };
}

function conversationStatus(rec: Record<string, unknown>): ImportedConversationStatus {
  const state = (asString(rec.state) ?? asString(rec.open) ?? "").toLowerCase();
  if (state === "closed" || rec.open === false) return "CLOSED";
  if (state === "snoozed") return "SNOOZED";
  return "OPEN";
}

function conversationChannel(rec: Record<string, unknown>): ImportedChannel {
  const source = asRecord(rec.source);
  const delivered = (asString(source?.delivered_as) ?? "").toLowerCase();
  const sourceType = (asString(source?.type) ?? asString(rec.channel) ?? "").toLowerCase();
  if (sourceType.includes("email") || delivered.includes("email")) return "EMAIL";
  return "API";
}

function contactIdsFrom(rec: Record<string, unknown>): string[] {
  const ids: string[] = [];
  const push = (value: unknown) => {
    const recValue = asRecord(value);
    const id = recValue ? stringId(recValue.id) : stringId(value);
    if (id && !ids.includes(id)) ids.push(id);
  };
  for (const item of nestedList(rec.contacts)) push(item);
  push(rec.contact);
  const source = asRecord(rec.source);
  const author = asRecord(source?.author);
  if (author && (typeName(author) === "user" || typeName(author) === "lead")) {
    push(author);
  }
  return ids;
}

function messageType(
  partType: string,
  authorType: string,
): ImportedMessageType | null {
  if (partType === "note") return "NOTE";
  if (partType === "close" || partType === "open" || partType === "snoozed") {
    return "SYSTEM";
  }
  if (partType === "assignment" || partType === "priority_changed") return null;
  if (authorType === "bot") return "BOT";
  if (authorType === "admin" || authorType === "team") return "AGENT";
  return "VISITOR";
}

function readMessage(
  value: unknown,
  fallbackId: string,
): NormalizedMessage | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const partType = (asString(rec.part_type) ?? asString(rec.type) ?? "comment").toLowerCase();
  const author = asRecord(rec.author) ?? {};
  const authorType = typeName(author);
  const mapped = messageType(partType, authorType);
  if (!mapped) return null;
  const body = toPlainBody(rec.body);
  const id = stringId(rec.id) ?? fallbackId;
  if (!body) {
    if (mapped !== "SYSTEM") return null;
    const label =
      partType === "close"
        ? "Conversation closed"
        : partType === "open"
          ? "Conversation reopened"
          : "Conversation updated";
    return {
      id,
      body: label,
      type: "SYSTEM",
      authorName: asString(author.name),
      createdAt: toDate(rec.created_at),
      hasAttachments: false,
    };
  }
  const attachments = rec.attachments;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  return {
    id,
    body,
    type: mapped,
    authorName: asString(author.name),
    createdAt: toDate(rec.created_at),
    hasAttachments,
  };
}

function readConversation(value: unknown): NormalizedConversation | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const id = stringId(rec.id);
  if (!id) return null;
  const source = asRecord(rec.source);
  const messages: NormalizedMessage[] = [];
  const seenBodies = new Set<string>();

  const parts = nestedList(rec.conversation_parts);
  for (let i = 0; i < parts.length; i++) {
    const message = readMessage(parts[i], `${id}:part:${i}`);
    if (!message) continue;
    messages.push(message);
    seenBodies.add(message.body);
  }

  if (source) {
    const sourceBody = toPlainBody(source.body);
    const started = messages.find(
      (message) =>
        message.body === sourceBody && sourceBody.length > 0,
    );
    if (!started && sourceBody) {
      const author = asRecord(source.author) ?? {};
      const mapped =
        messageType("comment", typeName(author)) ?? "VISITOR";
      messages.unshift({
        id: stringId(source.id) ?? `${id}:source`,
        body: sourceBody,
        type: mapped,
        authorName: asString(author.name),
        createdAt: toDate(source.created_at) ?? toDate(rec.created_at),
        hasAttachments: false,
      });
    }
  }

  const status = conversationStatus(rec);
  const closedAt =
    status === "CLOSED"
      ? toDate(rec.updated_at) ?? toDate(rec.created_at)
      : null;
  const firstBody = messages[0]?.body ?? "";
  return {
    id,
    contactIds: contactIdsFrom(rec),
    status,
    channel: conversationChannel(rec),
    subject: asString(rec.title) ?? asString(source?.subject) ?? (firstBody ? firstBody.slice(0, 80) : null),
    createdAt: toDate(rec.created_at),
    closedAt,
    messages,
  };
}

interface MutableDump {
  contacts: Map<string, NormalizedContact>;
  collections: Map<string, NormalizedCollection>;
  articles: Map<string, NormalizedArticle>;
  conversations: Map<string, NormalizedConversation>;
  warnings: string[];
  sawAttachments: boolean;
}

function emptyDump(): MutableDump {
  return {
    contacts: new Map(),
    collections: new Map(),
    articles: new Map(),
    conversations: new Map(),
    warnings: [],
    sawAttachments: false,
  };
}

function addContact(dump: MutableDump, value: unknown) {
  const contact = readContact(value);
  if (!contact) {
    dump.warnings.push("Skipped a contact that had no Intercom id.");
    return;
  }
  dump.contacts.set(contact.id, contact);
}

function addCollection(dump: MutableDump, value: unknown) {
  const collection = readCollection(value);
  if (!collection) {
    dump.warnings.push("Skipped a collection that had no id or name.");
    return;
  }
  dump.collections.set(collection.id, collection);
}

function addArticle(dump: MutableDump, value: unknown) {
  const article = readArticle(value);
  if (!article) {
    dump.warnings.push("Skipped an article that had no id or title.");
    return;
  }
  dump.articles.set(article.id, article);
}

function addConversation(dump: MutableDump, value: unknown) {
  const conversation = readConversation(value);
  if (!conversation) {
    dump.warnings.push("Skipped a conversation that had no Intercom id.");
    return;
  }
  if (conversation.messages.some((message) => message.hasAttachments)) {
    dump.sawAttachments = true;
  }
  dump.conversations.set(conversation.id, conversation);
}

function ingestRecord(dump: MutableDump, value: unknown, hint: string | null) {
  const rec = asRecord(value);
  if (!rec) return;
  const type = typeName(rec);

  // Intercom list wrappers, including when the filename already hints the type.
  if (Array.isArray(rec.data) && !stringId(rec.id)) {
    ingestValue(dump, rec.data, hint);
    return;
  }

  if (hint === "contacts" || isContactType(type)) {
    addContact(dump, rec);
    return;
  }
  if (hint === "collections" || isCollectionType(type)) {
    addCollection(dump, rec);
    return;
  }
  if (hint === "articles" || type === "article") {
    addArticle(dump, rec);
    return;
  }
  if (hint === "conversations" || type === "conversation") {
    addConversation(dump, rec);
    return;
  }

  if (Array.isArray(rec.contacts) || Array.isArray(rec.users) || Array.isArray(rec.leads)) {
    for (const item of nestedList(rec.contacts)) addContact(dump, item);
    for (const item of nestedList(rec.users)) addContact(dump, item);
    for (const item of nestedList(rec.leads)) addContact(dump, item);
  }
  if (Array.isArray(rec.collections) || Array.isArray(rec.sections)) {
    for (const item of nestedList(rec.collections)) addCollection(dump, item);
    for (const item of nestedList(rec.sections)) addCollection(dump, item);
  }
  if (Array.isArray(rec.articles)) {
    for (const item of nestedList(rec.articles)) addArticle(dump, item);
  }
  if (Array.isArray(rec.conversations)) {
    for (const item of nestedList(rec.conversations)) addConversation(dump, item);
  }

  if (Array.isArray(rec.data)) {
    ingestValue(dump, rec.data, hint);
  }
}

function ingestValue(dump: MutableDump, value: unknown, hint: string | null) {
  if (Array.isArray(value)) {
    for (const item of value) ingestRecord(dump, item, hint);
    return;
  }
  ingestRecord(dump, value, hint);
}

function freeze(dump: MutableDump): NormalizedDump {
  const warnings = [...dump.warnings];
  if (dump.sawAttachments) {
    warnings.push("Attachment files are not imported.");
  }
  return {
    contacts: [...dump.contacts.values()],
    collections: [...dump.collections.values()],
    articles: [...dump.articles.values()],
    conversations: [...dump.conversations.values()],
    warnings,
  };
}

export function parseIntercomJson(value: unknown, fileName?: string): NormalizedDump {
  const dump = emptyDump();
  ingestValue(dump, value, fileName ? classifyFileName(fileName) : null);
  const result = freeze(dump);
  if (
    result.contacts.length === 0 &&
    result.articles.length === 0 &&
    result.conversations.length === 0 &&
    result.collections.length === 0
  ) {
    throw new Error(
      "No contacts, articles, or conversations were found in this file.",
    );
  }
  return result;
}

export function parseIntercomText(text: string, fileName?: string): NormalizedDump {
  return parseIntercomJson(parseJsonPayload(text), fileName);
}

export function parseIntercomExport(
  input: Buffer | string | unknown,
  fileName?: string,
): NormalizedDump {
  if (Buffer.isBuffer(input)) {
    if (isZipBuffer(input)) {
      const unzipped = unzipTextFiles(input);
      const dump = emptyDump();
      dump.warnings.push(...unzipped.warnings);
      for (const [name, text] of Object.entries(unzipped.files)) {
        try {
          ingestValue(dump, parseJsonPayload(text), classifyFileName(name));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not parse a zip entry.";
          dump.warnings.push(`${name}: ${message}`);
        }
      }
      const result = freeze(dump);
      if (
        result.contacts.length === 0 &&
        result.articles.length === 0 &&
        result.conversations.length === 0 &&
        result.collections.length === 0
      ) {
        throw new Error(
          "No contacts, articles, or conversations were found in this zip.",
        );
      }
      return result;
    }
    return parseIntercomText(input.toString("utf8"), fileName);
  }
  if (typeof input === "string") return parseIntercomText(input, fileName);
  return parseIntercomJson(input, fileName);
}
