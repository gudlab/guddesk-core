import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("help SEO is wired on the hosted routes", () => {
  const root = join(__dirname, "..", "..");
  const read = (path: string) => readFileSync(join(root, path), "utf8");

  it("public article, collection, and index pages set generateMetadata", () => {
    for (const path of [
      "app/(help-center)/help/[workspaceSlug]/page.tsx",
      "app/(help-center)/help/[workspaceSlug]/[collectionSlug]/page.tsx",
      "app/(help-center)/help/[workspaceSlug]/[collectionSlug]/[articleSlug]/page.tsx",
    ]) {
      const src = read(path);
      assert.match(src, /export async function generateMetadata/, path);
      assert.match(src, /helpRouteMetadata\(/, path);
    }
  });

  it("article pages emit Article JSON-LD and only add FAQ JSON-LD from extractFaqPairs", () => {
    const src = read(
      "app/(help-center)/help/[workspaceSlug]/[collectionSlug]/[articleSlug]/page.tsx",
    );
    assert.match(src, /articleJsonLd\(/);
    assert.match(src, /extractFaqPairs\(/);
    assert.match(src, /faqPageJsonLd\(/);
  });

  it("sitemap includes public help URLs and robots allow /help while blocking search", () => {
    const sitemap = read("app/sitemap.ts");
    assert.match(sitemap, /getPublicHelpSitemapEntries/);
    assert.match(sitemap, /CANONICAL_ORIGIN/);
    const robots = read("app/robots.ts");
    assert.match(robots, /\/help\/\*\/search/);
    assert.doesNotMatch(robots, /disallow: \["\/help/);
  });

  it("search stays out of the index", () => {
    const src = read("app/(help-center)/help/[workspaceSlug]/search/page.tsx");
    assert.match(src, /noIndex:\s*true/);
  });
});
