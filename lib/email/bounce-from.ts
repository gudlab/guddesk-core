/**
 * Sender for the unverified-reply bounce (lib/email-notifications.ts), from config: RESEND_FROM ("Name <address>"
 * or a bare address), else noreply@ the host of NEXT_PUBLIC_APP_URL. Never
 * a hardcoded GudDesk Cloud domain, so a self-hosted build sends from its
 * own domain. The same rule as emailFrom() in #49; once #49 is merged this
 * is replaced by emailFrom().
 */
export function bounceFrom(env: Record<string, string | undefined> = process.env): string {
  const raw = (env.RESEND_FROM ?? "").trim();
  const match = /^(.*)<([^>]+)>\s*$/.exec(raw);
  const address = (match ? match[2] : raw).trim();
  if (/^[^\s@<>"]+@[^\s@<>"]+$/.test(address)) {
    const name = (match ? match[1] : "").replace(/[<>"\\\r\n]/g, "").trim() || "GudDesk";
    return `${name} <${address}>`;
  }
  let host = "";
  try {
    host = new URL(env.NEXT_PUBLIC_APP_URL ?? "").hostname;
  } catch {
    // fall through
  }
  return `GudDesk <noreply@${host || "localhost"}>`;
}
