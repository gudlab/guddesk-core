import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articleSchema, collectionSchema } from "./article";

describe("articleSchema slugs", () => {
  const base = {
    title: "Reset your password",
    body: "Open Settings.",
    collectionId: null,
  };

  it("normalizes a messy slug on create", () => {
    const parsed = articleSchema.parse({
      ...base,
      slug: "  Cómo resetear!  ",
    });
    assert.equal(parsed.slug, "como-resetear");
  });

  it("rejects an empty slug after normalize", () => {
    assert.equal(
      articleSchema.safeParse({ ...base, slug: "???" }).success,
      false,
    );
  });
});

describe("collectionSchema slugs", () => {
  it("normalizes and rejects the reserved search slug", () => {
    const parsed = collectionSchema.parse({
      name: "Getting Started",
      slug: "Getting  Started",
    });
    assert.equal(parsed.slug, "getting-started");
    assert.equal(
      collectionSchema.safeParse({ name: "Search", slug: "search" }).success,
      false,
    );
  });
});
