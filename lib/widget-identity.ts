import { createHmac, timingSafeEqual } from "crypto";

/**
 * Result of verifying a widget identify() HMAC-SHA256 userHash.
 *
 * "missing" vs "invalid" are distinct so the visitors route can keep
 * its existing 403 messages.
 */
export type IdentityHashResult = "ok" | "missing" | "invalid";

/**
 * Verify a widget identify() HMAC-SHA256 userHash.
 *
 * When a workspace has identity verification enabled, identify() calls
 * that include an externalId must also send HMAC-SHA256(secret, userId)
 * as userHash. Comparison is length-checked then timing-safe.
 */
export function verifyIdentityHash(
  userHash: unknown,
  secret: string,
  userId: string,
): IdentityHashResult {
  if (!userHash || typeof userHash !== "string") {
    return "missing";
  }

  const expected = createHmac("sha256", secret).update(userId).digest("hex");
  const givenBuf = Buffer.from(userHash);
  const expectedBuf = Buffer.from(expected);

  if (givenBuf.length !== expectedBuf.length) {
    return "invalid";
  }

  return timingSafeEqual(givenBuf, expectedBuf) ? "ok" : "invalid";
}
