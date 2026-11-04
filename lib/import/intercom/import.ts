import { IMPORT_SOURCE_INTERCOM, emptyEntityCount } from "./types";
import type {
  ImportError,
  ImportResult,
  NormalizedArticle,
  NormalizedContact,
  NormalizedConversation,
  NormalizedDump,
} from "./types";
import { RESERVED_COLLECTION_SLUGS, slugify, uniqueSlug } from "./slug";
import type { ImportStore } from "./store";

export interface ImportContext {
  workspaceId: string;
  authorId: string;
}

function pushError(
  result: ImportResult,
  error: ImportError,
) {
  result.errors.push(error);
  if (error.entity === "contact") result.contacts.errors++;
  else if (error.entity === "collection") result.collections.errors++;
  else if (error.entity === "article") result.articles.errors++;
  else if (error.entity === "conversation") result.conversations.errors++;
  else result.messages.errors++;
}

function preview(body: string | null | undefined): string | null {
  if (!body) return null;
  return body.length > 100 ? `${body.slice(0, 100)}...` : body;
}

function contactMetadata(contact: NormalizedContact): Record<string, unknown> {
  return {
    importSource: IMPORT_SOURCE_INTERCOM,
    intercomId: contact.id,
  };
}

async function importContact(
  contact: NormalizedContact,
  store: ImportStore,
  result: ImportResult,
): Promise<string | null> {
  try {
    const mapped = await store.findMapping("contact", contact.id);
    if (mapped) {
      result.contacts.skipped++;
      return mapped;
    }

    let visitorId: string | null = null;
    if (contact.externalId) {
      const byExternal = await store.findVisitorByExternalId(contact.externalId);
      if (byExternal) visitorId = byExternal.id;
    }
    if (!visitorId && contact.email) {
      const byEmail = await store.findVisitorByEmail(contact.email);
      if (byEmail) visitorId = byEmail.id;
    }

    const metadata = contactMetadata(contact);
    if (visitorId) {
      await store.updateVisitor(visitorId, {
        name: contact.name,
        email: contact.email,
        metadata,
      });
      await store.saveMapping("contact", contact.id, visitorId);
      result.contacts.skipped++;
      return visitorId;
    }

    try {
      const created = await store.createVisitor({
        externalId: contact.externalId ?? contact.id,
        name: contact.name,
        email: contact.email,
        metadata,
        createdAt: contact.createdAt,
      });
      await store.saveMapping("contact", contact.id, created.id);
      result.contacts.created++;
      return created.id;
    } catch {
      const existing =
        (contact.externalId
          ? await store.findVisitorByExternalId(contact.externalId)
          : null) ??
        (await store.findVisitorByExternalId(contact.id)) ??
        (contact.email ? await store.findVisitorByEmail(contact.email) : null);
      if (!existing) throw new Error("Failed to import contact");
      await store.saveMapping("contact", contact.id, existing.id);
      result.contacts.skipped++;
      return existing.id;
    }
  } catch (error) {
    pushError(result, {
      entity: "contact",
      externalId: contact.id,
      message: error instanceof Error ? error.message : "Failed to import contact",
    });
    return null;
  }
}

async function importCollection(
  collection: { id: string; name: string; description: string | null },
  store: ImportStore,
  result: ImportResult,
  publish: boolean,
): Promise<string | null> {
  try {
    const mapped = await store.findMapping("collection", collection.id);
    if (mapped) {
      if (publish) await store.publishCollection(mapped);
      result.collections.skipped++;
      return mapped;
    }
    const base = slugify(collection.name, "collection");
    const slug = await uniqueSlug(
      base,
      (value) => store.collectionSlugTaken(value),
      RESERVED_COLLECTION_SLUGS,
    );
    const created = await store.createCollection({
      name: collection.name.slice(0, 100),
      slug,
      description: collection.description ? collection.description.slice(0, 500) : null,
      isPublished: publish,
    });
    await store.saveMapping("collection", collection.id, created.id);
    result.collections.created++;
    return created.id;
  } catch (error) {
    pushError(result, {
      entity: "collection",
      externalId: collection.id,
      message: error instanceof Error ? error.message : "Failed to import collection",
    });
    return null;
  }
}

async function importArticle(
  article: NormalizedArticle,
  collectionLocalId: string | null,
  ctx: ImportContext,
  store: ImportStore,
  result: ImportResult,
): Promise<void> {
  try {
    const mapped = await store.findMapping("article", article.id);
    if (mapped) {
      result.articles.skipped++;
      return;
    }
    const base = slugify(article.title, "article");
    const slug = await uniqueSlug(base, (value) => store.articleSlugTaken(value));
    const created = await store.createArticle({
      title: article.title,
      slug,
      body: article.body,
      excerpt: article.excerpt ? article.excerpt.slice(0, 500) : null,
      collectionId: collectionLocalId,
      isPublished: article.published,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      authorId: ctx.authorId,
    });
    await store.saveMapping("article", article.id, created.id);
    result.articles.created++;
  } catch (error) {
    pushError(result, {
      entity: "article",
      externalId: article.id,
      message: error instanceof Error ? error.message : "Failed to import article",
    });
  }
}

