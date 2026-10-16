import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

const require = createRequire(import.meta.url);
const { apexWwwRedirects, skipApexWwwRedirect } = require(
  "./apex-www-redirect.cjs",
) as {
  skipApexWwwRedirect: (pathname: string) => boolean;
  apexWwwRedirects: () => Array<{
    source: string;
    destination: string;
    has?: Array<{ value: string }>;
  }>;
};

describe("skipApexWwwRedirect", () => {
  it("skips widget, pusher, and other API paths", () => {
    assert.equal(skipApexWwwRedirect("/api"), true);
    assert.equal(skipApexWwwRedirect("/api/"), true);
    assert.equal(skipApexWwwRedirect("/api/widget/config"), true);
    assert.equal(skipApexWwwRedirect("/api/widget/auth"), true);
    assert.equal(skipApexWwwRedirect("/api/pusher/auth"), true);
  });

  it("does not skip marketing pages or the widget script", () => {
    assert.equal(skipApexWwwRedirect("/"), false);
    assert.equal(skipApexWwwRedirect("/docs"), false);
    assert.equal(skipApexWwwRedirect("/widget.js"), false);
    assert.equal(skipApexWwwRedirect("/apiary"), false);
  });
});

describe("apexWwwRedirects", () => {
  it("only rewrites the guddesk.com host and excludes /api", () => {
    const rules = apexWwwRedirects();
    assert.ok(rules.every((rule) => rule.has?.[0]?.value === "guddesk.com"));
    const pathRule = rules.find((rule) => rule.source.includes(":path"));
    assert.ok(pathRule);
    assert.match(pathRule.source, /api/);
    assert.equal(
      pathRule.destination,
      "https://www.guddesk.com/:path*",
    );
  });
});
