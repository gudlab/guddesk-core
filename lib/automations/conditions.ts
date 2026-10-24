/**
 * Rule conditions, checked against the event snapshot (the conversation as
 * it was when the event started). A condition that is set but has nothing
 * to compare with (for example "message contains" on a close event) does
 * not match.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */

export interface ConditionContext {
  tags: string[];
  status: string;
  visitorEmail?: string | null;
  messageBody?: string | null;
}

function text(value: unknown): string | null {
  if (typeof value === "string") return value.trim() === "" ? null : value;
  if (typeof value === "number") return String(value);
  return null;
}

function includesIgnoringCase(haystack: string | null | undefined, needle: string): boolean {
  return typeof haystack === "string" && haystack.toLowerCase().includes(needle.toLowerCase());
}

export function matchesConditions(conditions: unknown, ctx: ConditionContext): boolean {
  if (!conditions || typeof conditions !== "object" || Array.isArray(conditions)) return true;
  const c = conditions as Record<string, unknown>;

  const tagsContain = text(c.tags_contain);
  if (tagsContain && !ctx.tags.includes(tagsContain)) return false;

  const tagsNotContain = text(c.tags_not_contain);
  if (tagsNotContain && ctx.tags.includes(tagsNotContain)) return false;

  const status = text(c.status);
  if (status && ctx.status !== status) return false;

  const email = text(c.visitor_email_contains);
  if (email && !includesIgnoringCase(ctx.visitorEmail, email)) return false;

  const message = text(c.message_contains);
  if (message && !includesIgnoringCase(ctx.messageBody, message)) return false;

  // unassigned_minutes is used by the "unassigned for" scheduler, not here.
  return true;
}

/** Minutes for an "unassigned for" rule, or null when missing or invalid. */
export function unassignedMinutes(conditions: unknown): number | null {
  if (!conditions || typeof conditions !== "object" || Array.isArray(conditions)) return null;
  const raw = (conditions as Record<string, unknown>).unassigned_minutes;
  const minutes = typeof raw === "string" ? Number(raw) : raw;
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes < 1) return null;
  return Math.floor(minutes);
}
