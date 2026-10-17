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

export const IDENTITY_MISSING_HASH_ERROR =
  "Identity verification is enabled. Provide a userHash generated server-side with HMAC-SHA256(secret, userId).";

export const IDENTITY_INVALID_HASH_ERROR = "Invalid identity hash";

export type WidgetIdentityResolution =
  | { ok: true; externalId: string | null }
  | { ok: false; error: string };

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Decide whether identify() may use externalId to look up or merge a visitor.
 *
 * BUG-001: without a valid HMAC, never attach to an existing externalId
 * visitor. If the workspace has no identitySecret, unverified identifies
 * are treated as anonymous (externalId dropped) so name/email still work.
 * If a secret is set, missing/invalid hashes still 403.
 */
export function resolveWidgetIdentity(input: {
  externalId: unknown;
  userHash: unknown;
  identitySecret: string | null | undefined;
}): WidgetIdentityResolution {
  const externalId = nonEmptyString(input.externalId);
  if (!externalId) {
    return { ok: true, externalId: null };
  }

  const secret = nonEmptyString(input.identitySecret);
  if (!secret) {
    return { ok: true, externalId: null };
  }

  const result = verifyIdentityHash(input.userHash, secret, externalId);
  if (result === "missing") {
    return { ok: false, error: IDENTITY_MISSING_HASH_ERROR };
  }
  if (result === "invalid") {
    return { ok: false, error: IDENTITY_INVALID_HASH_ERROR };
  }
  return { ok: true, externalId };
}
