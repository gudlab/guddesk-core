import assert from "node:assert/strict";
import { describe, it } from "node:test";
import loadCustomRoutes from "next/dist/lib/load-custom-routes";
import { formatUrl } from "next/dist/shared/lib/router/utils/format-url";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import {
  matchHas,
  prepareDestination,
} from "next/dist/shared/lib/router/utils/prepare-destination";

import { apiHostRedirects } from "../config/api-host.cjs";
import { helpRedirects } from "../config/security-headers.cjs";

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{ type: string; value?: string }>;
};

/** The redirect list in the same order next.config.js returns it. */
function redirects(): Redirect[] {
  return [...apiHostRedirects(), ...helpRedirects()] as Redirect[];
}

/**
 * Resolve the first redirect Next would apply for `host` + `pathname`, using
 * Next's own path matcher, `has` matcher and destination builder.
 */
function resolve(host: string, pathname: string) {
  for (const route of redirects()) {
    const params = getPathMatch(route.source, {
      strict: true,
      removeUnnamedParams: true,
    })(pathname);
    if (!params) continue;
    const req = { headers: { host } } as never;
    const hasParams = matchHas(req, {}, route.has as never, []);
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

const KEPT_ON_API_HOST = [
  "/api",
  "/api/v1/conversations",
  "/api/v1/conversations/conv_1/messages",
  "/api/widget/config",
  "/api/widget/visitors",
  "/api/pusher/auth",
  "/api/mcp",
  "/api/stripe/webhook",
  "/api/email/inbound",
  "/api/agent/webhooks",
  "/api/cron/sla-check",
  "/api/auth/session",
  "/widget.js",
];

describe("api.guddesk.com serves only the API", () => {
  it("passes Next's own route validation", async () => {
    const routes = await loadCustomRoutes({
      redirects: async () => redirects(),
    } as never);
    assert.ok(routes.redirects.length >= redirects().length);
  });

  it("keeps /api/* and /widget.js on the API host", () => {
    for (const pathname of KEPT_ON_API_HOST) {
      assert.equal(resolve("api.guddesk.com", pathname), null, pathname);
    }
  });

  it("redirects every other path to the same path on www, not permanently", () => {
    for (const [pathname, destination] of [
      ["/", "https://www.guddesk.com/"],
      ["/pricing", "https://www.guddesk.com/pricing"],
      ["/docs/api/mcp", "https://www.guddesk.com/docs/api/mcp"],
      ["/dashboard", "https://www.guddesk.com/dashboard"],
      ["/help", "https://www.guddesk.com/help"],
      [
        "/help/acme/getting-started",
        "https://www.guddesk.com/help/acme/getting-started",
      ],
      ["/robots.txt", "https://www.guddesk.com/robots.txt"],
      ["/sitemap.xml", "https://www.guddesk.com/sitemap.xml"],
      [
        "/_next/static/chunks/app.js",
        "https://www.guddesk.com/_next/static/chunks/app.js",
      ],
      ["/apis", "https://www.guddesk.com/apis"],
      ["/widget.js.map", "https://www.guddesk.com/widget.js.map"],
    ]) {
      assert.deepEqual(
        resolve("api.guddesk.com", pathname),
        { destination, permanent: false },
        pathname,
      );
    }
  });

  it("matches the host with a port or in upper case", () => {
    for (const host of ["api.guddesk.com:443", "API.GudDesk.com"]) {
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
      "cdn.guddesk.com",
      "guddesk-git-branch-team.vercel.app",
      "apixguddesk.com",
      "api.guddesk.com.example.test",
      "evil-api.guddesk.com",
    ]) {
      for (const pathname of ["/", "/pricing", "/api/widget/config"]) {
        assert.equal(resolve(host, pathname), null, `${host}${pathname}`);
      }
    }
  });

  it("still sends /help to the docs on www", () => {
    assert.deepEqual(resolve("www.guddesk.com", "/help"), {
      destination: "/docs",
      permanent: false,
    });
  });
});
