/**
 * Server-side dedupe for agent replies.
 *
 * The composer makes one key per reply (a UUID when it opens or resets,
 * reused on retry) and sends it with sendMessage. Before the message is
 * created, the server claims (conversationId, key) atomically in the
 * verification_tokens table, the same way the inbound replay store does
 * (no schema change):
 *
 *   token      = reply-idem:<conversationId>:<key>   (unique)
 *   identifier = reply-idem:sending                  while the first attempt runs
 *              = reply-idem:done:<messageId>         once the message exists
 *   expires    = claim time + 10 minutes
 *
 * Within those 10 minutes the same key returns the existing message (no
 * second message, no second email), or "sending" while the first attempt
 * hasn't created it yet. After that the key can be used again. Expired
 * rows are deleted by the hourly sla-check cron (sweepExpiredReplyKeys).
 *
 * The messageId lives in identifier because that is the only free column;
 * identifier isn't unique on its own, token is.
 */

export interface ReplyIdemDb {
  verificationToken: {
    updateMany(args: {
      where: { token: string; expires?: { lte: Date } };
      data: { identifier: string; expires?: Date };
    }): Promise<{ count: number }>;
    create(args: { data: { identifier: string; token: string; expires: Date } }): Promise<unknown>;
    findUnique(args: { where: { token: string }; select: { identifier: true } }): Promise<{ identifier: string } | null>;
    deleteMany(args: {
      where: { token: string } | { token: { startsWith: string }; expires: { lt: Date } };
    }): Promise<{ count: number }>;
  };
}

export const REPLY_IDEM_PREFIX = "reply-idem:";
export const REPLY_IDEM_TTL_MS = 10 * 60 * 1000;
const SENDING = `${REPLY_IDEM_PREFIX}sending`;
const DONE = `${REPLY_IDEM_PREFIX}done:`;

export function replyIdemToken(conversationId: string, key: string): string {
  return `${REPLY_IDEM_PREFIX}${conversationId}:${key}`;
}

/** A client key we accept (UUID-like), or null to skip dedupe. */
export function normalizeIdempotencyKey(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9-]{8,64}$/.test(value) ? value : null;
}

/** A fresh key for a newly opened or reset composer. */
export function newReplyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
}

export type ReplyClaim = { state: "claimed" } | { state: "done"; messageId: string } | { state: "sending" };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

export async function claimReplyKey(
  db: ReplyIdemDb,
  conversationId: string,
  key: string,
  now: Date = new Date(),
): Promise<ReplyClaim> {
  const token = replyIdemToken(conversationId, key);
  const expires = new Date(now.getTime() + REPLY_IDEM_TTL_MS);
  // An expired row from an earlier use of this key: take it over.
  const reclaimed = await db.verificationToken.updateMany({
    where: { token, expires: { lte: now } },
    data: { identifier: SENDING, expires },
  });
  if (reclaimed.count > 0) return { state: "claimed" };
  try {
    await db.verificationToken.create({ data: { identifier: SENDING, token, expires } });
    return { state: "claimed" };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const row = await db.verificationToken.findUnique({ where: { token }, select: { identifier: true } });
    if (row?.identifier.startsWith(DONE)) return { state: "done", messageId: row.identifier.slice(DONE.length) };
    return { state: "sending" };
  }
}

export type ReplyOnce<T> =
  | { kind: "created"; message: T }
  | { kind: "duplicate"; messageId: string }
  | { kind: "sending" };

/**
 * Create the reply at most once per (conversationId, key) within 10
 * minutes. Without a key it just creates. If creating throws, the claim is
 * released so a retry can try again.
 */
export async function createReplyOnce<T extends { id: string }>(
  db: ReplyIdemDb,
  input: { conversationId: string; key: string | null; now?: Date },
  create: () => Promise<T>,
  log: (line: string) => void = console.warn,
): Promise<ReplyOnce<T>> {
  const { conversationId, key } = input;
  if (!key) return { kind: "created", message: await create() };

  const claim = await claimReplyKey(db, conversationId, key, input.now ?? new Date());
  if (claim.state === "done") return { kind: "duplicate", messageId: claim.messageId };
  if (claim.state === "sending") return { kind: "sending" };

  const token = replyIdemToken(conversationId, key);
  let message: T;
  try {
    message = await create();
  } catch (error) {
    await db.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    throw error;
  }
  try {
    await db.verificationToken.updateMany({ where: { token }, data: { identifier: `${DONE}${message.id}` } });
  } catch (error) {
    // The message exists; a retry sees "sending" until the claim expires
    // instead of a second message.
    log(`[reply-idem] mark failed: ${error instanceof Error ? error.name : "error"}`);
  }
  return { kind: "created", message };
}

/** Delete expired reply-idem:* rows. Returns how many. */
export async function sweepExpiredReplyKeys(db: ReplyIdemDb, now: Date = new Date()): Promise<number> {
  const { count } = await db.verificationToken.deleteMany({
    where: { token: { startsWith: REPLY_IDEM_PREFIX }, expires: { lt: now } },
  });
  return count;
}
