import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { helpRouteMetadata } from "./metadata";

describe("helpRouteMetadata", () => {
  it("sets title, description, canonical, Open Graph, and a Twitter card", () => {
    const meta = helpRouteMetadata({
      title: "Reset your password | Acme Help Center",
      description: "Open Settings and choose Reset password.",
      path: "/help/acme/billing/reset-password",
      article: {
        publishedAt: new Date("2026-01-15T00:00:00.000Z"),
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
        authorName: "Ada",
      },
    });

    assert.equal(meta.title, "Reset your password | Acme Help Center");
    assert.equal(
      meta.alternates?.canonical,
      "https://www.guddesk.com/help/acme/billing/reset-password",
    );
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og.type, "article");
    assert.equal(og.url, "https://www.guddesk.com/help/acme/billing/reset-password");
    assert.equal(og.title, "Reset your password | Acme Help Center");
    const twitter = meta.twitter as Record<string, unknown>;
    assert.equal(twitter.card, "summary_large_image");
  });

  it("marks help search as noindex", () => {
    const meta = helpRouteMetadata({
      title: "Search | Acme Help Center",
      description: "Search articles in Acme Help Center.",
      path: "/help/acme/search",
      noIndex: true,
    });
    const robots = meta.robots as { index?: boolean };
    assert.equal(robots.index, false);
  });
});
