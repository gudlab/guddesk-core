import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  citationsFromRetrieved,
  formatBotBody,
  sanitizeCitationIds,
} from "./citations";
import type { RankedArticle } from "./retrieve";

const retrieved: RankedArticle[] = [
  {
    id: "art_1",
    title: "Refund policy",
    excerpt: "Refunds take 5 days.",
    slug: "refund-policy",
    collectionSlug: "billing",
    score: 4,
  },
  {
    id: "art_2",
    title: "Shipping",
    excerpt: "Ships in 2 days.",
    slug: "shipping",
    collectionSlug: "orders",
    score: 2,
  },
];

describe("sanitizeCitationIds", () => {
  it("keeps only ids from the retrieved set", () => {
    assert.deepEqual(
      sanitizeCitationIds(["art_1", "hallucinated", "art_2", "art_1"], [
        "art_1",
        "art_2",
      ]),
      ["art_1", "art_2"],
    );
  });

  it("drops every id when the model cites nothing retrieved", () => {
    assert.deepEqual(sanitizeCitationIds(["made-up"], ["art_1"]), []);
  });
});

describe("citationsFromRetrieved", () => {
  it("never returns a citation whose id was not retrieved", () => {
    const citations = citationsFromRetrieved(
      ["art_1", "not-in-set", "art_2"],
      retrieved,
      new Map([["art_1", "https://example.test/help/refund"]]),
    );
    assert.deepEqual(
      citations.map((citation) => citation.id),
      ["art_1", "art_2"],
    );
    assert.equal(citations[0]?.url, "https://example.test/help/refund");
    assert.equal(citations[1]?.url, null);
  });
});

describe("formatBotBody", () => {
  it("appends visible source titles and links", () => {
    const body = formatBotBody("You can request a refund in billing.", [
      {
        type: "article",
        id: "art_1",
        title: "Refund policy",
        url: "https://example.test/help/refund",
        score: 4,
      },
    ]);
    assert.match(body, /You can request a refund in billing/);
    assert.match(body, /Sources:/);
    assert.match(body, /Refund policy/);
    assert.match(body, /https:\/\/example\.test\/help\/refund/);
  });
});
