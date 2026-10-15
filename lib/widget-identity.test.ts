import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import { verifyIdentityHash } from "./widget-identity";

const SECRET = "test-identity-secret";
const USER_ID = "user_123";

function sign(userId: string, secret: string = SECRET): string {
  return createHmac("sha256", secret).update(userId).digest("hex");
}

describe("verifyIdentityHash", () => {
  it("accepts a valid HMAC-SHA256 hex digest", () => {
    assert.equal(verifyIdentityHash(sign(USER_ID), SECRET, USER_ID), "ok");
  });

  it("rejects a hash for a different userId", () => {
    assert.equal(
      verifyIdentityHash(sign("other-user"), SECRET, USER_ID),
      "invalid",
    );
  });

  it("rejects a hash signed with a different secret", () => {
    assert.equal(
      verifyIdentityHash(sign(USER_ID, "wrong-secret"), SECRET, USER_ID),
      "invalid",
    );
  });

  it("rejects a digest of the wrong length without throwing", () => {
    assert.equal(verifyIdentityHash("deadbeef", SECRET, USER_ID), "invalid");
    assert.equal(
      verifyIdentityHash(`${sign(USER_ID)}00`, SECRET, USER_ID),
      "invalid",
    );
  });

  it("reports missing when userHash is absent or empty", () => {
    assert.equal(verifyIdentityHash(undefined, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(null, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash("", SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(0, SECRET, USER_ID), "missing");
  });
});
