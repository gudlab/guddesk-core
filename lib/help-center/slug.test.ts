import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FALLBACK_COLLECTION_SLUG,
  generateArticleSlug,
  generateCollectionSlug,
  isUrlSafeSlug,
  nextStoredSlug,
  normalizeSlug,
  pickBySlugPreference,
  slugLookupCandidates,
  slugify,
  uniqueSlug,
} from "./slug";

describe("normalizeSlug", () => {
  it("lowercases, strips accents, and collapses punctuation to single hyphens", () => {
    assert.equal(normalizeSlug("Cómo resetear  la contraseña!"), "como-resetear-la-contrasena");
    assert.equal(normalizeSlug("Hello--World__API"), "hello-world-api");
    assert.equal(normalizeSlug("  /Billing & invoices/  "), "billing-invoices");
  });

  it("returns an empty string when nothing URL-safe remains", () => {
    assert.equal(normalizeSlug("???"), "");
    assert.equal(normalizeSlug(""), "");
  });

  it("respects max length without leaving a trailing hyphen", () => {
    assert.equal(normalizeSlug("reset-your-password-now", 10), "reset-your");
  });
});

describe("slugify and generators", () => {
  it("falls back when the title is only punctuation", () => {
    assert.equal(slugify("!!!", "article"), "article");
  });

  it("keeps article slugs URL-safe", () => {
    const slug = generateArticleSlug("Reset your password");
    assert.equal(slug, "reset-your-password");
    assert.equal(isUrlSafeSlug(slug), true);
  });

  it("does not emit the reserved collection slug `search`", () => {
    assert.equal(generateCollectionSlug("Search"), "search-collection");
    assert.notEqual(generateCollectionSlug("Getting Started"), "search");
  });
});

describe("slugLookupCandidates", () => {
  it("keeps the requested slug first so existing URLs still resolve", () => {
    assert.deepEqual(slugLookupCandidates("Hello--World"), [
      "Hello--World",
      "hello--world",
      "hello-world",
    ]);
  });

  it("does not drop an already-clean stored slug", () => {
    assert.deepEqual(slugLookupCandidates("reset-your-password"), [
      "reset-your-password",
    ]);
  });
});

describe("nextStoredSlug", () => {
  it("leaves an existing published slug unchanged when the editor resubmits it", () => {
    assert.equal(nextStoredSlug("hello--world", "hello--world", 200), "hello--world");
  });

  it("normalizes only when the slug actually changes", () => {
    assert.equal(nextStoredSlug("Hello World", "hello--world", 200), "hello-world");
  });
});

describe("uniqueSlug", () => {
  it("suffixes when the base is taken or reserved", async () => {
    const taken = async (slug: string) => slug === "billing";
    assert.equal(await uniqueSlug("docs", taken), "docs");
    assert.equal(await uniqueSlug("billing", taken), "billing-2");
    assert.equal(await uniqueSlug("search", taken, new Set(["search"])), "search-2");
  });
});

describe("pickBySlugPreference", () => {
  it("returns the exact requested slug when two rows could match", () => {
    const rows = [{ slug: "hello-world" }, { slug: "hello--world" }];
    assert.equal(
      pickBySlugPreference(rows, ["hello--world", "hello-world"])?.slug,
      "hello--world",
    );
  });
});

describe("fallback collection slug", () => {
  it("stays a stable public path segment", () => {
    assert.equal(FALLBACK_COLLECTION_SLUG, "uncategorized");
    assert.equal(isUrlSafeSlug(FALLBACK_COLLECTION_SLUG), true);
  });
});
