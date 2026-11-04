import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";

import type { Resend } from "resend";

import { inviteNotice } from "@/lib/invite-notice";
import { MagicLinkSendFailedError, sendMagicLink } from "@/lib/magic-link";
import { resetEmailKeyWarning, sendEmail, type OutboundEmail } from "@/lib/outbound-email";
import { PASSWORD_RESET_NEUTRAL_MESSAGE } from "@/lib/password-reset-neutral";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const PROD = { VERCEL: "1", VERCEL_ENV: "production" };
const EMAIL: OutboundEmail = {
  from: "GudDesk <notifications@guddesk.com>",
  to: "jane.doe@example.com",
  subject: "Hi",
  html: "<p>secret body</p>",
};
const FAKE_KEY = ["re", "abcDEF123456"].join("_");

function capture() {
  const warn: string[] = [];
  const error: string[] = [];
  return { warn, error, opts: { warn: (l: string) => warn.push(l), error: (l: string) => error.push(l) } };
}

function clientReturning(response: unknown) {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    client: {
      emails: {
        send: async () => {
          calls++;
          return response as Awaited<ReturnType<Resend["emails"]["send"]>>;
        },
      },
    },
  };
}

beforeEach(() => resetEmailKeyWarning());

describe("sendEmail error handling", () => {
  it("a returned Resend error is a failure, logged with the recipient masked and no key", async () => {
    const { error, warn, opts } = capture();
    const { client } = clientReturning({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 422,
        message: `You can only send testing emails to your own email address (owner@example.com). key ${FAKE_KEY}`,
      },
    });
    const result = await sendEmail("workspace-invitation", EMAIL, { client, env: PROD, ...opts });
    assert.equal(result.status, "failed");
    assert.deepEqual(result.status === "failed" && { name: result.error.name, statusCode: result.error.statusCode }, {
      name: "validation_error",
      statusCode: 422,
    });
    for (const leaked of ["owner@example.com", FAKE_KEY]) {
      assert.ok(result.status === "failed" && !result.error.message.includes(leaked), `result message leaks ${leaked}`);
    }
    assert.equal(error.length, 1);
    assert.match(error[0], /send failed: template=workspace-invitation to=j\*\*\*@example\.com error=validation_error \(422\)/);
    for (const leaked of ["jane.doe@", "owner@example.com", FAKE_KEY, "secret body"]) {
      assert.ok(!error[0].includes(leaked), leaked);
    }
    assert.equal(warn.length, 0, "a 422 is not a key problem");
  });

  it("a thrown error is a failure too, not an exception for the caller", async () => {
    const { error, opts } = capture();
    const client = {
      emails: {
        send: async (): Promise<Awaited<ReturnType<Resend["emails"]["send"]>>> => {
          throw new Error("socket hang up for jane.doe@example.com");
        },
      },
    };
    const result = await sendEmail("password-reset", EMAIL, { client, env: PROD, ...opts });
    assert.deepEqual(result, {
      status: "failed",
      error: { name: "exception", statusCode: null, message: "socket hang up for j***@example.com" },
    });
    assert.match(error[0], /error=exception: socket hang up for j\*\*\*@example\.com/);
  });

  it("a rejected key (401/403) warns once per process, not per send", async () => {
    const { warn, opts } = capture();
    const { client } = clientReturning({
      data: null,
      error: { name: "restricted_api_key", statusCode: 403, message: "This API key is restricted" },
    });
    await sendEmail("sla-breach", EMAIL, { client, env: PROD, ...opts });
    await sendEmail("sla-breach", EMAIL, { client, env: PROD, ...opts });
    await sendEmail("inbox-notification", EMAIL, { client, env: PROD, ...opts });
    assert.equal(warn.length, 1);
    assert.match(warn[0], /Resend rejected the API key \(403 restricted_api_key\)/);
  });

  it("a 401 key error fires the health warning, naming the key", async () => {
    const { warn, opts } = capture();
    const { client } = clientReturning({
      data: null,
      error: { name: "invalid_api_key", statusCode: 401, message: `API key ${FAKE_KEY} is invalid` },
    });
    await sendEmail("password-reset", EMAIL, { client, env: PROD, ...opts });
    assert.equal(warn.length, 1);
    assert.match(warn[0], /Resend rejected the API key \(401 invalid_api_key\)\. .*Check RESEND_API_KEY\./);
    assert.ok(!warn[0].includes(FAKE_KEY));
  });

  it("a 403 for an unverified sender fires the health warning, pointing at RESEND_FROM", async () => {
    const { warn, opts } = capture();
    const { client } = clientReturning({
      data: null,
      error: { name: "validation_error", statusCode: 403, message: "The guddesk.com domain is not verified" },
    });
    await sendEmail("workspace-invitation", EMAIL, { client, env: PROD, ...opts });
    assert.equal(warn.length, 1);
    assert.match(warn[0], /Resend refused the send \(403 validation_error\).*RESEND_FROM domain is verified/);
  });

  it("a workspace address refused (403) doesn't fire the RESEND_FROM warning or use up the key warning", async () => {
    const { warn, opts } = capture();
    const refused = clientReturning({
      data: null,
      error: { name: "validation_error", statusCode: 403, message: "The acme.test domain is not verified" },
    }).client;
    for (let i = 0; i < 3; i++) {
      await sendEmail("email-channel-reply", EMAIL, { client: refused, env: PROD, sender: "workspace", ...opts });
    }
    assert.equal(warn.length, 0);
    const badKey = clientReturning({ data: null, error: { name: "invalid_api_key", statusCode: 401, message: "bad" } }).client;
    await sendEmail("email-channel-reply", EMAIL, { client: badKey, env: PROD, sender: "workspace", ...opts });
    assert.equal(warn.length, 1);
    assert.match(warn[0], /rejected the API key \(401 invalid_api_key\)/);
  });

  it("key and sender warnings have their own once-flags", async () => {
    const { warn, opts } = capture();
    const sender = clientReturning({ data: null, error: { name: "validation_error", statusCode: 403, message: "not verified" } }).client;
    const key = clientReturning({ data: null, error: { name: "restricted_api_key", statusCode: 403, message: "nope" } }).client;
    for (const client of [sender, sender, key, key]) {
      await sendEmail("inbox-notification", EMAIL, { client, env: PROD, ...opts });
    }
    assert.equal(warn.length, 2);
    assert.match(warn[0], /RESEND_FROM domain is verified/);
    assert.match(warn[1], /rejected the API key/);
  });

  it("the email-channel reply sends as the workspace", () => {
    assert.match(read("lib/channels/email/provider.ts"), /\}, \{ sender: "workspace", idempotencyKey: `email-channel-reply\/\$\{message\.id\}` \}\);/);
  });

  it("other errors (422, 429, 500) don't fire the health warning", async () => {
    const { warn, opts } = capture();
    for (const [name, statusCode] of [["validation_error", 422], ["rate_limit_exceeded", 429], ["application_error", 500]] as const) {
      const { client } = clientReturning({ data: null, error: { name, statusCode, message: "x" } });
      await sendEmail("sla-breach", EMAIL, { client, env: PROD, ...opts });
    }
    assert.equal(warn.length, 0);
  });

  it("RESEND_API_KEY stays required in env.mjs, so a deploy without it fails at boot", () => {
    assert.match(read("env.mjs"), /RESEND_API_KEY: z\.string\(\)\.min\(1\),/);
  });

  it("a missing RESEND_API_KEY warns once and fails without calling Resend", async () => {
    const { warn, error, opts } = capture();
    const first = await sendEmail("sla-breach", EMAIL, { env: PROD, hasApiKey: false, ...opts });
    await sendEmail("sla-breach", EMAIL, { env: PROD, hasApiKey: false, ...opts });
    assert.equal(first.status, "failed");
    assert.equal(warn.length, 1);
    assert.match(warn[0], /RESEND_API_KEY is not set/);
    assert.equal(error.length, 2, "each failed send is still logged");
  });

  it("a sent email reports sent", async () => {
    const { client } = clientReturning({ data: { id: "em_1" }, error: null });
    assert.deepEqual(await sendEmail("sla-breach", EMAIL, { client, env: PROD }), { status: "sent", id: "em_1" });
  });
});

