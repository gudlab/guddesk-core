import assert from "node:assert/strict";
import { describe, it } from "node:test";
import loadCustomRoutes from "next/dist/lib/load-custom-routes";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";

import {
  FRAME_DENY_HEADERS,
  helpRedirects,
  SECURITY_HEADERS,
  securityHeaders,
} from "../config/security-headers.cjs";

type Header = { key: string; value: string };
type HeaderRoute = { source: string; headers: Header[] };

/**
 * Headers Next would send for `pathname`: every matching entry, in order.
 * Each header is listed once per entry that sets it, so a header set twice
 * shows up twice and the tests catch it.
 */
function headersFor(pathname: string): Header[] {
  return (securityHeaders() as HeaderRoute[])
    .filter((route) =>
      getPathMatch(route.source, { strict: true, removeUnnamedParams: true })(
        pathname,
      ),
    )
    .flatMap((route) => route.headers);
}

function valuesOf(headers: Header[], key: string): string[] {
  return headers
    .filter((header) => header.key.toLowerCase() === key.toLowerCase())
    .map((header) => header.value);
}

const FRAMEABLE_DENIED = [
  "/",
  "/pricing",
  "/blog/some-post",
  "/docs",
  "/docs/api/mcp",
  "/login",
  "/dashboard",
  "/dashboard/settings",
  "/workspace/acme/inbox",
  "/admin/users",
  "/api/v1/conversations",
  "/api/mcp",
  "/api/auth/session",
  "/widget.js.map",
  "/api/widgets",
  "/helpdesk",
];

const EMBEDDABLE = [
  "/widget.js",
  "/api/widget/config",
  "/api/widget/visitors",
  "/api/widget/conversations/c_1/messages",
  "/api/pusher/auth",
  "/help/acme",
  "/help/acme/getting-started",
  "/help/acme/getting-started/install-the-widget",
  "/help/acme/search",
];

describe("security headers", () => {
  it("passes Next's own route validation", async () => {
    const routes = await loadCustomRoutes({
      headers: async () => securityHeaders(),
      redirects: async () => helpRedirects(),
    } as never);
    assert.equal(routes.headers.length, securityHeaders().length);
  });

  it("sends the base headers once on every route", () => {
    for (const pathname of [...FRAMEABLE_DENIED, ...EMBEDDABLE]) {
      const headers = headersFor(pathname);
      for (const { key, value } of SECURITY_HEADERS) {
        assert.deepEqual(valuesOf(headers, key), [value], `${key} ${pathname}`);
      }
    }
  });

  it("uses the agreed values", () => {
    const byKey = Object.fromEntries(
      SECURITY_HEADERS.map((header: Header) => [header.key, header.value]),
    );
    assert.deepEqual(byKey, {
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
  });

  it("denies framing once on dashboard, marketing, docs and API routes", () => {
    for (const pathname of FRAMEABLE_DENIED) {
      const headers = headersFor(pathname);
      for (const { key, value } of FRAME_DENY_HEADERS) {
        assert.deepEqual(valuesOf(headers, key), [value], `${key} ${pathname}`);
      }
    }
  });

  it("never denies framing on the widget, its APIs or the help centers", () => {
    for (const pathname of EMBEDDABLE) {
      const headers = headersFor(pathname);
      assert.deepEqual(
        valuesOf(headers, "X-Frame-Options"),
        [],
        `X-Frame-Options ${pathname}`,
      );
      assert.deepEqual(
        valuesOf(headers, "Content-Security-Policy"),
        [],
        `Content-Security-Policy ${pathname}`,
      );
    }
  });

  it("keeps the widget, pusher and MCP CORS headers unchanged", () => {
    const cors = (pathname: string) =>
      Object.fromEntries(
        headersFor(pathname)
          .filter((header) => header.key.startsWith("Access-Control-"))
          .map((header) => [header.key, header.value]),
      );
    assert.deepEqual(cors("/api/widget/config"), {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-visitor-token",
      "Access-Control-Max-Age": "86400",
    });
    assert.deepEqual(cors("/api/pusher/auth"), {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-visitor-token",
      "Access-Control-Max-Age": "86400",
    });
    assert.deepEqual(cors("/api/mcp"), {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
      "Access-Control-Max-Age": "86400",
    });
    assert.deepEqual(cors("/dashboard"), {});
  });
});

describe("/help redirect", () => {
  it("sends /help to the docs, not permanently, and leaves help centers alone", () => {
    const [redirect, ...rest] = helpRedirects();
    assert.equal(rest.length, 0);
    assert.deepEqual(redirect, {
      source: "/help",
      destination: "/docs",
      permanent: false,
    });
    const match = getPathMatch(redirect.source, { strict: true });
    assert.ok(match("/help"));
    assert.equal(match("/help/acme"), false);
    assert.equal(match("/helpdesk"), false);
  });
});
