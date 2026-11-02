import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { importIntercomDump } from "./import";
import { createMemoryImportDb, createMemoryImportStore } from "./memory-store";
import { parseIntercomExport } from "./parse";

const fixturePath = join(
  process.cwd(),
  "lib/import/intercom/fixtures/sample-export.json",
);

function loadDump() {
  return parseIntercomExport(JSON.parse(readFileSync(fixturePath, "utf8")));
}

describe("importIntercomDump", () => {
  it("creates contacts, articles, conversations, and messages from the sample", async () => {
    const db = createMemoryImportDb();
    const store = createMemoryImportStore(db, "ws_1");
    const result = await importIntercomDump(loadDump(), { workspaceId: "ws_1", authorId: "user_1" }, store);

    assert.equal(result.contacts.created, 3);
    assert.equal(result.collections.created, 1);
    assert.equal(result.articles.created, 2);
    assert.equal(result.conversations.created, 2);
    assert.equal(result.messages.created, 5);
    assert.equal(result.errors.length, 0);

    const ada = db.visitors.find((row) => row.email === "ada@example.com");
    assert.equal(ada?.externalId, "ada-42");
    assert.equal(ada?.name, "Ada Buyer");

    const published = db.articles.filter((row) => row.isPublished);
    assert.equal(published.length, 1);
    assert.equal(published[0]?.title, "Reset your password");
    assert.equal(db.collections[0]?.isPublished, true);

    const closed = db.conversations.find((row) => row.status === "CLOSED");
    assert.ok(closed);
    assert.equal(closed?.channel, "EMAIL");
    assert.equal(
      db.messages.filter((row) => row.conversationId === closed?.id).length,
      2,
    );
  });

  it("is idempotent on a second run with the same Intercom ids", async () => {
    const db = createMemoryImportDb();
    const store = createMemoryImportStore(db, "ws_1");
    const dump = loadDump();
    const ctx = { workspaceId: "ws_1", authorId: "user_1" };
    await importIntercomDump(dump, ctx, store);
    const second = await importIntercomDump(dump, ctx, store);

    assert.equal(second.contacts.created, 0);
    assert.equal(second.contacts.skipped, 3);
    assert.equal(second.articles.created, 0);
    assert.equal(second.articles.skipped, 2);
    assert.equal(second.conversations.created, 0);
    assert.equal(second.conversations.skipped, 2);
    assert.equal(second.messages.created, 0);
    assert.equal(second.messages.skipped, 5);
    assert.equal(db.visitors.length, 3);
    assert.equal(db.conversations.length, 2);
    assert.equal(db.messages.length, 5);
    assert.equal(db.articles.length, 2);
  });

  it("reuses an existing customer with the same email instead of duplicating", async () => {
    const db = createMemoryImportDb();
    const store = createMemoryImportStore(db, "ws_1");
    db.visitors.push({
      id: "vis_existing",
      email: "ada@example.com",
      name: "Ada Old",
      metadata: { plan: "pro" },
    });
    const result = await importIntercomDump(
      loadDump(),
      { workspaceId: "ws_1", authorId: "user_1" },
      store,
    );
    assert.equal(result.contacts.created, 2);
    assert.equal(result.contacts.skipped, 1);
    assert.equal(db.visitors.filter((row) => row.email === "ada@example.com").length, 1);
    const ada = db.visitors.find((row) => row.id === "vis_existing");
    const metadata = ada?.metadata as Record<string, unknown>;
    assert.equal(metadata.plan, "pro");
    assert.equal(metadata.importSource, "intercom");
    assert.equal(metadata.intercomId, "contact_ada");
  });

  it("creates a stub visitor when a conversation has no contacts", async () => {
    const db = createMemoryImportDb();
    const store = createMemoryImportStore(db, "ws_1");
    const dump = parseIntercomExport({
      conversations: [
        {
          type: "conversation",
          id: "orphan",
          state: "open",
          source: { body: "Hello from nowhere", created_at: 1715000000 },
        },
      ],
    });
    const result = await importIntercomDump(dump, { workspaceId: "ws_1", authorId: "user_1" }, store);
    assert.equal(result.conversations.created, 1);
    assert.equal(result.contacts.created, 1);
    assert.equal(db.visitors[0]?.name, "Imported visitor");
    assert.equal(db.messages.length, 1);
  });

  it("does not enable GudBot or write AI fields", async () => {
    const db = createMemoryImportDb();
    const store = createMemoryImportStore(db, "ws_1");
    await importIntercomDump(loadDump(), { workspaceId: "ws_1", authorId: "user_1" }, store);
    for (const conversation of db.conversations) {
      assert.equal("aiResolved" in conversation, false);
      assert.equal("gudBotEnabled" in conversation, false);
    }
    assert.equal("gudbot" in db, false);
  });
});
