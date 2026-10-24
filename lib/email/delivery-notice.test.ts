import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { deliveryFailure, deliveryNotice } from "./delivery-notice";

const read = (path: string) => readFileSync(join(__dirname, "..", "..", path), "utf8");

describe("email-channel reply delivery notice", () => {
  it("an unverified from address is a sender rejection with its own notice", () => {
    const delivery = deliveryFailure({ name: "validation_error", statusCode: 403 });
    assert.deepEqual(delivery, { status: "failed", reason: "sender_rejected" });
    assert.match(deliveryNotice(delivery) ?? "", /Resend rejected the from address/);
    assert.equal(deliveryFailure({ name: "validation_error", statusCode: 422 }).status, "failed");
  });

  it("other failures get the generic notice; key problems are not blamed on the address", () => {
    for (const error of [
      { name: "invalid_api_key", statusCode: 403 },
      { name: "exception", statusCode: null },
      { name: "rate_limit_exceeded", statusCode: 429 },
    ]) {
      const delivery = deliveryFailure(error);
      assert.deepEqual(delivery, { status: "failed", reason: "send_failed" });
      assert.equal(deliveryNotice(delivery), "Reply saved, but the email to the customer could not be sent.");
    }
  });

  it("sent or skipped shows nothing", () => {
    assert.equal(deliveryNotice({ status: "sent" }), null);
    assert.equal(deliveryNotice({ status: "skipped" }), null);
    assert.equal(deliveryNotice(undefined), null);
  });

  it("the reply is awaited and the notice reaches both reply boxes", () => {
    const provider = read("lib/channels/email/provider.ts");
    assert.match(provider, /return sent\.status === "failed" \? deliveryFailure\(sent\.error\) : \{ status: "sent" \};/);
    const action = read("actions/send-message.ts");
    assert.match(action, /const delivery = await provider\.sendOutbound\(/);
    assert.match(action, /emailError = deliveryNotice\(delivery\);/);
    assert.match(action, /messageId: message\.id,\s*emailError,/);
    for (const path of ["components/inbox/reply-box.tsx", "components/inbox/shared-draft-editor.tsx"]) {
      assert.match(read(path), /toast\.error\(result\.emailError/, path);
    }
  });
});
