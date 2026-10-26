/**
 * Rate limit for the "your email reply wasn't posted" notice and bounce:
 * at most one per member per conversation per hour, so a flood of spoofed
 * replies can't be used to spam a member or the conversation.
 *
 * Uses the verification_tokens table like the replay store (no migration):
 * token inbound:bounce:{userId}:{conversationId}, expiring after an hour.
 * Expired rows are swept with the replay rows (sweepExpiredWebhookIds).
 */
import type { ReplayDb } from "./replay";

export const BOUNCE_PREFIX = "inbound:bounce:";
export const BOUNCE_WINDOW_MS = 60 * 60 * 1000;

export function bounceKey(userId: string, conversationId: string): string {
  return `${BOUNCE_PREFIX}${userId}:${conversationId}`;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

/** True if this call may notify (and takes the hour's slot); false if one went out within the hour. */
export async function claimBounceSlot(
  db: ReplayDb,
  userId: string,
  conversationId: string,
  now: Date = new Date(),
): Promise<boolean> {
  const token = bounceKey(userId, conversationId);
  const expires = new Date(now.getTime() + BOUNCE_WINDOW_MS);
  const reclaimed = await db.verificationToken.updateMany({
    where: { token, expires: { lte: now } },
    data: { identifier: BOUNCE_PREFIX, expires },
  });
  if (reclaimed.count > 0) return true;
  try {
    await db.verificationToken.create({ data: { identifier: BOUNCE_PREFIX, token, expires } });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

/** Give the slot back, when the notice couldn't be saved and the delivery will be retried. */
export async function releaseBounceSlot(db: ReplayDb, userId: string, conversationId: string): Promise<void> {
  await db.verificationToken.deleteMany({ where: { token: bounceKey(userId, conversationId) } });
}

/** Agent-only note on the conversation. No address and no body. */
export function unverifiedReplyNotice(memberName: string): string {
  return `An email reply from ${memberName} couldn't be verified (DMARC/DKIM), so it wasn't posted. They have been emailed to reply from the app instead.`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** The bounce to the member. Never includes the original email's body. */
export function unverifiedReplyEmail(input: { memberName: string; inboxUrl: string }): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Your email reply wasn't posted";
  const lines = [
    `Hi ${input.memberName},`,
    "",
    "We got an email reply from your address to a GudDesk conversation, but it couldn't be verified (DMARC/DKIM), so it wasn't posted.",
    "Please reply from the app instead:",
    input.inboxUrl,
    "",
    "If you didn't send it, someone may be spoofing your address. You don't need to do anything else.",
  ];
  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; font-size: 14px; color: #1f2937; line-height: 1.5;">
  <p>Hi ${escapeHtml(input.memberName)},</p>
  <p>We got an email reply from your address to a GudDesk conversation, but it couldn't be verified (DMARC/DKIM), so it wasn't posted.</p>
  <p><a href="${escapeHtml(input.inboxUrl)}">Reply from the app instead</a>.</p>
  <p style="color: #6b7280; font-size: 12px;">If you didn't send it, someone may be spoofing your address. You don't need to do anything else.</p>
</div>`;
  return { subject, text: lines.join("\n"), html };
}
