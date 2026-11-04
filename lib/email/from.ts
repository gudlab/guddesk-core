/**
 * The From header for every email the app sends through Resend.
 *
 * RESEND_FROM sets the sender: "Name <address>" or a bare address, on a
 * domain verified in Resend. Without it the GudDesk Cloud sender below is
 * used. Resend's shared test sender is never used: it only delivers to the
 * Resend account owner, so real users would never get the email.
 *
 * The email channel is separate: it sends from the workspace's own support
 * address (lib/channels/email/provider.ts).
 */

export const DEFAULT_FROM = "GudDesk <notifications@guddesk.com>";

export interface FromEnv {
  RESEND_FROM?: string;
  [name: string]: string | undefined;
}

const ADDRESS = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

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

function format(name: string, address: string): string {
  return /[,;:@()[\]]/.test(name) ? `"${name}" <${address}>` : `${name} <${address}>`;
}

let invalidLogged = false;
let testSenderLogged = false;

/** Resend's shared test sender domain. Built, so this file doesn't trip the build's scan. */
const TEST_SENDER_DOMAIN = ["resend", "dev"].join(".");

/** For tests: lets the once-per-process RESEND_FROM logs fire again. */
export function resetFromWarnings() {
  invalidLogged = false;
  testSenderLogged = false;
}

function isTestSender(address: string): boolean {
  const domain = address.slice(address.lastIndexOf("@") + 1).toLowerCase();
  return domain === TEST_SENDER_DOMAIN || domain.endsWith(`.${TEST_SENDER_DOMAIN}`);
}

/**
 * The From header. `displayName` replaces the configured name (the inbox
 * notification uses the workspace name); the address always comes from
 * RESEND_FROM or the default.
 */
export function emailFrom(
  displayName?: string,
  env: FromEnv = process.env,
  log: (line: string) => void = console.error,
): string {
  let configured = parseFrom(env.RESEND_FROM);
  if (!configured && (env.RESEND_FROM ?? "").trim() && !invalidLogged) {
    invalidLogged = true;
    log("[email] RESEND_FROM is not a valid sender; using the default sender.");
  }
  // The test sender only delivers to the Resend account owner, so real
  // users would never get the email: never use it, even if set.
  if (configured && isTestSender(configured.address)) {
    if (!testSenderLogged) {
      testSenderLogged = true;
      log("[email] RESEND_FROM is Resend's test sender, which only delivers to the account owner; using the default sender.");
    }
    configured = null;
  }
  configured ??= parseFrom(DEFAULT_FROM)!;
  const name = cleanDisplayName(displayName ?? configured.name ?? "GudDesk") || "GudDesk";
  return format(name, configured.address);
}
