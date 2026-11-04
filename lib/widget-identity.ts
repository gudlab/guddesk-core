import { createHmac, timingSafeEqual } from "crypto";

/**
 * Result of verifying a widget identify() HMAC-SHA256 userHash.
 *
 * "missing" vs "invalid" are distinct so the visitors route can keep
 * its existing 403 messages.
 */
export type IdentityHashResult = "ok" | "missing" | "invalid";

export type IdentifyExternalIdResult =
  | { ok: true; externalId: string | null }
  | { ok: false; error: string };

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

/**
 * Whether this identify() call may attach to an existing externalId visitor.
 *
 * A valid HMAC is required to use externalId. Workspaces without an
 * identity secret never attach — the caller must create a fresh
 * anonymous visitor.
 */
export function resolveIdentifyExternalId(
  externalId: unknown,
  userHash: unknown,
  identitySecret: string | null | undefined,
): IdentifyExternalIdResult {
  if (!externalId || typeof externalId !== "string") {
    return { ok: true, externalId: null };
  }

  if (!identitySecret) {
    return { ok: true, externalId: null };
  }

  const identity = verifyIdentityHash(userHash, identitySecret, externalId);
  if (identity === "missing") {
    return {
      ok: false,
      error:
        "Identity verification is enabled. Provide a userHash generated server-side with HMAC-SHA256(secret, userId).",
    };
  }
  if (identity === "invalid") {
    return { ok: false, error: "Invalid identity hash" };
  }

  return { ok: true, externalId };
}
