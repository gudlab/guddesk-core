/**
 * api.guddesk.com is a second domain on the same Vercel project as
 * www.guddesk.com, so it used to serve the whole marketing site (BUG-005).
 *
 * On that host only these stay put:
 * - /api and /api/* (REST API, widget and pusher APIs with their CORS
 *   headers, MCP, Stripe and email webhooks, crons)
 * - /widget.js, because the widget takes its API origin from the script URL,
 *   so an install that loads it from api.guddesk.com keeps working
 *
 * Every other path redirects to the same path on https://www.guddesk.com.
 * The redirect is temporary (307) so it is easy to change later, and the
 * host value is an anchored regex with escaped dots.
 */

const API_HOST = "api.guddesk.com";
const WWW_ORIGIN = "https://www.guddesk.com";

const apiHost = [{ type: "host", value: API_HOST.replace(/\./g, "\\.") }];

function apiHostRedirects() {
  return [
    {
      source: "/",
      has: apiHost,
      destination: `${WWW_ORIGIN}/`,
      permanent: false,
    },
    {
      source: "/:path((?!api(?:/|$)|widget\\.js$).+)",
      has: apiHost,
      destination: `${WWW_ORIGIN}/:path`,
      permanent: false,
    },
  ];
}

/**
 * cdn.guddesk.com is also a domain on the same project, and also served the
 * whole site. It is the host in every install snippet
 * (<script src="https://cdn.guddesk.com/widget.js">), so on that host only
 * these stay put:
 * - /widget.js, the script itself
 * - /api/widget and /api/widget/*, and /api/pusher and /api/pusher/*.
 *   The current widget sends its API calls to www when it is loaded from
 *   cdn, but builds from before 2026-10-14 (commit 1fbd359) used the script's
 *   own host. A redirect would break their CORS preflights, so these stay.
 * - routes that external services or API clients call, because most webhook
 *   senders and server-side clients do not follow redirects:
 *   /api/webhooks(/*), /api/stripe/webhook (Stripe), /api/email/inbound
 *   (Resend inbound email), /api/agent/* (external agents post replies and
 *   typing, and manage webhook endpoints), /api/cron/* (Vercel cron),
 *   /api/mcp (MCP clients) and /api/v1(/*) (REST API)
 *
 * Browser-only routes such as /api/auth/*, /api/inbox/*, /api/user and
 * /api/stripe/checkout|portal are used from www pages, so they redirect.
 *
 * The widget loads no fonts, images or other files: its icons are inline
 * SVG, its CSS is inline, and pusher-js is not loaded from our hosts. The
 * site sets no assetPrefix, so /_next/static is only ever requested from
 * www. Every other path redirects to the same path on www.
 */
const CDN_HOST = "cdn.guddesk.com";

/** Paths (without the leading "/") that stay on cdn.guddesk.com. */
const CDN_KEPT_PATTERN = [
  "widget\\.js$",
  "api/(?:widget|pusher|webhooks|v1|agent|cron)(?:/|$)",
  "api/stripe/webhook(?:/|$)",
  "api/email/inbound(?:/|$)",
  "api/mcp(?:/|$)",
].join("|");

const cdnHost = [{ type: "host", value: CDN_HOST.replace(/\./g, "\\.") }];

function cdnHostRedirects() {
  return [
    {
      source: "/",
      has: cdnHost,
      destination: `${WWW_ORIGIN}/`,
      permanent: false,
    },
    {
      source: `/:path((?!${CDN_KEPT_PATTERN}).+)`,
      has: cdnHost,
      destination: `${WWW_ORIGIN}/:path`,
      permanent: false,
    },
  ];
}

module.exports = {
  API_HOST,
  CDN_HOST,
  WWW_ORIGIN,
  apiHostRedirects,
  cdnHostRedirects,
};
