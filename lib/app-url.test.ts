import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAppUrl, isPlaceholderAppUrl, resolveAppUrl } from "./app-url";

const PLACEHOLDER = "https://preview.guddesk.invalid";
const BRANCH = "guddesk-git-fix-preview-app-url-team.vercel.app";

describe("resolveAppUrl", () => {
  it("returns the configured URL exactly in production", () => {
    for (const appUrl of ["https://www.guddesk.com", "https://www.guddesk.com/", PLACEHOLDER]) {
      assert.equal(resolveAppUrl({ vercelEnv: "production", appUrl, branchUrl: BRANCH }), appUrl);
    }
  });

  it("returns the configured URL when VERCEL_ENV is unset or development", () => {
    assert.equal(resolveAppUrl({ appUrl: PLACEHOLDER, branchUrl: BRANCH }), PLACEHOLDER);
    assert.equal(
      resolveAppUrl({ vercelEnv: "development", appUrl: "http://localhost:3000", branchUrl: BRANCH }),
      "http://localhost:3000",
    );
  });

  it("uses the branch URL on Preview when the app URL is the placeholder", () => {
    assert.equal(
      resolveAppUrl({ vercelEnv: "preview", appUrl: PLACEHOLDER, branchUrl: BRANCH }),
      `https://${BRANCH}`,
    );
    assert.equal(
      resolveAppUrl({ vercelEnv: "preview", appUrl: "https://app.invalid/", branchUrl: `https://${BRANCH}/` }),
      `https://${BRANCH}`,
    );
  });

  it("keeps a real app URL on Preview", () => {
    assert.equal(
      resolveAppUrl({ vercelEnv: "preview", appUrl: "https://www.guddesk.com", branchUrl: BRANCH }),
      "https://www.guddesk.com",
    );
    assert.equal(
      resolveAppUrl({ vercelEnv: "preview", appUrl: "https://invalid.guddesk.com", branchUrl: BRANCH }),
      "https://invalid.guddesk.com",
    );
  });

  it("keeps the placeholder on Preview when the branch URL is missing", () => {
    assert.equal(resolveAppUrl({ vercelEnv: "preview", appUrl: PLACEHOLDER }), PLACEHOLDER);
    assert.equal(resolveAppUrl({ vercelEnv: "preview", appUrl: PLACEHOLDER, branchUrl: "  " }), PLACEHOLDER);
  });

  it("falls back to localhost only when no app URL is configured", () => {
    assert.equal(resolveAppUrl({}), "http://localhost:3000");
  });
});

describe("isPlaceholderAppUrl", () => {
  it("matches only the .invalid TLD", () => {
    assert.equal(isPlaceholderAppUrl(PLACEHOLDER), true);
    assert.equal(isPlaceholderAppUrl("https://PREVIEW.INVALID:443/x"), true);
    assert.equal(isPlaceholderAppUrl("preview.invalid"), true);
    assert.equal(isPlaceholderAppUrl("https://www.guddesk.com"), false);
    assert.equal(isPlaceholderAppUrl("https://invalid.example.com"), false);
    assert.equal(isPlaceholderAppUrl(undefined), false);
  });
});

describe("getAppUrl", () => {
  it("reads VERCEL_ENV, NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_VERCEL_BRANCH_URL", () => {
    const keys = ["VERCEL_ENV", "NEXT_PUBLIC_VERCEL_ENV", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_VERCEL_BRANCH_URL"];
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      process.env.VERCEL_ENV = "preview";
      process.env.NEXT_PUBLIC_APP_URL = PLACEHOLDER;
      process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL = BRANCH;
      assert.equal(getAppUrl(), `https://${BRANCH}`);
      process.env.VERCEL_ENV = "production";
      assert.equal(getAppUrl(), PLACEHOLDER);
      delete process.env.VERCEL_ENV;
      process.env.NEXT_PUBLIC_VERCEL_ENV = "preview";
      assert.equal(getAppUrl(), `https://${BRANCH}`);
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });
});
