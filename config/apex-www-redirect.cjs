/**
 * Hosted canonicalization for guddesk.com → www.guddesk.com.
 *
 * Verified 2026-10-14 against production:
 * - next.config.js already sends CORS on /api/widget and /api/pusher
 * - middleware.ts excludes /api
 * - vercel.json has no redirects
 * - OPTIONS https://guddesk.com/api/widget/config → 307 Location
 *   https://www.guddesk.com/... with no Access-Control-* (Vercel domain
 *   redirect). Browsers fail the preflight.
 * - OPTIONS https://www.guddesk.com/api/widget/config → 204 with CORS
 *
 * These rules skip /api/* so widget preflights are not redirected. They
 * only apply when the Vercel project "Redirect to www" domain setting is
 * off; that platform 307 currently wins for every path including /api.
 */

function skipApexWwwRedirect(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

function apexWwwRedirects() {
  return [
    {
      source: "/",
      has: [{ type: "host", value: "guddesk.com" }],
      destination: "https://www.guddesk.com/",
      permanent: true,
    },
    {
      source: "/:path((?!api(?:/|$)).*)",
      has: [{ type: "host", value: "guddesk.com" }],
      destination: "https://www.guddesk.com/:path*",
      permanent: true,
    },
  ];
}

module.exports = { skipApexWwwRedirect, apexWwwRedirects };
