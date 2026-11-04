import { isPlaceholderAppUrl } from "@/lib/app-url";
import { isEmailSendingAllowed, type EmailEnv } from "@/lib/outbound-email";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

/**
 * The host to send people to for a real reset: the configured
 * NEXT_PUBLIC_APP_URL, so self-hosters and forks name their own site. Null
 * when that is unset, a local address (next dev) or the Preview
 * placeholder, where it would point back at this environment.
 */
export function resetSiteHost(appUrl: string | undefined): string | null {
  if (!appUrl || isPlaceholderAppUrl(appUrl)) return null;
  let host: string;
  try {
    host = new URL(appUrl).host;
  } catch {
    return null;
  }
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  if (!hostname || LOCAL_HOSTS.has(hostname) || hostname.endsWith(".localhost")) return null;
  return host;
}

export function passwordResetBlockedMessage(appUrl: string | undefined): string {
  const host = resetSiteHost(appUrl);
  return `Password reset emails are not sent on this environment (a Preview or Development deployment), so no email was sent. Reset your password on ${host ?? "your production site"} instead.`;
}

/**
 * Where email is blocked, forgot-password stops before looking up the user
 * or creating a token and returns this notice. It depends only on the
 * environment, never on whether the account exists, so it can't be used to
 * find out which emails have accounts.
 */
export function passwordResetBlocked(
  env: EmailEnv = process.env,
  appUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): { blocked: string } | null {
  return isEmailSendingAllowed(env) ? null : { blocked: passwordResetBlockedMessage(appUrl) };
}
