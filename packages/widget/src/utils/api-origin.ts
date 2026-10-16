/** Hosted widget API. www answers CORS preflight; the apex 307 does not. */
export const HOSTED_WIDGET_API_ORIGIN = "https://www.guddesk.com";

const HOSTED_SCRIPT_HOSTS = new Set([
  "cdn.guddesk.com",
  "www.guddesk.com",
  "guddesk.com",
]);

/**
 * Default API origin for the embed.
 *
 * Hosted script hosts (cdn / www / apex) always talk to www so OPTIONS
 * never hits the Vercel apex→www 307. Self-hosted scripts use their own
 * origin. `explicitBaseUrl` wins when the snippet sets `baseUrl`.
 */
export function resolveDefaultApiOrigin(
  scriptSrc: string | null | undefined,
  fallbackOrigin: string,
  explicitBaseUrl?: string | null,
): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  if (scriptSrc) {
    try {
      const url = new URL(scriptSrc);
      if (HOSTED_SCRIPT_HOSTS.has(url.hostname)) {
        return HOSTED_WIDGET_API_ORIGIN;
      }
      if (url.hostname.includes("guddesk") || scriptSrc.includes("widget")) {
        return url.origin;
      }
    } catch {
      // fall through
    }
  }

  return fallbackOrigin;
}

/** Last matching widget/guddesk script src, if any. */
export function findWidgetScriptSrc(
  scripts: Array<{ src: string }>,
): string | undefined {
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i]?.src;
    if (src && (src.includes("guddesk") || src.includes("widget"))) {
      return src;
    }
  }
  return undefined;
}
