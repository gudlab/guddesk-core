import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";

import {
  buildConversationReplyTo,
  emailBlockReason,
  guardEmailSend,
  isEmailSendingAllowed,
  redactEmail,
  sendEmail,
  type OutboundEmail,
} from "./outbound-email";

function fakeClient() {
  const sent: OutboundEmail[] = [];
  return {
    sent,
    client: {
      emails: {
        send: async (email: OutboundEmail) => {
          sent.push(email);
          return { data: { id: "email_1" }, error: null, headers: null };
        },
      },
    } as never,
  };
}

const EMAIL: OutboundEmail = {
  from: "GudDesk <onboarding@resend.dev>",
  to: "agent@example.com",
  subject: "New message from A visitor",
  html: "<p>secret body with a token=abc123</p>",
};

function withResendKey<T>(fn: () => Promise<T>): Promise<T> {
  const saved = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_live_looks_real";
  return fn().finally(() => {
    if (saved === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = saved;
  });
}

const PROD = { VERCEL: "1", VERCEL_ENV: "production", NODE_ENV: "production" };
const PREVIEW = { VERCEL: "1", VERCEL_ENV: "preview", NODE_ENV: "production" };
const SELF_HOST = { NODE_ENV: "production" };

describe("isEmailSendingAllowed", () => {
  it("on Vercel, allows only VERCEL_ENV=production", () => {
    assert.equal(isEmailSendingAllowed(PROD), true);
    assert.equal(isEmailSendingAllowed({ ...PROD, VERCEL_ENV: " Production " }), true);
    assert.equal(isEmailSendingAllowed(PREVIEW), false);
    assert.equal(isEmailSendingAllowed({ VERCEL: "1", VERCEL_ENV: "development", NODE_ENV: "development" }), false);
    assert.equal(isEmailSendingAllowed({ VERCEL: "1", VERCEL_ENV: "staging" }), false);
  });

  it("on Vercel, blocks when VERCEL_ENV is missing or empty", () => {
    assert.equal(emailBlockReason({ VERCEL: "1" }), "VERCEL_ENV missing");
    assert.equal(emailBlockReason({ VERCEL: "1", VERCEL_ENV: "" }), "VERCEL_ENV missing");
    assert.equal(emailBlockReason({ VERCEL: "1", VERCEL_ENV: "  " }), "VERCEL_ENV missing");
  });

  it("on Vercel, EMAIL_SEND_IN_DEV does not unblock Preview", () => {
    assert.equal(isEmailSendingAllowed({ ...PREVIEW, EMAIL_SEND_IN_DEV: "1" }), false);
  });

  it("self-host with no Vercel vars sends", () => {
    assert.equal(isEmailSendingAllowed(SELF_HOST), true);
    assert.equal(isEmailSendingAllowed({}), true);
    assert.equal(isEmailSendingAllowed({ NODE_ENV: "test" }), true);
  });

  it("self-host under NODE_ENV=development blocks unless EMAIL_SEND_IN_DEV=1", () => {
    assert.equal(emailBlockReason({ NODE_ENV: "development" }), "NODE_ENV=development");
    assert.equal(isEmailSendingAllowed({ NODE_ENV: "development", EMAIL_SEND_IN_DEV: "0" }), false);
    assert.equal(isEmailSendingAllowed({ NODE_ENV: "development", EMAIL_SEND_IN_DEV: "true" }), false);
    assert.equal(isEmailSendingAllowed({ NODE_ENV: "development", EMAIL_SEND_IN_DEV: "1" }), true);
  });

  it("a stray VERCEL_ENV without VERCEL=1 follows the self-host rule", () => {
    assert.equal(isEmailSendingAllowed({ VERCEL_ENV: "preview", NODE_ENV: "production" }), true);
  });
});

describe("redactEmail", () => {
  it("keeps the first letter and the domain", () => {
    assert.equal(redactEmail("jane@example.com"), "j***@example.com");
    assert.equal(redactEmail("Jane Doe <jane.doe@example.co.uk>"), "j***@example.co.uk");
    assert.equal(redactEmail("not-an-email"), "***");
    assert.equal(redactEmail("@example.com"), "***");
  });
});

describe("outbound email gate", () => {
  it("blocks a send on Preview even when a Resend key is set, and logs a redacted line", async () => {
    await withResendKey(async () => {
      const { sent, client } = fakeClient();
      const lines: string[] = [];
      const result = await sendEmail("inbox-notification", EMAIL, {
        client,
        env: PREVIEW,
        log: (l) => lines.push(l),
      });
      assert.deepEqual(result, { status: "skipped", skipped: true });
      assert.equal(sent.length, 0);
      assert.equal(lines.length, 1);
      assert.match(lines[0], /not sent \(VERCEL_ENV=preview\)/);
      assert.match(lines[0], /template=inbox-notification/);
      assert.match(lines[0], /to=a\*\*\*@example\.com/);
      assert.match(lines[0], /subject="New message from A visitor"/);
      assert.doesNotMatch(lines[0], /agent@example\.com/);
      // No body, no key.
      assert.doesNotMatch(lines[0], /secret body|abc123|re_live/);
    });
  });

  it("blocks on Vercel Development", async () => {
    const { sent, client } = fakeClient();
    const result = await sendEmail("password-reset", EMAIL, {
      client,
      env: { VERCEL: "1", VERCEL_ENV: "development", NODE_ENV: "development" },
      log: () => {},
    });
    assert.deepEqual(result, { status: "skipped", skipped: true });
    assert.equal(sent.length, 0);
  });

  it("blocks on Vercel when VERCEL_ENV is missing", async () => {
    const { sent, client } = fakeClient();
    const lines: string[] = [];
    const result = await sendEmail("sla-breach", EMAIL, { client, env: { VERCEL: "1" }, log: (l) => lines.push(l) });
    assert.deepEqual(result, { status: "skipped", skipped: true });
    assert.equal(sent.length, 0);
    assert.match(lines[0], /VERCEL_ENV missing/);
  });

  it("sends on Vercel production", async () => {
    const { sent, client } = fakeClient();
    const result = await sendEmail("workspace-invitation", EMAIL, { client, env: PROD });
    assert.deepEqual(result, { status: "sent", id: "email_1" });
    assert.deepEqual(sent, [EMAIL]);
  });

  it("sends on self-host with no Vercel vars", async () => {
    const { sent, client } = fakeClient();
    await sendEmail("sla-breach", EMAIL, { client, env: SELF_HOST });
    assert.equal(sent.length, 1);
  });

  it("blocks self-host dev, and sends with EMAIL_SEND_IN_DEV=1", async () => {
    const { sent, client } = fakeClient();
    const blocked = await sendEmail("sla-breach", EMAIL, { client, env: { NODE_ENV: "development" }, log: () => {} });
    assert.deepEqual(blocked, { status: "skipped", skipped: true });
    assert.equal(sent.length, 0);
    await sendEmail("sla-breach", EMAIL, { client, env: { NODE_ENV: "development", EMAIL_SEND_IN_DEV: "1" } });
    assert.equal(sent.length, 1);
  });

  it("reads process.env by default", async () => {
    const keys = ["VERCEL", "VERCEL_ENV", "NODE_ENV", "EMAIL_SEND_IN_DEV"] as const;
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    const env = process.env as Record<string, string | undefined>;
    try {
      env.VERCEL = "1";
      env.VERCEL_ENV = "preview";
      assert.equal(isEmailSendingAllowed(), false);
      let ran = false;
      await guardEmailSend({ to: "a@example.com", subject: "s", template: "magic-link" }, async () => {
        ran = true;
      }, { log: () => {} });
      assert.equal(ran, false);
      env.VERCEL_ENV = "production";
      assert.equal(isEmailSendingAllowed(), true);
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete env[k];
        else env[k] = saved[k];
      }
    }
  });

  it("does not build a reply+ address where email is blocked", () => {
    assert.equal(buildConversationReplyTo("conv_1", PREVIEW), undefined);
    assert.equal(buildConversationReplyTo("conv_1", { VERCEL: "1" }), undefined);
    assert.equal(buildConversationReplyTo("conv_1", { NODE_ENV: "development" }), undefined);
    assert.equal(buildConversationReplyTo("conv_1", PROD), "reply+conv_1@mail.guddesk.com");
    assert.equal(buildConversationReplyTo("conv_1", SELF_HOST), "reply+conv_1@mail.guddesk.com");
  });
});

