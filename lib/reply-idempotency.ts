/**
 * Server-side dedupe for agent replies, step by step.
 *
 * The composer makes one key per reply and keeps it in sessionStorage until
 * the reply is finished, so a retry (a second click, a reload, a dropped
 * connection) sends the same key. The server keeps one row per
 * (conversationId, userId, key) in verification_tokens (no schema change):
 *
 *   token      = reply-idem:<conversationId>:<userId>:<key>   (unique)
 *   identifier = one of
 *     reply-idem:sending:<leaseUntilMs>
 *         an attempt holds the lease and the message doesn't exist yet
 *     reply-idem:saved:<messageId>:<steps>:<leaseUntilMs>
 *         the message exists; <steps> lists the follow-up steps already
 *         done (n = conversation updated and realtime sent, w = webhooks).
 *         leaseUntilMs is 0 when no attempt is running.
 *     reply-idem:delivered:<messageId>:<email>
 *         every step is done; <email> is the email outcome (sent, skipped,
 *         sender_rejected, recipient_rejected), so a repeat answers the same
 *   expires    = last change + 24 hours (the hourly sla-check cron deletes
 *                expired rows; after that the key starts a new reply)
 *
 * An attempt holds a 45 second lease. While it is held, a second attempt
 * with the same key gets "busy" and changes nothing. Once it runs out (the
 * first attempt crashed or hung), the next attempt takes it over with a
 * compare-and-set on the identifier, so only one of several takes it.
 *
 * A retry re-runs only the steps that are missing, on the existing message.
 * A message is never created twice, and a reply whose email didn't go out
 * is never reported as done: a temporary email failure leaves the row in
 * "saved" so the next retry sends the email again (Resend also gets an
 * idempotency key per message, so a send that timed out but went through
 * is not sent twice). A permanent failure (Resend refused the sender or the
 * recipient) is final and is returned to the client every time.
 */

export interface ReplyIdemDb {
  verificationToken: {
    updateMany(args: {
      where: { token: string; identifier?: string; expires?: { lte: Date } };
      data: { identifier: string; expires?: Date };
    }): Promise<{ count: number }>;
    create(args: { data: { identifier: string; token: string; expires: Date } }): Promise<unknown>;
    findUnique(args: {
      where: { token: string };
      select: { identifier: true; expires: true };
    }): Promise<{ identifier: string; expires: Date } | null>;
    deleteMany(args: {
      where: { token: string; identifier?: string } | { token: { startsWith: string }; expires: { lt: Date } };
    }): Promise<{ count: number }>;
  };
}

export const REPLY_IDEM_PREFIX = "reply-idem:";
/** How long a row (and so the key) is kept after its last change. */
export const REPLY_IDEM_TTL_MS = 24 * 60 * 60 * 1000;
/** How long one attempt may run before another attempt may take over. */
export const REPLY_LEASE_MS = 45 * 1000;

const SENDING = `${REPLY_IDEM_PREFIX}sending:`;
const SAVED = `${REPLY_IDEM_PREFIX}saved:`;
const DELIVERED = `${REPLY_IDEM_PREFIX}delivered:`;

export function replyIdemToken(conversationId: string, userId: string, key: string): string {
  return `${REPLY_IDEM_PREFIX}${conversationId}:${userId}:${key}`;
}

/** A client key we accept (UUID-like), or null to skip dedupe. */
export function normalizeIdempotencyKey(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9-]{8,64}$/.test(value) ? value : null;
}

/** A fresh key for a new reply. */
export function newReplyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
}

// ── States ─────────────────────────────────────────────────────────

/** Follow-up steps after the message is created, in order. */
export type ReplyStep = "n" | "w";

export type EmailCode = "sent" | "skipped" | "sender_rejected" | "recipient_rejected";

export type ReplyState =
  | { state: "sending"; leaseUntil: number }
  | { state: "saved"; messageId: string; steps: string; leaseUntil: number }
  | { state: "delivered"; messageId: string; email: EmailCode };

const EMAIL_CODES: readonly EmailCode[] = ["sent", "skipped", "sender_rejected", "recipient_rejected"];

export function formatReplyState(s: ReplyState): string {
  switch (s.state) {
    case "sending":
      return `${SENDING}${s.leaseUntil}`;
    case "saved":
      return `${SAVED}${s.messageId}:${s.steps}:${s.leaseUntil}`;
    case "delivered":
      return `${DELIVERED}${s.messageId}:${s.email}`;
  }
}

