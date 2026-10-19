/**
 * Response headers for next.config.js headers() and the /help redirect.
 *
 * Kept in a plain CommonJS file so lib/security-headers.test.ts can load it
 * without next.config.js, which also loads env.mjs and contentlayer.
 *
 * Route groups:
 * - every route: HSTS, nosniff, Referrer-Policy, Permissions-Policy
 * - every route except the embeddable ones: X-Frame-Options DENY and
 *   CSP frame-ancestors 'none', so the dashboard and marketing pages cannot
 *   be framed (clickjacking)
 * - embeddable routes, which never get the frame headers: /widget.js (loaded
 *   by customer sites), /api/widget/* and /api/pusher/* (called cross-origin
 *   by the widget), and the public help centers under /help/*, which
 *   customers may frame inside their own site
 * - CORS on /api/widget/*, /api/pusher/* and /api/mcp, unchanged
 *
 * HSTS leaves out "preload". The apex guddesk.com is a Vercel domain redirect
 * that does not send these headers, so the domain would not qualify for the
 * preload list anyway, and preload is slow to undo.
 */

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const FRAME_DENY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

/** Paths (without the leading "/") that must stay embeddable. */
const EMBEDDABLE_PATTERN =
  "widget\\.js$|api/widget(?:/|$)|api/pusher(?:/|$)|help(?:/|$)";

const CORS_HEADERS = [
  {
    source: "/api/widget/:path*",
    headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, x-visitor-token",
      },
      { key: "Access-Control-Max-Age", value: "86400" },
    ],
  },
  {
    source: "/api/pusher/:path*",
    headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, x-visitor-token",
      },
      { key: "Access-Control-Max-Age", value: "86400" },
    ],
  },
  {
    source: "/api/mcp",
    headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, DELETE, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value:
          "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
      },
      { key: "Access-Control-Expose-Headers", value: "Mcp-Session-Id" },
      { key: "Access-Control-Max-Age", value: "86400" },
    ],
  },
];

/**
 * "/" has its own entry, and the other two patterns need at least one
 * character after the slash, so no header is ever sent twice on a path.
 */
function securityHeaders() {
  return [
    { source: "/", headers: [...SECURITY_HEADERS, ...FRAME_DENY_HEADERS] },
    { source: "/:path+", headers: SECURITY_HEADERS },
    {
      source: `/:path((?!${EMBEDDABLE_PATTERN}).+)`,
      headers: FRAME_DENY_HEADERS,
    },
    ...CORS_HEADERS,
  ];
}

/**
 * Help centers live at /help/[workspaceSlug]. There is no /help index, but
 * the footer and old links point at /help, so send it to the docs.
 * Not permanent, so a real /help page can replace it later.
 */
function helpRedirects() {
  return [{ source: "/help", destination: "/docs", permanent: false }];
}

module.exports = {
  SECURITY_HEADERS,
  FRAME_DENY_HEADERS,
  securityHeaders,
  helpRedirects,
};