async function ensureVisitorForConversation(
  conversation: NormalizedConversation,
  contactLocals: Map<string, string>,
  store: ImportStore,
  result: ImportResult,
): Promise<string | null> {
  for (const contactId of conversation.contactIds) {
    const local = contactLocals.get(contactId) ?? (await store.findMapping("contact", contactId));
    if (local) return local;
  }

  const stubKey = `missing:${conversation.id}`;
  const mapped = await store.findMapping("contact", stubKey);
  if (mapped) return mapped;

  try {
    const created = await store.createVisitor({
      externalId: `intercom:${stubKey}`,
      name: "Imported visitor",
      email: null,
      metadata: {
        importSource: IMPORT_SOURCE_INTERCOM,
        intercomConversationId: conversation.id,
      },
      createdAt: conversation.createdAt,
    });
    await store.saveMapping("contact", stubKey, created.id);
    result.contacts.created++;
    return created.id;
  } catch (error) {
    pushError(result, {
      entity: "conversation",
      externalId: conversation.id,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create a visitor for this conversation",
    });
    return null;
  }
}

async function importConversation(
  conversation: NormalizedConversation,
  contactLocals: Map<string, string>,
  store: ImportStore,
  result: ImportResult,
): Promise<void> {
  try {
    const existing = await store.findMapping("conversation", conversation.id);
    let conversationId = existing;
    if (conversationId) {
      result.conversations.skipped++;
    } else {
      const visitorId = await ensureVisitorForConversation(
        conversation,
        contactLocals,
        store,
        result,
      );
      if (!visitorId) return;
      const last = conversation.messages[conversation.messages.length - 1];
      const created = await store.createConversation({
        visitorId,
        status: conversation.status,
        channel: conversation.channel,
        subject: conversation.subject,
        metadata: {
          importSource: IMPORT_SOURCE_INTERCOM,
          intercomId: conversation.id,
        },
        createdAt: conversation.createdAt,
        closedAt: conversation.closedAt,
        lastMessageAt: last?.createdAt ?? conversation.createdAt,
        lastMessagePreview: preview(last?.body ?? conversation.subject),
      });
      conversationId = created.id;
      await store.saveMapping("conversation", conversation.id, conversationId);
      result.conversations.created++;
    }

    for (const message of conversation.messages) {
      const mappedMessage = await store.findMapping("message", message.id);
      if (mappedMessage) {
        result.messages.skipped++;
        continue;
      }
      try {
        const createdMessage = await store.createMessage({
          conversationId,
          type: message.type,
          body: message.body,
          senderName: message.authorName,
          createdAt: message.createdAt,
        });
        await store.saveMapping("message", message.id, createdMessage.id);
        result.messages.created++;
      } catch (error) {
        pushError(result, {
          entity: "message",
          externalId: message.id,
          message: error instanceof Error ? error.message : "Failed to import message",
        });
      }
    }
  } catch (error) {
    pushError(result, {
      entity: "conversation",
      externalId: conversation.id,
      message:
        error instanceof Error ? error.message : "Failed to import conversation",
    });
  }
}

export async function importIntercomDump(
  dump: NormalizedDump,
  ctx: ImportContext,
  store: ImportStore,
): Promise<ImportResult> {
  const result: ImportResult = {
    contacts: emptyEntityCount(),
    collections: emptyEntityCount(),
    articles: emptyEntityCount(),
    conversations: emptyEntityCount(),
    messages: emptyEntityCount(),
    errors: [],
    warnings: [...dump.warnings],
  };

  const contactLocals = new Map<string, string>();
  for (const contact of dump.contacts) {
    const localId = await importContact(contact, store, result);
    if (localId) contactLocals.set(contact.id, localId);
  }

  const collectionsToPublish = new Set(
    dump.articles.filter((article) => article.published && article.collectionId).map(
      (article) => article.collectionId as string,
    ),
  );
  const extraCollectionIds = [
    ...new Set(
      dump.articles
        .map((article) => article.collectionId)
        .filter((id): id is string => !!id),
    ),
  ].filter((id) => !dump.collections.some((collection) => collection.id === id));

  const collectionLocals = new Map<string, string>();
  for (const collection of dump.collections) {
    const localId = await importCollection(
      collection,
      store,
      result,
      collectionsToPublish.has(collection.id),
    );
    if (localId) collectionLocals.set(collection.id, localId);
  }
  for (const collectionId of extraCollectionIds) {
    const localId = await importCollection(
      { id: collectionId, name: "Imported", description: null },
      store,
      result,
      collectionsToPublish.has(collectionId),
    );
    if (localId) collectionLocals.set(collectionId, localId);
  }

  for (const article of dump.articles) {
    const collectionLocalId = article.collectionId
      ? (collectionLocals.get(article.collectionId) ?? null)
      : null;
    await importArticle(article, collectionLocalId, ctx, store, result);
  }

  for (const conversation of dump.conversations) {
    await importConversation(conversation, contactLocals, store, result);
  }

  return result;
}
