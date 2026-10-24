/**
 * Remembers svix-ids so a delivery is processed once. No new table: like
 * lib/throttle.ts, it uses the existing verification_tokens table, one row
 * per id with token = "inbound:svix:<id>". The identifier holds the state:
 *
 *   inbound:svix:processing  claimed, still running. Short TTL, so a
 *                            crashed attempt frees the id quickly.
 *   inbound:svix:done        finished. Kept 3 days, longer than Svix's
 *                            retry schedule (about 27 hours), because
 *                            retries and dashboard replays reuse the id.
 *
 * Auth.js only reads verification tokens by an email identifier plus a
 * SHA-256 hash, so these rows can't be used to sign in. Expired rows are
 * swept by the sla-check cron (sweepExpiredWebhookIds).
 */

export interface ReplayDb {
  verificationToken: {
    updateMany(args: {
      where: { token: string; expires?: { lte: Date } };
      data: { identifier: string; expires: Date };
    }): Promise<{ count: number }>;
    create(args: { data: { identifier: string; token: string; expires: Date } }): Promise<unknown>;
    findUnique(args: {
      where: { token: string };
      select: { identifier: true };
    }): Promise<{ identifier: string } | null>;
    deleteMany(args: {
      where: { token: string } | { token: { startsWith: string }; expires: { lt: Date } };
    }): Promise<{ count: number }>;
  };
}

export const REPLAY_PREFIX = "inbound:svix:";
export const PROCESSING = `${REPLAY_PREFIX}processing`;
export const DONE = `${REPLAY_PREFIX}done`;
/** Longer than one attempt can run (the fetch alone times out at 10 s). */
export const IN_FLIGHT_TTL_MS = 2 * 60 * 1000;
export const FINISHED_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export type Claim = "claimed" | "in_flight" | "done";

export function replayKey(svixId: string): string {
  return `${REPLAY_PREFIX}${svixId}`;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

/** Claim an id for processing, or say whether it is running or finished. */
export async function claimWebhookId(db: ReplayDb, svixId: string, now: Date = new Date()): Promise<Claim> {
  const token = replayKey(svixId);
  const expires = new Date(now.getTime() + IN_FLIGHT_TTL_MS);
  const reclaimed = await db.verificationToken.updateMany({
    where: { token, expires: { lte: now } },
    data: { identifier: PROCESSING, expires },
  });
  if (reclaimed.count > 0) return "claimed";
  try {
    await db.verificationToken.create({ data: { identifier: PROCESSING, token, expires } });
    return "claimed";
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const row = await db.verificationToken.findUnique({ where: { token }, select: { identifier: true } });
    return row?.identifier === DONE ? "done" : "in_flight";
  }
}

/** Mark an id finished, so later deliveries of it are a no-op. */
export async function finishWebhookId(db: ReplayDb, svixId: string, now: Date = new Date()): Promise<void> {
  await db.verificationToken.updateMany({
    where: { token: replayKey(svixId) },
    data: { identifier: DONE, expires: new Date(now.getTime() + FINISHED_TTL_MS) },
  });
}

/** Forget an id after a 5xx, so Svix's retry is processed instead of dropped. */
export async function releaseWebhookId(db: ReplayDb, svixId: string): Promise<void> {
  await db.verificationToken.deleteMany({ where: { token: replayKey(svixId) } });
}

/** Every row this module family writes: inbound:svix:* and inbound:bounce:*. */
export const INBOUND_PREFIX = "inbound:";

/** Delete expired inbound:* rows (replay ids and bounce rate limits). Returns how many. */
export async function sweepExpiredWebhookIds(db: ReplayDb, now: Date = new Date()): Promise<number> {
  const { count } = await db.verificationToken.deleteMany({
    where: { token: { startsWith: INBOUND_PREFIX }, expires: { lt: now } },
  });
  return count;
}
