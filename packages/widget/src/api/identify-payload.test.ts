import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildIdentifyPayload } from "./identify-payload";

const TIMEOUT = { timeout: 5_000 };

describe("buildIdentifyPayload", () => {
  it("sends userHash in the identify payload (issue #4)", TIMEOUT, () => {
    const payload = buildIdentifyPayload("gd_pub_abc", "tok_visitor", {
      userId: "usr_123",
      name: "Jane Doe",
      email: "jane@example.com",
      metadata: { plan: "pro" },
      userHash: "hmac-from-server",
    });

    const body = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;

    assert.equal(body.userHash, "hmac-from-server");
    assert.equal(body.externalId, "usr_123");
    assert.equal(body.appId, "gd_pub_abc");
    assert.equal(body.visitorToken, "tok_visitor");
    assert.equal(body.name, "Jane Doe");
    assert.equal(body.email, "jane@example.com");
    assert.deepEqual(body.metadata, { plan: "pro" });
    assert.equal("hash" in body, false);
  });

  it(
    "omits userHash from the JSON body when it is not provided",
    TIMEOUT,
    () => {
      const payload = buildIdentifyPayload("gd_pub_abc", null, {
        email: "anon@example.com",
      });
      const body = JSON.parse(JSON.stringify(payload)) as Record<
        string,
        unknown
      >;
      assert.equal("userHash" in body, false);
      assert.equal(body.email, "anon@example.com");
    },
  );
});
