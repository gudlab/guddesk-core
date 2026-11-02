import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  publishedArticleWhere,
  rankPublishedArticles,
  tokenizeQuery,
  type RetrievableArticle,
} from "./retrieve";

function article(
  partial: Partial<RetrievableArticle> & Pick<RetrievableArticle, "id" | "title">,
): RetrievableArticle {
  return {
    body: partial.body ?? `${partial.title} body`,
    excerpt: partial.excerpt ?? null,
    slug: partial.slug ?? partial.id,
    isPublished: partial.isPublished ?? true,
    collectionSlug: partial.collectionSlug ?? "docs",
    ...partial,
  };
}

describe("publishedArticleWhere", () => {
  it("always requires published articles for the workspace", () => {
    const where = publishedArticleWhere("ws_1", ["refund"]);
    assert.equal(where.workspaceId, "ws_1");
    assert.equal(where.isPublished, true);
    assert.equal(
      Object.prototype.hasOwnProperty.call(where, "isPublished"),
      true,
    );
  });

  it("does not add a published=false branch", () => {
    const where = publishedArticleWhere("ws_1", []);
    assert.deepEqual(where, { workspaceId: "ws_1", isPublished: true });
  });
});

describe("rankPublishedArticles", () => {
  it("drops unpublished articles even when they match the query", () => {
    const ranked = rankPublishedArticles(
      [
        article({
          id: "draft",
          title: "Refund policy draft",
          body: "How to request a refund",
          isPublished: false,
        }),
        article({
          id: "live",
          title: "Refund policy",
          body: "How to request a refund",
          isPublished: true,
        }),
      ],
      "How do I request a refund?",
    );
    assert.deepEqual(
      ranked.map((item) => item.id),
      ["live"],
    );
  });

  it("ranks a title match above a body-only match", () => {
    const ranked = rankPublishedArticles(
      [
        article({
          id: "body",
          title: "Shipping times",
          body: "Refunds take 5 days after we receive the item.",
        }),
        article({
          id: "title",
          title: "Refunds",
          body: "Contact support if you need help.",
        }),
      ],
      "refund",
    );
    assert.equal(ranked[0]?.id, "title");
  });

  it("returns nothing when no published article matches", () => {
    const ranked = rankPublishedArticles(
      [
        article({
          id: "unrelated",
          title: "Office hours",
          body: "We are open Monday to Friday.",
        }),
      ],
      "how do I reset my password",
    );
    assert.deepEqual(ranked, []);
  });
});

describe("tokenizeQuery", () => {
  it("drops stopwords and duplicates", () => {
    assert.deepEqual(tokenizeQuery("How do I request a refund refund?"), [
      "request",
      "refund",
    ]);
  });
});
