/**
 * Remembers svix-ids so a captured request can't be replayed inside the
 * signature tolerance window. No new table: like lib/throttle.ts, it uses
 * the existing verification_tokens table, one row per id, with
 * identifier = token = "inbound:svix:<id>" and expires = now + the window.
 * Outside the window the signed timestamp is already stale, so an expired
 * row can be reclaimed. Auth.js only reads verification tokens by an email
 * identifier plus a SHA-256 hash, so these rows can't be used to sign in.
 */

export interface ReplayDb {
  verificationToken: {
    updateMany(args: {
      where: { identifier: string; token: string; expires: { lte: Date } };
      data: { expires: Date };
    }): Promise<{ count: number }>;
    create(args: { data: { identifier: string; token: string; expires: Date } }): Promise<unknown>;
    deleteMany(args: { where: { identifier: string; token: string } }): Promise<{ count: number }>;
  };
}

export const REPLAY_PREFIX = "inbound:svix:";

export function replayKey(svixId: string): string {
  return `${REPLAY_PREFIX}${svixId}`;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002";
}

/** True the first time an id is seen in the window, false for a repeat. */
export async function claimWebhookId(
  db: ReplayDb,
  svixId: string,
  windowMs: number,
  now: Date = new Date(),
): Promise<boolean> {
  const key = replayKey(svixId);
  const until = new Date(now.getTime() + windowMs);
  const reclaimed = await db.verificationToken.updateMany({
    where: { identifier: key, token: key, expires: { lte: now } },
    data: { expires: until },
  });
  if (reclaimed.count > 0) return true;
  try {
    await db.verificationToken.create({ data: { identifier: key, token: key, expires: until } });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

/**
 * Forget an id after processing failed with a 5xx, so Svix's retry (same
 * svix-id, fresh timestamp and signature) is processed instead of dropped.
 */
export async function releaseWebhookId(db: ReplayDb, svixId: string): Promise<void> {
  const key = replayKey(svixId);
  await db.verificationToken.deleteMany({ where: { identifier: key, token: key } });
}
