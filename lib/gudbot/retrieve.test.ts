import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  articleSnippet,
  containsToken,
  publishedArticleWhere,
  rankPublishedArticles,
  retrievalTokens,
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

  it("grounds snippets in the article body, not a short SEO excerpt", () => {
    const ranked = rankPublishedArticles(
      [
        article({
          id: "install",
          title: "Install the chat widget",
          excerpt: "Add the messenger with two snippets.",
          body: 'Set window.GudDeskSettings = { appId: "gd_pub_YOUR_APP_ID" } then load widget.js.',
        }),
      ],
      "How do I install the chat widget?",
    );
    assert.equal(ranked.length, 1);
    assert.match(ranked[0]?.excerpt ?? "", /GudDeskSettings/);
    assert.match(ranked[0]?.excerpt ?? "", /gd_pub_/);
  });

  it("matches paraphrases, stems, compounds, and option names", () => {
    const articles = [
      article({
        id: "customize",
        title: "Customize the widget",
        excerpt: "Change the accent color and visibility.",
        body: "hideOnMobile: true hides the launcher on mobile devices. openOnLoad: true opens the messenger.",
      }),
      article({
        id: "open-source",
        title: "Open source and self-hosting",
        excerpt: "GudDesk is an open-source (AGPL) Intercom alternative.",
        body: "GudDesk is an open-source Intercom alternative licensed under the AGPL (AGPL-3.0).",
      }),
      article({
        id: "snooze",
        title: "Snooze and tag conversations",
        excerpt: "Snooze a conversation until later.",
        body: "A snoozed conversation reopens automatically at the time you picked.",
      }),
      article({
        id: "plans",
        title: "Plans and pricing",
        excerpt: "GudDesk Cloud has Free and Pro.",
        body: "Free includes up to 2 team members and 500 conversations per month.",
      }),
      article({
        id: "csp",
        title: "Troubleshooting: the widget is not showing",
        excerpt: "Checklist for when the launcher does not appear.",
        body: "Allow https://cdn.guddesk.com/widget.js in your Content Security Policy.",
      }),
    ];

    const phone = rankPublishedArticles(
      articles,
      "The chat bubble shows on desktop but not on my phone. Why?",
    );
    assert.ok(
      phone.some((item) => item.id === "customize"),
      `customize should be retrieved, got ${phone.map((item) => item.id).join(",")}`,
    );
    assert.match(
      phone.find((item) => item.id === "customize")?.excerpt ?? "",
      /hideOnMobile/,
    );

    const oss = rankPublishedArticles(
      articles,
      "is guddesk opensource or proprietary",
    );
    assert.equal(oss[0]?.id, "open-source");

    const snooze = rankPublishedArticles(
      articles,
      "When does a snoozed conversation come back?",
    );
    assert.equal(snooze[0]?.id, "snooze");

    const convos = rankPublishedArticles(articles, "free tier how many convos");
    assert.equal(convos[0]?.id, "plans");
    assert.match(convos[0]?.excerpt ?? "", /500/);

    const csp = rankPublishedArticles(
      articles,
      "Our CSP might be blocking the widget — what domain do I need to allow?",
    );
    assert.equal(csp[0]?.id, "csp");
  });

  it("does not treat 'not' as a match for 'notes'", () => {
    const ranked = rankPublishedArticles(
      [
        article({
          id: "notes",
          title: "Internal notes",
          body: "Leave team-only notes on a conversation.",
        }),
      ],
      "The chat bubble is not on my phone",
    );
    assert.deepEqual(ranked, []);
  });
});

describe("articleSnippet", () => {
  it("keeps the full body when it fits", () => {
    const snippet = articleSnippet(
      {
        excerpt: "Short blurb.",
        body: "Use Bearer gd_YOUR_KEY and return HTTP 500 on failure.",
      },
      ["bearer"],
    );
    assert.match(snippet, /Bearer gd_YOUR_KEY/);
    assert.match(snippet, /HTTP 500/);
    assert.equal(snippet.includes("Short blurb."), false);
  });

  it("pulls the matching window from a long article", () => {
    const prefix = "Intro padding. ".repeat(400);
    const body = `${prefix}Set openOnLoad: true to open the messenger automatically. ${"Tail padding. ".repeat(400)}`;
    const snippet = articleSnippet({ excerpt: "Visibility options.", body }, [
      "openonload",
    ]);
    assert.match(snippet, /openOnLoad/);
    assert.ok(snippet.length < body.length);
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

describe("retrievalTokens", () => {
  it("adds stems and synonyms for short paraphrases", () => {
    const tokens = retrievalTokens("free tier how many convos");
    assert.ok(tokens.includes("convos"));
    assert.ok(tokens.includes("conversation") || tokens.includes("conversations"));
  });
});

describe("containsToken", () => {
  it("matches a stem in the title but not a short prefix of another word", () => {
    assert.equal(containsToken("Refunds", "refund"), true);
    assert.equal(containsToken("Internal notes", "not"), false);
  });
});

describe("Month 2 seeded KB ranking", () => {
  const kb = JSON.parse(
    readFileSync(join(process.cwd(), "qa/ai-eval/seeded-kb.json"), "utf8"),
  ) as Array<{
    slug: string;
    title: string;
    body: string;
    excerpt: string;
    collectionSlug: string;
  }>;
  const questions = readFileSync(
    join(process.cwd(), "qa/ai-eval/questions.jsonl"),
    "utf8",
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as {
      id: number;
      question: string;
      expected_action: string;
      must_include: string[];
      expected_citation_slugs: string[] | null;
    });

  const articles: RetrievableArticle[] = kb.map((row) =>
    article({
      id: row.slug,
      title: row.title,
      body: row.body,
      excerpt: row.excerpt,
      slug: row.slug,
      collectionSlug: row.collectionSlug,
    }),
  );

  it("keeps the expected article in the top 5 for every answerable eval question", () => {
    const misses: string[] = [];
    for (const question of questions) {
      if (question.expected_action !== "answer") continue;
      const expected = question.expected_citation_slugs ?? [];
      if (expected.length === 0) continue;
      const ranked = rankPublishedArticles(articles, question.question);
      const hit = expected.some((slug) =>
        ranked.some((item) => item.slug === slug),
      );
      if (!hit) {
        misses.push(
          `#${question.id} ${question.question} expected ${expected.join(",")} got ${ranked.map((item) => item.slug).join(",") || "(none)"}`,
        );
      }
    }
    assert.deepEqual(misses, []);
  });

  it("puts must_include facts in the snippet of the expected article", () => {
    const misses: string[] = [];
    for (const question of questions) {
      if (question.expected_action !== "answer") continue;
      const expected = question.expected_citation_slugs ?? [];
      const ranked = rankPublishedArticles(articles, question.question);
      for (const slug of expected) {
        const snippet = ranked.find((item) => item.slug === slug)?.excerpt;
        if (!snippet) continue;
        for (const fact of question.must_include ?? []) {
          if (!snippet.toLowerCase().includes(fact.toLowerCase())) {
            misses.push(`#${question.id} ${slug} missing ${fact}`);
          }
        }
      }
    }
    assert.deepEqual(misses, []);
  });
});
