import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  CANONICAL_ORIGIN,
  DEFAULT_OG_IMAGE,
  canonicalUrl,
  isIndexableDeployment,
  withCanonical,
} from "./canonical";

describe("canonical URLs", () => {
  it("uses the hardcoded www origin", () => {
    assert.equal(CANONICAL_ORIGIN, "https://www.guddesk.com");
    assert.equal(canonicalUrl("/"), "https://www.guddesk.com/");
    assert.equal(canonicalUrl("/pricing"), "https://www.guddesk.com/pricing");
    assert.equal(canonicalUrl("pricing/"), "https://www.guddesk.com/pricing");
    assert.equal(canonicalUrl("//docs//quickstart"), "https://www.guddesk.com/docs/quickstart");
  });

  it("does not depend on NEXT_PUBLIC_APP_URL", () => {
    const saved = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://preview.guddesk.invalid";
    try {
      assert.equal(canonicalUrl("/pricing"), "https://www.guddesk.com/pricing");
    } finally {
      if (saved === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
      else process.env.NEXT_PUBLIC_APP_URL = saved;
    }
  });

  it("adds a canonical tag and a per-page og:url, keeping the page's own Open Graph fields", () => {
    const meta = withCanonical(
      { title: "Pricing | GudDesk", description: "Plans", openGraph: { title: "OG title" } },
      "/pricing",
    );
    assert.deepEqual(meta.alternates, { canonical: "https://www.guddesk.com/pricing" });
    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og.url, "https://www.guddesk.com/pricing");
    assert.equal(og.title, "OG title");
    assert.equal(og.description, "Plans");
    assert.equal(og.siteName, "GudDesk");
  });

  it("keeps og:image: adds the default image when the page has none", () => {
    const og = withCanonical({ title: "Pricing | GudDesk" }, "/pricing").openGraph as Record<string, unknown>;
    assert.deepEqual(og.images, [DEFAULT_OG_IMAGE]);
    assert.equal(DEFAULT_OG_IMAGE.url, "https://www.guddesk.com/opengraph-image.jpg");
    assert.equal(DEFAULT_OG_IMAGE.width, 1200);
    assert.equal(DEFAULT_OG_IMAGE.height, 630);
  });

  it("keeps a page's own og:image", () => {
    const images = [{ url: "https://www.guddesk.com/blog/post.png" }];
    const og = withCanonical({ title: "Post", openGraph: { images } }, "/blog/post").openGraph as Record<string, unknown>;
    assert.deepEqual(og.images, images);
  });

  it("only production is indexable", () => {
    assert.equal(isIndexableDeployment("production"), true);
    for (const env of ["preview", "development", undefined, ""]) {
      assert.equal(isIndexableDeployment(env), false, String(env));
    }
  });
});

describe("SEO files use the canonical origin", () => {
  const root = join(__dirname, "..");
  const read = (path: string) => readFileSync(join(root, path), "utf8");

  for (const path of ["app/sitemap.ts", "app/robots.ts", "components/shared/json-ld.tsx"]) {
    it(`${path} uses CANONICAL_ORIGIN, not getAppUrl or siteConfig.url`, () => {
      const src = read(path);
      assert.match(src, /CANONICAL_ORIGIN/);
      assert.doesNotMatch(src, /getAppUrl\(|siteConfig\.url|NEXT_PUBLIC_APP_URL/);
    });
  }

  it("the default og:image file exists at 1200x630", () => {
    const jpg = readFileSync(join(root, "app", "opengraph-image.jpg"));
    // JPEG SOF0 marker: height then width, big endian.
    const sof = jpg.indexOf(Buffer.from([0xff, 0xc0]));
    assert.ok(sof > 0);
    assert.equal(jpg.readUInt16BE(sof + 5), 630);
    assert.equal(jpg.readUInt16BE(sof + 7), 1200);
  });

  // The pages QA saw lose og:image. Each must build its metadata through
  // withCanonical or constructMetadata({ path }), which carry the image.
  for (const page of [
    "app/(marketing)/page.tsx",
    "app/(marketing)/alternatives/[slug]/page.tsx",
    "app/(marketing)/integrations/page.tsx",
    "app/(marketing)/pricing/page.tsx",
    "app/(marketing)/roadmap/page.tsx",
  ]) {
    it(`${page} metadata goes through withCanonical`, () => {
      assert.match(read(page), /withCanonical\(|constructMetadata\(\{ path:/);
    });
  }

  it("help center metadata goes through withCanonical", () => {
    assert.match(read("lib/help-center/metadata.ts"), /withCanonical\(/);
  });

  it("/login, /register and /forgot-password have canonical tags", () => {
    assert.match(read("app/(auth)/login/page.tsx"), /canonical: canonicalUrl\("\/login"\)/);
    assert.match(read("app/(auth)/register/page.tsx"), /canonical: canonicalUrl\("\/register"\)/);
    const forgot = read("app/(auth)/forgot-password/page.tsx");
    assert.match(forgot, /canonical: canonicalUrl\("\/forgot-password"\)/);
    assert.match(forgot, /title: "Forgot Password \| GudDesk"/);
    assert.ok(!/[\u2013\u2014]/.test(forgot), "no en or em dash in the forgot-password page");
    const reset = read("app/(auth)/reset-password/page.tsx");
    assert.match(reset, /title: "Reset Password \| GudDesk"/);
    assert.ok(!/[\u2013\u2014]/.test(reset), "no en or em dash in the reset-password page");
  });

  it("metadataBase is the canonical origin, and email links still use getAppUrl", () => {
    const utils = read("lib/utils.ts");
    assert.match(utils, /metadataBase: new URL\(CANONICAL_ORIGIN\)/);
    assert.match(utils, /manifest: "\/site.webmanifest"/);
    assert.doesNotMatch(utils, /manifest: `\$\{siteConfig\.url\}/);
    for (const path of ["actions/invite-workspace-member.ts", "actions/forgot-password.ts", "app/api/stripe/checkout/route.ts"]) {
      const src = read(path);
      assert.match(src, /getAppUrl\(/, path);
      assert.doesNotMatch(src, /CANONICAL_ORIGIN|metadataBase/, path);
    }
  });

  it("the root layout's og:url is not the home page for every route", () => {
    const utils = read("lib/utils.ts");
    assert.doesNotMatch(utils, /url: siteConfig\.url,/);
  });

  it("JSON-LD Free offer matches the lock and has no Automation Rules or CSAT", () => {
    const src = read("components/shared/json-ld.tsx");
    assert.doesNotMatch(src, /Automation Rules/);
    assert.doesNotMatch(src, /csat/i);
    assert.doesNotMatch(src, /2 seats and 500 conversations/i);
    assert.match(
      src,
      /Free for 3 members, unlimited conversations, 50 GudBot answers a month/,
    );
  });
});
