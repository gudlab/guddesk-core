/**
 * "At most once per window" across serverless instances, without a new
 * table or column.
 *
 * The store is the existing verification_tokens table: one row per key,
 * with identifier = token = "throttle:<job>:<workspaceId>" and expires =
 * the end of the current window. A claim is one conditional write:
 *
 *   1. UPDATE ... SET expires = now + window WHERE key matches AND
 *      expires <= now. One row updated means this caller won the window.
 *   2. Otherwise INSERT the row. A unique violation means another caller
 *      already holds the window (or created it first), so this one skips.
 *
 * Postgres serializes both writes on the row, so two instances can't both
 * win the same window. Auth.js only reads a verification token by an
 * email identifier plus a SHA-256 hash, so these rows can never be used
 * to sign in, and Auth.js never touches them.
 */

export interface ThrottleDb {
  verificationToken: {
    updateMany(args: {
      where: { identifier: string; token: string; expires: { lte: Date } };
      data: { expires: Date };
    }): Promise<{ count: number }>;
    create(args: { data: { identifier: string; token: string; expires: Date } }): Promise<unknown>;
  };
}

export const THROTTLE_PREFIX = "throttle:";

export function throttleKey(job: string, workspaceId: string): string {
  return `${THROTTLE_PREFIX}${job}:${workspaceId}`;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/** True when this caller may run the job now; false when it ran recently. */
export async function claimThrottle(
  db: ThrottleDb,
  key: string,
  windowMs: number,
  now: Date = new Date(),
): Promise<boolean> {
  const until = new Date(now.getTime() + windowMs);
  const updated = await db.verificationToken.updateMany({
    where: { identifier: key, token: key, expires: { lte: now } },
    data: { expires: until },
  });
  if (updated.count > 0) return true;
  try {
    await db.verificationToken.create({ data: { identifier: key, token: key, expires: until } });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