/** Parse an identifier. Anything unknown counts as a "sending" row whose lease has run out. */
export function parseReplyState(identifier: string): ReplyState {
  if (identifier.startsWith(SENDING)) {
    const leaseUntil = Number(identifier.slice(SENDING.length));
    return { state: "sending", leaseUntil: Number.isFinite(leaseUntil) ? leaseUntil : 0 };
  }
  if (identifier.startsWith(SAVED)) {
    const [messageId, steps = "", lease = "0"] = identifier.slice(SAVED.length).split(":");
    const leaseUntil = Number(lease);
    if (messageId) return { state: "saved", messageId, steps, leaseUntil: Number.isFinite(leaseUntil) ? leaseUntil : 0 };
  }
  if (identifier.startsWith(DELIVERED)) {
    const [messageId, email] = identifier.slice(DELIVERED.length).split(":");
    if (messageId) {
      return {
        state: "delivered",
        messageId,
        email: (EMAIL_CODES as readonly string[]).includes(email) ? (email as EmailCode) : "sent",
      };
    }
  }
  return { state: "sending", leaseUntil: 0 };
}

// ── Claiming ───────────────────────────────────────────────────────

export type ReplyClaim =
  /** This attempt holds the lease and must create the message. */
  | { kind: "new"; identifier: string }
  /** This attempt holds the lease on an existing message and must run the missing steps. */
  | { kind: "resume"; identifier: string; messageId: string; steps: string }
  /** Another attempt holds the lease. */
  | { kind: "busy" }
  /** Already finished. */
  | { kind: "delivered"; messageId: string; email: EmailCode };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

/**
 * Claim the key for one attempt. Every write is a compare-and-set on the
 * row's current identifier, so of several concurrent attempts exactly one
 * gets the lease.
 */
export async function claimReplyKey(db: ReplyIdemDb, token: string, now: Date): Promise<ReplyClaim> {
  const expires = new Date(now.getTime() + REPLY_IDEM_TTL_MS);
  const leaseUntil = now.getTime() + REPLY_LEASE_MS;
  const fresh = formatReplyState({ state: "sending", leaseUntil });

  // A few rounds: a row can vanish (sweep, released claim) between reads.
  for (let round = 0; round < 3; round++) {
    const row = await db.verificationToken.findUnique({
      where: { token },
      select: { identifier: true, expires: true },
    });

    if (!row || row.expires <= now) {
      if (row) {
        // An expired row is a finished, abandoned or forgotten reply: start over.
        const took = await db.verificationToken.updateMany({
          where: { token, identifier: row.identifier, expires: { lte: now } },
          data: { identifier: fresh, expires },
        });
        if (took.count > 0) return { kind: "new", identifier: fresh };
        continue;
      }
      try {
        await db.verificationToken.create({ data: { identifier: fresh, token, expires } });
        return { kind: "new", identifier: fresh };
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        continue;
      }
    }

    const state = parseReplyState(row.identifier);
    if (state.state === "delivered") {
      return { kind: "delivered", messageId: state.messageId, email: state.email };
    }
    if (state.leaseUntil > now.getTime()) return { kind: "busy" };

    // The lease ran out (or was released): take it over.
    const next =
      state.state === "sending"
        ? fresh
        : formatReplyState({ ...state, leaseUntil });
    const took = await db.verificationToken.updateMany({
      where: { token, identifier: row.identifier },
      data: { identifier: next, expires },
    });
    if (took.count === 0) continue;
    return state.state === "sending"
      ? { kind: "new", identifier: next }
      : { kind: "resume", identifier: next, messageId: state.messageId, steps: state.steps };
  }
  return { kind: "busy" };
}

// ── Running a reply ────────────────────────────────────────────────

/** What the email step reports. */
export type EmailResult =
  | { status: "sent" }
  | { status: "skipped" }
  | { status: "failed"; reason: string; permanent: boolean };

export interface ReplySteps<T extends { id: string }> {
  /** Create the message. */
  create(): Promise<T>;
  /** Load a message an earlier attempt created, or null if it is gone. */
  load(messageId: string): Promise<T | null>;
  /** Update the conversation and send the realtime events. */
  notify(message: T): Promise<void>;
  /** Dispatch the message.created webhooks. */
  webhooks(message: T): Promise<void>;
  /** Email the customer. Must not throw; report a failure instead. */
  email(message: T): Promise<EmailResult>;
}

export type ReplyRun<T> =
  /** Every step is done. email says whether the email went out. */
  | { kind: "delivered"; message: T; email: EmailResult; repeat: boolean }
  /**
   * The message is saved but a step didn't finish. A retry with the same
   * key runs the missing steps only.
   */
  | { kind: "incomplete"; message: T; failedStep: "notify" | "webhooks" | "email"; email?: EmailResult }
  /** Another attempt with this key is running. */
  | { kind: "busy" }
  /** The key's message no longer exists (deleted). */
  | { kind: "gone" };

function emailCode(result: EmailResult): EmailCode {
  if (result.status !== "failed") return result.status;
  return result.reason === "recipient_rejected" ? "recipient_rejected" : "sender_rejected";
}

