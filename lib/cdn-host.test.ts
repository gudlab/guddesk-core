import assert from "node:assert/strict";
import { describe, it } from "node:test";
import loadCustomRoutes from "next/dist/lib/load-custom-routes";
import { formatUrl } from "next/dist/shared/lib/router/utils/format-url";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import {
  matchHas,
  prepareDestination,
} from "next/dist/shared/lib/router/utils/prepare-destination";

import { apiHostRedirects, cdnHostRedirects } from "../config/api-host.cjs";
import { helpRedirects } from "../config/security-headers.cjs";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{ type: string; value?: string }>;
};

/** The full redirect list, in the order next.config.js returns it. */
function redirects(): Redirect[] {
  return [
    ...apiHostRedirects(),
    ...cdnHostRedirects(),
    ...helpRedirects(),
  ] as Redirect[];
}

/** First redirect Next would apply, using Next's own matchers. */
function resolve(host: string, pathname: string) {
  for (const route of redirects()) {
    const params = getPathMatch(route.source, {
      strict: true,
      removeUnnamedParams: true,
    })(pathname);
    if (!params) continue;
    const hasParams = matchHas(
      { headers: { host } } as never,
      {},
      route.has as never,
      [],
    );
    if (!hasParams) continue;
    const { parsedDestination } = prepareDestination({
      appendParamsToQuery: false,
      destination: route.destination,
      params: { ...params, ...hasParams },
      query: {},
    });
    return {
      destination: formatUrl(parsedDestination as never),
      permanent: route.permanent,
    };
  }
  return null;
}

const KEPT_ON_CDN = [
  "/widget.js",
  "/api/widget",
  "/api/widget/config",
  "/api/widget/visitors",
  "/api/widget/auth",
  "/api/widget/articles",
  "/api/widget/surveys",
  "/api/widget/conversations",
  "/api/widget/conversations/conv_1/messages",
  "/api/pusher",
  "/api/pusher/auth",
  // Webhooks and callbacks that external services POST to
  "/api/webhooks",
  "/api/webhooks/stripe",
  "/api/stripe/webhook",
  "/api/email/inbound",
  "/api/agent/reply",
  "/api/agent/typing",
  "/api/agent/webhooks",
  "/api/cron/sla-check",
  "/api/cron/webhook-retry",
  // API clients
  "/api/mcp",
  "/api/v1",
  "/api/v1/conversations",
  "/api/v1/conversations/conv_1/messages",
  "/api/v1/customers/cust_1/events",
];

describe("cdn.guddesk.com serves only the widget", () => {
  it("passes Next's own route validation", async () => {
    const routes = await loadCustomRoutes({
      redirects: async () => redirects(),
    } as never);
    assert.ok(routes.redirects.length >= redirects().length);
  });

  it("keeps the script and the widget and pusher APIs on the cdn host", () => {
    for (const pathname of KEPT_ON_CDN) {
      assert.equal(resolve("cdn.guddesk.com", pathname), null, pathname);
    }
  });

  it("redirects every other path to the same path on www, not permanently", () => {
    for (const pathname of [
      "/",
      "/pricing",
      "/docs/widget/installation",
      "/dashboard",
      "/login",
      "/help",
      "/help/acme",
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/_next/static/chunks/app.js",
      "/_next/image",
      "/guddesk-logo.png",
      "/widget.js.map",
      "/widget.jsx",
      "/api",
      "/api/auth/session",
      "/api/auth/callback/google",
      "/api/inbox/conversations",
      "/api/user",
      "/api/og",
      "/api/stripe/checkout",
      "/api/stripe/portal",
      "/api/widgets",
      "/api/pusherx",
      "/api/webhooksx",
      "/api/v10",
      "/api/mcpx",
      "/api/email",
      "/api/stripe/webhooks",
    ]) {
      assert.deepEqual(
        resolve("cdn.guddesk.com", pathname),
        {
          destination: `https://www.guddesk.com${pathname}`,
          permanent: false,
        },
        pathname,
      );
    }
  });

  it("matches the host with a port or in upper case", () => {
    for (const host of ["cdn.guddesk.com:443", "CDN.GudDesk.com"]) {
      assert.equal(resolve(host, "/widget.js"), null, host);
      assert.equal(
        resolve(host, "/pricing")?.destination,
        "https://www.guddesk.com/pricing",
        host,
      );
    }
  });

  it("leaves other hosts alone", () => {
    for (const host of [
      "www.guddesk.com",
      "guddesk-git-branch-team.vercel.app",
      "cdnxguddesk.com",
      "cdn.guddesk.com.example.test",
      "static-cdn.guddesk.com",
    ]) {
      for (const pathname of [
        "/",
        "/pricing",
        "/widget.js",
        "/api/v1/conversations",
      ]) {
        assert.equal(resolve(host, pathname), null, `${host}${pathname}`);
      }
    }
  });

  it("does not change the api.guddesk.com rules", () => {
    assert.equal(resolve("api.guddesk.com", "/api/v1/conversations"), null);
    assert.equal(resolve("api.guddesk.com", "/widget.js"), null);
    assert.equal(
      resolve("api.guddesk.com", "/pricing")?.destination,
      "https://www.guddesk.com/pricing",
    );
  });
});
