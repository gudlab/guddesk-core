/**
 * The From header for every email the app sends through Resend.
 *
 * Self-hosting: set RESEND_FROM to "Name <address>" (or a bare address) on
 * a domain you have verified in Resend. Without it, the fallback is
 * noreply@ the host of NEXT_PUBLIC_APP_URL, so mail never claims to come
 * from a domain you don't own, and a warning is logged once. Resend's
 * shared test sender is never used: it only delivers to the Resend
 * account owner.
 */

export interface FromEnv {
  RESEND_FROM?: string;
  NEXT_PUBLIC_APP_URL?: string;
  [name: string]: string | undefined;
}

const ADDRESS = /^[^\s@<>"]+@[^\s@<>"]+$/;

export interface ParsedFrom {
  name: string | null;
  address: string;
}

/** "Name <a@b.com>" or "a@b.com". Null if there is no valid address. */
export function parseFrom(raw: string | undefined): ParsedFrom | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const match = /^(.*)<([^>]+)>\s*$/.exec(value);
  const address = (match ? match[2] : value).trim();
  if (!ADDRESS.test(address)) return null;
  const name = match ? cleanDisplayName(match[1]) : "";
  return { name: name || null, address };
}

/** Display names can come from workspace names; drop characters that would break the header. */
export function cleanDisplayName(name: string): string {
  return name.replace(/[<>"\\\r\n]/g, "").trim();
}

/** An IPv4 or IPv6 literal, which can't be a mail domain. */
function isIpHost(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[") || host.includes(":");
}

/**
 * noreply@ the app's own host, or noreply@localhost when it has none or it
 * is a raw IP (noreply@10.0.0.5 isn't a valid sender anywhere).
 */
export function fallbackFromAddress(appUrl: string | undefined): string {
  try {
    const host = new URL(appUrl ?? "").hostname;
    if (host && !isIpHost(host)) return `noreply@${host}`;
  } catch {
    // fall through
  }
  return "noreply@localhost";
}

function format(name: string, address: string): string {
  return /[,;:@()[\]]/.test(name)
    ? `"${name}" <${address}>`
    : `${name} <${address}>`;
}

/**
 * Once per process, not per module copy: in dev, Next.js evaluates this
 * module again for each route bundle and on every reload, so a module-level
 * flag would warn again each time. globalThis lives as long as the process.
 */
const WARNED = Symbol.for("guddesk.email.fromWarningShown");
const flags = globalThis as unknown as Record<symbol, boolean | undefined>;

/** For tests: lets the once-per-process warning fire again. */
export function resetFromWarning() {
  flags[WARNED] = false;
}

/**
 * The From header. `displayName` replaces the configured name (the inbox
 * notification uses the workspace name).
 */
export function emailFrom(
  displayName?: string,
  env: FromEnv = process.env,
  warn: (line: string) => void = console.warn,
): string {
  const raw = (env.RESEND_FROM ?? "").trim();
  let configured = parseFrom(raw);
  if (!configured) {
    const address = fallbackFromAddress(env.NEXT_PUBLIC_APP_URL);
    if (!flags[WARNED]) {
      flags[WARNED] = true;
      warn(
        raw
          ? `[email] RESEND_FROM is not a valid sender, so emails are sent from ${address}. Set RESEND_FROM to a sender on a domain verified in Resend.`
          : `[email] RESEND_FROM is not set, so emails are sent from ${address}. Set RESEND_FROM to a sender on a domain verified in Resend, or Resend will reject them.`,
      );
    }
    configured = { name: null, address };
  }
  const name =
    cleanDisplayName(displayName ?? configured.name ?? "GudDesk") || "GudDesk";
  return format(name, configured.address);
}