/** The EmailResult a finished row stands for. */
export function emailFromCode(code: EmailCode): EmailResult {
  if (code === "sent" || code === "skipped") return { status: code };
  return { status: "failed", reason: code, permanent: true };
}

/**
 * Run a reply: claim the key, create the message (once), then the steps
 * that haven't been done yet. Without a key it just runs every step.
 */
export async function runReplyOnce<T extends { id: string }>(
  db: ReplyIdemDb,
  input: { conversationId: string; userId: string; key: string | null; now?: () => Date },
  steps: ReplySteps<T>,
  log: (line: string) => void = console.warn,
): Promise<ReplyRun<T>> {
  const clock = input.now ?? (() => new Date());

  if (!input.key) {
    const message = await steps.create();
    try {
      await steps.notify(message);
    } catch {
      return { kind: "incomplete", message, failedStep: "notify" };
    }
    await steps.webhooks(message).catch(() => {});
    const email = await steps.email(message);
    if (email.status === "failed" && !email.permanent) {
      return { kind: "incomplete", message, failedStep: "email", email };
    }
    return { kind: "delivered", message, email, repeat: false };
  }

  const token = replyIdemToken(input.conversationId, input.userId, input.key);
  const claim = await claimReplyKey(db, token, clock());

  if (claim.kind === "busy") return { kind: "busy" };
  if (claim.kind === "delivered") {
    const message = await steps.load(claim.messageId);
    if (!message) return { kind: "gone" };
    return { kind: "delivered", message, email: emailFromCode(claim.email), repeat: true };
  }

  // This attempt holds the lease from here on. `current` is the row's
  // identifier as this attempt last wrote it; every write checks it, so an
  // attempt whose lease was taken over can't overwrite the new owner. Each
  // step that finishes renews the lease.
  let current = claim.identifier;
  async function move(next: ReplyState): Promise<boolean> {
    const identifier = formatReplyState(next);
    const { count } = await db.verificationToken.updateMany({
      where: { token, identifier: current },
      data: { identifier, expires: new Date(clock().getTime() + REPLY_IDEM_TTL_MS) },
    });
    if (count > 0) current = identifier;
    return count > 0;
  }
  function saved(messageId: string, steps: string, held: boolean): ReplyState {
    return { state: "saved", messageId, steps, leaseUntil: held ? clock().getTime() + REPLY_LEASE_MS : 0 };
  }
  async function record(next: ReplyState, what: string) {
    // One retry: these are single-row updates, and a lost "saved" would let
    // a takeover create the message again.
    const ok = await move(next).catch(() => move(next).catch(() => false));
    if (!ok) log(`[reply-idem] could not record ${what}`);
  }
  async function release(messageId: string, steps: string) {
    await record(saved(messageId, steps, false), "the released lease");
  }

  let message: T;
  let done: string;
  if (claim.kind === "new") {
    try {
      message = await steps.create();
    } catch (error) {
      // Nothing was saved: free the key so a retry starts over.
      await db.verificationToken.deleteMany({ where: { token, identifier: current } }).catch(() => {});
      throw error;
    }
    done = "";
    await record(saved(message.id, done, true), "the saved message");
  } else {
    const existing = await steps.load(claim.messageId);
    if (!existing) {
      await db.verificationToken.deleteMany({ where: { token, identifier: current } }).catch(() => {});
      return { kind: "gone" };
    }
    message = existing;
    done = claim.steps;
  }

  const followUps: Array<[ReplyStep, "notify" | "webhooks", (m: T) => Promise<void>]> = [
    ["n", "notify", (m) => steps.notify(m)],
    ["w", "webhooks", (m) => steps.webhooks(m)],
  ];
  for (const [flag, name, run] of followUps) {
    if (done.includes(flag)) continue;
    try {
      await run(message);
    } catch (error) {
      log(`[reply-idem] ${name} failed: ${error instanceof Error ? error.name : "error"}`);
      await release(message.id, done);
      return { kind: "incomplete", message, failedStep: name };
    }
    done += flag;
    await record(saved(message.id, done, true), `step ${name}`);
  }

  const email = await steps.email(message);
  if (email.status === "failed" && !email.permanent) {
    // Not delivered: leave it "saved" with the lease released, so the next
    // retry sends the email again.
    await release(message.id, done);
    return { kind: "incomplete", message, failedStep: "email", email };
  }

  await record({ state: "delivered", messageId: message.id, email: emailCode(email) }, "the delivered reply");
  return { kind: "delivered", message, email, repeat: false };
}

/** Delete expired reply-idem:* rows. Returns how many. */
export async function sweepExpiredReplyKeys(db: ReplyIdemDb, now: Date = new Date()): Promise<number> {
  const { count } = await db.verificationToken.deleteMany({
    where: { token: { startsWith: REPLY_IDEM_PREFIX }, expires: { lt: now } },
  });
  return count;
}
