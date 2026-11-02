import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { parseIntercomExport, toPlainBody } from "./parse";
import { previewCounts } from "./types";
import { zipTextFiles } from "./zip";

const fixturePath = join(
  process.cwd(),
  "lib/import/intercom/fixtures/sample-export.json",
);

function loadFixture() {
  return JSON.parse(readFileSync(fixturePath, "utf8"));
}

describe("parseIntercomExport", () => {
  it("reads the in-repo sample dump", () => {
    const dump = parseIntercomExport(loadFixture());
    const counts = previewCounts(dump);
    assert.deepEqual(counts, {
      contacts: 3,
      collections: 1,
      articles: 2,
      articlesPublished: 1,
      conversations: 2,
      conversationsClosed: 1,
      messages: 5,
    });
    assert.equal(dump.contacts[0]?.email, "ada@example.com");
    assert.equal(dump.contacts[0]?.externalId, "ada-42");
    assert.equal(dump.articles.find((article) => article.id === "art_reset")?.published, true);
    assert.equal(dump.articles.find((article) => article.id === "art_refund")?.published, false);
    assert.equal(dump.conversations.find((c) => c.id === "conv_open")?.status, "OPEN");
    assert.equal(dump.conversations.find((c) => c.id === "conv_closed")?.status, "CLOSED");
    assert.equal(dump.conversations.find((c) => c.id === "conv_closed")?.channel, "EMAIL");
    assert.equal(dump.conversations.find((c) => c.id === "conv_open")?.channel, "API");
  });

  it("strips Intercom HTML into plain text", () => {
    assert.equal(toPlainBody("<p>Hello <strong>Ada</strong></p>"), "Hello Ada");
    assert.equal(toPlainBody("Already plain"), "Already plain");
  });

  it("reads Intercom list wrappers and JSONL", () => {
    const dump = parseIntercomExport({
      type: "list",
      data: [
        { type: "contact", id: "c1", email: "a@example.com", name: "A" },
        { type: "article", id: "a1", title: "T", body: "B", state: "draft" },
      ],
    });
    assert.equal(dump.contacts.length, 1);
    assert.equal(dump.articles.length, 1);

    const jsonl = [
      JSON.stringify({ type: "contact", id: "c2", name: "B" }),
      JSON.stringify({ type: "conversation", id: "v1", state: "open", source: { body: "Hi" } }),
    ].join("\n");
    const fromLines = parseIntercomExport(jsonl);
    assert.equal(fromLines.contacts.length, 1);
    assert.equal(fromLines.conversations.length, 1);
    assert.equal(fromLines.conversations[0]?.messages.length, 1);
  });

  it("reads a zip of named JSON files", () => {
    const zip = zipTextFiles({
      "contacts.json": JSON.stringify([
        { type: "contact", id: "z1", email: "z@example.com", name: "Zip" },
      ]),
      "articles.json": JSON.stringify({
        type: "list",
        data: [{ type: "article", id: "za1", title: "Zed", body: "<p>Zip body</p>", state: "published" }],
      }),
    });
    const dump = parseIntercomExport(zip);
    assert.equal(dump.contacts.length, 1);
    assert.equal(dump.articles.length, 1);
    assert.equal(dump.articles[0]?.body.includes("Zip body"), true);
  });

  it("maps admin notes and skips assignment parts", () => {
    const dump = parseIntercomExport({
      conversations: [
        {
          type: "conversation",
          id: "c-note",
          state: "open",
          conversation_parts: {
            conversation_parts: [
              {
                id: "n1",
                part_type: "note",
                body: "<p>internal only</p>",
                author: { type: "admin", name: "Riley" },
              },
              {
                id: "as1",
                part_type: "assignment",
                author: { type: "admin", name: "Riley" },
              },
            ],
          },
        },
      ],
    });
    assert.equal(dump.conversations[0]?.messages.length, 1);
    assert.equal(dump.conversations[0]?.messages[0]?.type, "NOTE");
  });

  it("does not put file contents into parse errors", () => {
    assert.throws(
      () => parseIntercomExport("not-json and definitely-not a secret token sk_live_123"),
      (error: Error) => {
        assert.match(error.message, /not valid JSON/i);
        assert.doesNotMatch(error.message, /sk_live_123/);
        return true;
      },
    );
  });

  it("rejects an empty object", () => {
    assert.throws(() => parseIntercomExport({ hello: "world" }), /No contacts/);
  });
});