describe("magic link send failure", () => {
  it("logs redacted, warns once on a rejected key, and rethrows without the details", async () => {
    const { warn, error, opts } = capture();
    const send = async () => {
      throw new Error(
        'Resend error: {"statusCode":401,"name":"invalid_api_key","message":"API key is invalid for owner@example.com"}',
      );
    };
    for (let i = 0; i < 2; i++) {
      await assert.rejects(sendMagicLink("jane.doe@example.com", send, { env: PROD, ...opts }), (e: unknown) => {
        assert.ok(e instanceof MagicLinkSendFailedError);
        assert.doesNotMatch((e as Error).message, /owner@|statusCode/);
        return true;
      });
    }
    assert.equal(warn.length, 1);
    assert.match(warn[0], /401 invalid_api_key/);
    assert.equal(error.length, 2);
    assert.ok(error.every((l) => !l.includes("owner@example.com") && !l.includes("jane.doe@")));
  });
});

describe("callers", () => {
  it("forgot-password never says the email was sent and answers the same either way", () => {
    const action = read("actions/forgot-password.ts");
    assert.doesNotMatch(action, /we sent|Failed to send email/i);
    // One answer for every account state; the lookup runs after the response.
    assert.equal((action.match(/return \{ success: PASSWORD_RESET_NEUTRAL_MESSAGE \}/g) ?? []).length, 1);
    assert.doesNotMatch(PASSWORD_RESET_NEUTRAL_MESSAGE, /sent/i);
    const form = read("components/forms/forgot-password-form.tsx");
    assert.doesNotMatch(form, /we sent/i);
  });

  it("invite: a failed send shows the copy link, the same as a skipped one", () => {
    const action = read("actions/invite-workspace-member.ts");
    assert.match(action, /else if \(sent\.status === "failed"\) emailStatus = "failed";/);
    assert.match(action, /if \(emailStatus !== "sent"\) \{\s*return \{ status: "success", token: invitation\.token, emailStatus, inviteUrl \};/);
    const notice = inviteNotice({ emailStatus: "failed", inviteUrl: "https://app.test/invitation?token=t" });
    assert.equal(notice.kind, "link");
  });

  it("notification and email-channel senders don't treat a returned error as sent", () => {
    // sendEmail logs failures itself and never throws; the callers' own
    // catch blocks stay as a guard.
    for (const file of ["lib/email-notifications.ts", "lib/channels/email/provider.ts"]) {
      assert.match(read(file), /await sendEmail\(/, file);
    }
  });
});