describe("every send path goes through lib/outbound-email.ts", () => {
  const root = join(__dirname, "..");
  const SKIP = new Set(["node_modules", ".next", ".git", ".contentlayer", "dist", "packages", "content", "public"]);

  function sourceFiles(dir: string, acc: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) sourceFiles(path, acc);
      else if (/\.(ts|tsx|mjs|js)$/.test(name) && !/\.test\.ts$/.test(name)) acc.push(path);
    }
    return acc;
  }

  it("no other file creates a Resend client, calls emails.send or builds reply+ addresses", () => {
    const offenders: string[] = [];
    for (const path of sourceFiles(root)) {
      const rel = relative(root, path);
      if (rel === join("lib", "outbound-email.ts")) continue;
      const src = readFileSync(path, "utf8");
      if (/new Resend\(|\.emails\.send\(|from "resend"|reply\+\$\{/.test(src)) offenders.push(rel);
    }
    assert.deepEqual(offenders, []);
  });

  it("the magic link goes through the gate", () => {
    const auth = readFileSync(join(root, "auth.config.ts"), "utf8");
    assert.match(auth, /sendVerificationRequest:/);
    assert.match(auth, /sendMagicLink\(/);
    const magic = readFileSync(join(root, "lib", "magic-link.ts"), "utf8");
    assert.match(magic, /guardEmailSend\(/);
  });
});
