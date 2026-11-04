/**
 * The app's public base URL, used for every absolute link we build:
 * invite and password-reset emails, inbox notification emails, Stripe
 * return URLs, the widget install snippet, metadata, robots and sitemap.
 *
 * Vercel Preview shares NEXT_PUBLIC_APP_URL with production unless it is
 * overridden, which made Preview invite links point at guddesk.com. Preview
 * sets NEXT_PUBLIC_APP_URL to a reserved `.invalid` placeholder instead
 * (RFC 2606), and this helper swaps the placeholder for the deployment's
 * branch URL. Anywhere else the configured value is returned exactly.
 */

export interface AppUrlEnv {
  /** VERCEL_ENV on the server, NEXT_PUBLIC_VERCEL_ENV in the browser. */
  vercelEnv?: string;
  /** NEXT_PUBLIC_APP_URL. */
  appUrl?: string;
  /** NEXT_PUBLIC_VERCEL_BRANCH_URL: a host name with no scheme. */
  branchUrl?: string;
}

const DEFAULT_APP_URL = "http://localhost:3000";

/** True when the URL's host is the reserved `.invalid` TLD. */
export function isPlaceholderAppUrl(url: string | undefined): boolean {
  if (!url) return false;
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    host = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split(/[/:?#]/)[0];
  }
  host = host.toLowerCase().replace(/\.$/, "");
  return host === "invalid" || host.endsWith(".invalid");
}

export function resolveAppUrl({ vercelEnv, appUrl, branchUrl }: AppUrlEnv): string {
  const configured = appUrl ?? DEFAULT_APP_URL;
  if (vercelEnv !== "preview" || !isPlaceholderAppUrl(configured)) {
    return configured;
  }
  const branch = branchUrl?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (!branch) return configured;
  return `https://${branch}`;
}

export function getAppUrl(): string {
  // Each variable is read by its full name so Next.js can inline the
  // NEXT_PUBLIC_ ones in client bundles.
  return resolveAppUrl({
    vercelEnv: process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    branchUrl: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
  });
}
