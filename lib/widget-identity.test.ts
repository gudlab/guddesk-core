import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import {
  IDENTITY_INVALID_HASH_ERROR,
  IDENTITY_MISSING_HASH_ERROR,
  resolveWidgetIdentity,
  verifyIdentityHash,
} from "./widget-identity";

const SECRET = "test-identity-secret";
const USER_ID = "user_123";

function sign(userId: string, secret: string = SECRET): string {
  return createHmac("sha256", secret).update(userId).digest("hex");
}

const TIMEOUT = { timeout: 5_000 };

describe("verifyIdentityHash", () => {
  it("accepts a valid HMAC-SHA256 hex digest", TIMEOUT, () => {
    assert.equal(verifyIdentityHash(sign(USER_ID), SECRET, USER_ID), "ok");
  });

  it("rejects a hash for a different userId", TIMEOUT, () => {
    assert.equal(
      verifyIdentityHash(sign("other-user"), SECRET, USER_ID),
      "invalid",
    );
  });

  it("rejects a hash signed with a different secret", TIMEOUT, () => {
    assert.equal(
      verifyIdentityHash(sign(USER_ID, "wrong-secret"), SECRET, USER_ID),
      "invalid",
    );
  });

  it("rejects a digest of the wrong length without throwing", TIMEOUT, () => {
    assert.equal(verifyIdentityHash("deadbeef", SECRET, USER_ID), "invalid");
    assert.equal(
      verifyIdentityHash(`${sign(USER_ID)}00`, SECRET, USER_ID),
      "invalid",
    );
  });

  it("reports missing when userHash is absent or empty", TIMEOUT, () => {
    assert.equal(verifyIdentityHash(undefined, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(null, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash("", SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(0, SECRET, USER_ID), "missing");
  });
});

describe("resolveWidgetIdentity (BUG-001)", () => {
  it("drops externalId when the workspace has no identity secret", () => {
    const result = resolveWidgetIdentity({
      externalId: USER_ID,
      userHash: undefined,
      identitySecret: null,
    });
    assert.deepEqual(result, { ok: true, externalId: null });
  });

  it("drops externalId when the secret is an empty string", () => {
    const result = resolveWidgetIdentity({
      externalId: USER_ID,
      userHash: sign(USER_ID),
      identitySecret: "",
    });
    assert.deepEqual(result, { ok: true, externalId: null });
  });

  it("does not attach to an existing userId without a valid HMAC", () => {
    const unsigned = resolveWidgetIdentity({
      externalId: USER_ID,
      userHash: undefined,
      identitySecret: null,
    });
    const forged = resolveWidgetIdentity({
      externalId: USER_ID,
      userHash: "deadbeef",
      identitySecret: null,
    });
    assert.equal(unsigned.ok && unsigned.externalId, null);
    assert.equal(forged.ok && forged.externalId, null);
  });

  it("allows lookup after a valid HMAC when a secret is set", () => {
    const result = resolveWidgetIdentity({
      externalId: USER_ID,
      userHash: sign(USER_ID),
      identitySecret: SECRET,
    });
    assert.deepEqual(result, { ok: true, externalId: USER_ID });
  });

  it("returns 403-style missing/invalid errors when a secret is set", () => {
    assert.deepEqual(
      resolveWidgetIdentity({
        externalId: USER_ID,
        userHash: undefined,
        identitySecret: SECRET,
      }),
      { ok: false, error: IDENTITY_MISSING_HASH_ERROR },
    );
    assert.deepEqual(
      resolveWidgetIdentity({
        externalId: USER_ID,
        userHash: sign("other-user"),
        identitySecret: SECRET,
      }),
      { ok: false, error: IDENTITY_INVALID_HASH_ERROR },
    );
  });

  it("leaves anonymous identifies (no externalId) unchanged", () => {
    assert.deepEqual(
      resolveWidgetIdentity({
        externalId: undefined,
        userHash: undefined,
        identitySecret: SECRET,
      }),
      { ok: true, externalId: null },
    );
  });
});
