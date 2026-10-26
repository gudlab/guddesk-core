/**
 * How the members page shows when a pending invitation expires.
 *
 * It used to print expiresAt.toLocaleDateString() with no locale
 * or time zone. On an en-US server such as Vercel's, a 7-day invite sent on
 * 25 Oct 2026 shows "Expires 11/1/2026", which a UK reader takes as
 * 11 January 2026, a date before the invite was even sent, while the email
 * says "expires in 7 days". The text also changed with the server locale.
 *
 * Now the label is relative ("Expires in 7 days"), matching the email, and
 * the exact time is spelled out with a month name in UTC
 * ("1 Nov 2026, 23:03 UTC"). Both are plain functions of the stored
 * expiresAt and the current time, with no locale or time zone lookups, so
 * the text is the same on every server.
 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** "Expires in 7 days", "Expires in 5 hours", "Expires in 1 minute" or "Expired". */
export function invitationExpiryLabel(expiresAt: Date | string, now: Date = new Date()): string {
  const date = toDate(expiresAt);
  if (!date) return "Expiry unknown";
  const msLeft = date.getTime() - now.getTime();
  if (msLeft <= 0) return "Expired";
  // Days are rounded, so a freshly sent invite (7 days less a few seconds
  // or hours) reads "7 days" like the email. Under a day, round up so the
  // label never says 0.
  if (msLeft >= DAY_MS) return `Expires in ${plural(Math.round(msLeft / DAY_MS), "day")}`;
  if (msLeft >= HOUR_MS) return `Expires in ${plural(Math.ceil(msLeft / HOUR_MS), "hour")}`;
  return `Expires in ${plural(Math.max(1, Math.ceil(msLeft / MINUTE_MS)), "minute")}`;
}

/** The exact expiry, e.g. "1 Nov 2026, 23:03 UTC". Empty for a bad value. */
export function invitationExpiryTitle(expiresAt: Date | string): string {
  const date = toDate(expiresAt);
  if (!date) return "";
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hh}:${mm} UTC`;
}
