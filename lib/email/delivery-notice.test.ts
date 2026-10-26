import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { deliveryFailure, deliveryNotice, isPermanentFailure, withSendTimeout } from "./delivery-notice";

const read = (path: string) => readFileSync(join(__dirname, "..", "..", path), "utf8");
const SAVED = /Your reply is saved in the conversation, so don't send it again\.$/;
const RETRY = /Your reply is saved in the conversation\. Press Retry email to try again\. The reply won't be posted twice\.$/;

describe("email-channel reply delivery notice", () => {
  it("an unverified from address is a sender rejection with its own notice", () => {
    const delivery = deliveryFailure({ name: "validation_error", statusCode: 403, message: "The acme.test domain is not verified." });
    assert.deepEqual(delivery, { status: "failed", reason: "sender_rejected" });
    assert.match(deliveryNotice(delivery) ?? "", /Resend rejected the from address/);
    assert.deepEqual(deliveryFailure({ name: "validation_error", statusCode: 422, message: "Invalid `from` field." }), {
      status: "failed",
      reason: "sender_rejected",
    });
  });

  it("Resend's testing-mode 403 says testing mode, not a rejected customer address", () => {
    const delivery = deliveryFailure({
      name: "validation_error",
      statusCode: 403,
      message:
        "You can only send testing emails to your own email address (o***@acme.test). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.",
    });
    assert.deepEqual(delivery, { status: "failed", reason: "testing_mode" });
    const notice = deliveryNotice(delivery) ?? "";
    assert.match(notice, /testing mode/);
    assert.match(notice, /Verify a domain in Resend/);
    assert.ok(!/customer's email address/.test(notice));
    assert.match(notice, SAVED);
  });

  it("a 422 about the `to` field blames the customer's address, not the from address", () => {
    const delivery = deliveryFailure({
      name: "validation_error",
      statusCode: 422,
      message: "Invalid `to` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.",
    });
    assert.deepEqual(delivery, { status: "failed", reason: "recipient_rejected" });
    const notice = deliveryNotice(delivery) ?? "";
    assert.match(notice, /rejected the customer's email address/);
    assert.ok(!/from address/.test(notice));
  });

  it("a 422 that names neither field gets the generic notice", () => {
    assert.deepEqual(deliveryFailure({ name: "validation_error", statusCode: 422, message: "Something else" }), {
      status: "failed",
      reason: "send_failed",
    });
  });

  it("other failures get the generic notice; key problems are not blamed on the address", () => {
    for (const error of [
      { name: "invalid_api_key", statusCode: 403 },
      { name: "exception", statusCode: null },
      { name: "rate_limit_exceeded", statusCode: 429 },
    ]) {
      const delivery = deliveryFailure(error);
      assert.deepEqual(delivery, { status: "failed", reason: "send_failed" });
      assert.match(deliveryNotice(delivery) ?? "", /^The email to the customer could not be sent\./);
    }
  });

  it("a permanent failure says not to send again; a temporary one offers a retry", () => {
    for (const reason of ["testing_mode", "sender_rejected", "recipient_rejected"] as const) {
      assert.equal(isPermanentFailure({ status: "failed", reason }), true, reason);
      assert.match(deliveryNotice({ status: "failed", reason }) ?? "", SAVED, reason);
    }
    for (const reason of ["send_failed", "timeout"] as const) {
      assert.equal(isPermanentFailure({ status: "failed", reason }), false, reason);
      assert.match(deliveryNotice({ status: "failed", reason }) ?? "", RETRY, reason);
    }
    assert.equal(isPermanentFailure({ status: "sent" }), false);
  });

  it("a reused Resend idempotency key with a changed payload counts as already sent", () => {
    assert.deepEqual(
      deliveryFailure({ name: "invalid_idempotent_request", statusCode: 409, message: "Same key, different payload" }),
      { status: "sent" },
    );
    assert.deepEqual(deliveryFailure({ name: "concurrent_idempotent_requests", statusCode: 409 }), {
      status: "failed",
      reason: "send_failed",
    });
  });

  it("sent or skipped shows nothing", () => {
    assert.equal(deliveryNotice({ status: "sent" }), null);
    assert.equal(deliveryNotice({ status: "skipped" }), null);
    assert.equal(deliveryNotice(undefined), null);
  });

  it("a send slower than the timeout becomes a timeout notice", async () => {
    const never = new Promise<never>(() => {});
    const delivery = await withSendTimeout(never, 10);
    assert.deepEqual(delivery, { status: "failed", reason: "timeout" });
    assert.match(deliveryNotice(delivery) ?? "", /didn't answer in time/);
    assert.deepEqual(await withSendTimeout(Promise.resolve({ status: "sent" as const }), 1000), { status: "sent" });
  });

  it("the reply is awaited with the timeout and the notice reaches both reply boxes", () => {
    const provider = read("lib/channels/email/provider.ts");
    assert.match(provider, /return sent\.status === "failed" \? deliveryFailure\(sent\.error\) : \{ status: "sent" \};/);
    const action = read("actions/send-message.ts");
    assert.match(action, /delivery = await withSendTimeout\(\s*provider\.sendOutbound\(/);
    assert.match(action, /deliveryNotice\(\{ status: "failed", reason: email\.reason as FailedReason \}\)/);
    assert.match(action, /messageId: message\.id,[\s\S]*?emailError,/);
    assert.match(read("lib/reply-delivery.ts"), /deps\.toast\.error\(result\.emailError/);
    assert.match(read("components/inbox/deliver-reply.ts"), /createReplyDelivery\(/);
  });
});
