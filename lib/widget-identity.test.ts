// This repo has no `pnpm test` script. Run:
//   npx tsx --test lib/widget-identity.test.ts
import assert from "node:assert/strict";
import { createHmac } from "crypto";
import { describe, it } from "node:test";

import {
  resolveIdentifyExternalId,
  verifyIdentityHash,
} from "./widget-identity";

const SECRET = "test-identity-secret";
const USER_ID = "user_abc123";

function sign(userId: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(userId).digest("hex");
}

describe("verifyIdentityHash", () => {
  it("accepts HMAC-SHA256(secret, userId)", () => {
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

  it("rejects a malformed hash without throwing on length mismatch", () => {
    assert.equal(verifyIdentityHash("deadbeef", SECRET, USER_ID), "invalid");
    assert.equal(
      verifyIdentityHash(`${sign(USER_ID)}00`, SECRET, USER_ID),
      "invalid",
    );
  });

  it("reports missing when userHash is absent", () => {
    assert.equal(verifyIdentityHash(undefined, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(null, SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash("", SECRET, USER_ID), "missing");
    assert.equal(verifyIdentityHash(0, SECRET, USER_ID), "missing");
  });
});

describe("resolveIdentifyExternalId", () => {
  it("leaves identify() without an externalId unverified", () => {
    assert.deepEqual(resolveIdentifyExternalId(undefined, undefined, SECRET), {
      ok: true,
      externalId: null,
    });
  });

  it("does not attach when the workspace has no identity secret", () => {
    assert.deepEqual(resolveIdentifyExternalId(USER_ID, undefined, null), {
      ok: true,
      externalId: null,
    });
    assert.deepEqual(
      resolveIdentifyExternalId(USER_ID, sign(USER_ID), null),
      { ok: true, externalId: null },
    );
    assert.deepEqual(resolveIdentifyExternalId(USER_ID, undefined, ""), {
      ok: true,
      externalId: null,
    });
  });

  it("attaches only with a valid HMAC when a secret is set", () => {
    assert.deepEqual(
      resolveIdentifyExternalId(USER_ID, sign(USER_ID), SECRET),
      { ok: true, externalId: USER_ID },
    );
  });

  it("returns the existing 403 when the hash is missing", () => {
    assert.deepEqual(resolveIdentifyExternalId(USER_ID, undefined, SECRET), {
      ok: false,
      error:
        "Identity verification is enabled. Provide a userHash generated server-side with HMAC-SHA256(secret, userId).",
    });
  });

  it("returns the existing 403 when the hash is invalid", () => {
    assert.deepEqual(resolveIdentifyExternalId(USER_ID, "deadbeef", SECRET), {
      ok: false,
      error: "Invalid identity hash",
    });
  });
});
