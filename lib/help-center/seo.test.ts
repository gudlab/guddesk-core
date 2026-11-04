import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  articleJsonLd,
  articlePublicPath,
  breadcrumbListJsonLd,
  extractFaqPairs,
  faqPageJsonLd,
  helpCenterPath,
  helpCenterTitle,
  helpMetaDescription,
  publicHelpSitemapEntries,
  questionHeading,
} from "./seo";

describe("help center paths", () => {
  it("stays on the existing /help/... public routes", () => {
    assert.equal(helpCenterPath({ workspaceSlug: "acme" }), "/help/acme");
    assert.equal(
      helpCenterPath({ workspaceSlug: "acme", collectionSlug: "billing" }),
      "/help/acme/billing",
    );
    assert.equal(
      articlePublicPath("acme", "billing", "reset-password"),
      "/help/acme/billing/reset-password",
    );
    assert.equal(
      articlePublicPath("acme", null, "reset-password"),
      "/help/acme/uncategorized/reset-password",
    );
  });
});

describe("help metadata copy", () => {
  it("uses the workspace name when settings have no title", () => {
    assert.equal(helpCenterTitle(null, "Acme"), "Acme Help Center");
    assert.equal(helpCenterTitle("  Acme Docs  ", "Acme"), "Acme Docs");
  });

  it("prefers excerpt and flattens body whitespace", () => {
    assert.equal(
      helpMetaDescription("Short excerpt.", "A much longer body"),
      "Short excerpt.",
    );
    assert.equal(
      helpMetaDescription(null, "Click  Settings.\nThen reset."),
      "Click Settings. Then reset.",
    );
  });
});

describe("FAQ extraction", () => {
  it("emits pairs only for a clear Q&A article", () => {
    const body = [
      "Common account questions.",
      "",
      "How do I reset my password?",
      "",
      "Open Settings and choose Reset password.",
      "",
      "How do I change my email?",
      "",
      "Open your profile and edit the email field.",
    ].join("\n");
    assert.deepEqual(extractFaqPairs(body), [
      {
        question: "How do I reset my password?",
        answer: "Open Settings and choose Reset password.",
      },
      {
        question: "How do I change my email?",
        answer: "Open your profile and edit the email field.",
      },
    ]);
  });

  it("skips a narrative article that happens to ask a question", () => {
    const body = [
      "Shipping usually takes three days.",
      "",
      "What if my order is late? We email you with a new date.",
      "",
      "You can also write to support from the widget.",
    ].join("\n");
    assert.deepEqual(extractFaqPairs(body), []);
  });

  it("skips a single question", () => {
    const body = [
      "How do I reset my password?",
      "",
      "Open Settings and choose Reset password.",
    ].join("\n");
    assert.deepEqual(extractFaqPairs(body), []);
  });

  it("accepts single-newline Q&A when each question is its own line", () => {
    const body = [
      "How do I reset my password?",
      "Open Settings and choose Reset password.",
      "How do I change my email?",
      "Open your profile and edit the email field.",
    ].join("\n");
    assert.equal(extractFaqPairs(body).length, 2);
  });

  it("accepts markdown question headings", () => {
    const body = [
      "## How do I export data?",
      "",
      "Use Settings, then Export.",
      "",
      "## Can I cancel a plan?",
      "",
      "Yes. Close the workspace from Billing.",
    ].join("\n");
    assert.equal(extractFaqPairs(body).length, 2);
    assert.equal(questionHeading("## How do I export data?"), "How do I export data?");
  });
});

describe("JSON-LD builders", () => {
  it("builds Article structured data for a published page", () => {
    const data = articleJsonLd({
      url: "https://www.guddesk.com/help/acme/billing/reset-password",
      headline: "Reset your password",
      description: "Open Settings and choose Reset password.",
      datePublished: "2026-01-15T00:00:00.000Z",
      dateModified: "2026-02-01T00:00:00.000Z",
      authorName: "Ada",
      publisherName: "Acme",
    });
    assert.equal(data["@type"], "Article");
    assert.equal(data.headline, "Reset your password");
    assert.deepEqual(data.author, { "@type": "Person", name: "Ada" });
    assert.deepEqual(data.publisher, { "@type": "Organization", name: "Acme" });
    assert.equal(data.datePublished, "2026-01-15T00:00:00.000Z");
  });

  it("omits FAQPage JSON-LD unless there are at least two pairs", () => {
    assert.equal(faqPageJsonLd([]), null);
    assert.equal(
      faqPageJsonLd([{ question: "Only one?", answer: "Yes." }]),
      null,
    );
    const faq = faqPageJsonLd([
      { question: "How do I reset my password?", answer: "Open Settings." },
      { question: "How do I change my email?", answer: "Edit your profile." },
    ]);
    assert.equal(faq?.["@type"], "FAQPage");
  });

  it("builds breadcrumbs for the public article URL", () => {
    const data = breadcrumbListJsonLd([
      { name: "Help Center", url: "https://www.guddesk.com/help/acme" },
      { name: "Billing", url: "https://www.guddesk.com/help/acme/billing" },
    ]);
    assert.equal(data["@type"], "BreadcrumbList");
  });
});

describe("public help sitemap entries", () => {
  const now = new Date("2026-03-01T00:00:00.000Z");
  const earlier = new Date("2026-02-01T00:00:00.000Z");

  it("lists published help index, collection, and article URLs", () => {
    const entries = publicHelpSitemapEntries([
      {
        slug: "acme",
        updatedAt: earlier,
        collections: [
          {
            slug: "billing",
            isPublished: true,
            updatedAt: earlier,
            articles: [
              {
                slug: "reset-password",
                isPublished: true,
                updatedAt: now,
                publishedAt: now,
              },
              {
                slug: "draft-refunds",
                isPublished: false,
                updatedAt: now,
                publishedAt: null,
              },
            ],
          },
          {
            slug: "secret",
            isPublished: false,
            updatedAt: now,
            articles: [
              {
                slug: "internal",
                isPublished: true,
                updatedAt: now,
                publishedAt: now,
              },
            ],
          },
        ],
      },
    ]);

    assert.deepEqual(
      entries.map((entry) => entry.path),
      [
        "/help/acme",
        "/help/acme/billing",
        "/help/acme/billing/reset-password",
      ],
    );
    assert.equal(
      entries.find((entry) => entry.path === "/help/acme/billing/reset-password")
        ?.lastModified,
      now,
    );
  });

  it("skips workspaces with no published collections", () => {
    assert.deepEqual(
      publicHelpSitemapEntries([
        {
          slug: "empty",
          updatedAt: now,
          collections: [
            {
              slug: "drafts",
              isPublished: false,
              updatedAt: now,
              articles: [],
            },
          ],
        },
      ]),
      [],
    );
  });
});
