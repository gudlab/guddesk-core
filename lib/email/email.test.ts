import { strict as assert } from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import type { Resend } from "resend";

import { PASSWORD_RESET_NEUTRAL_MESSAGE } from "../password-reset-neutral";
import {
  emailFrom,
  fallbackFromAddress,
  parseFrom,
  resetFromWarning,
} from "./from";
import {
  MagicLinkSendFailedError,
  redactEmail,
  resetEmailKeyWarning,
  sendEmail,
  sendMagicLinkSafely,
} from "./send";

type SendResult = Awaited<ReturnType<Resend["emails"]["send"]>>;
const ROOT = join(__dirname, "..", "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

function recorder() {
  const lines: string[] = [];
  return { lines, log: (line: string) => lines.push(line) };
}

function clientReturning(response: SendResult) {
  return { emails: { send: async () => response } };
}

const KEY = ["re", "LiveKeyShouldNeverAppear123"].join("_");
const MESSAGE = {
  from: "GudDesk <support@acme.test>",
  to: "jane.doe@example.com",
  subject: "Hi",
  html: "<p>secret body text</p>",
};

beforeEach(() => {
  resetFromWarning();
  resetEmailKeyWarning();
});

describe("emailFrom", () => {
  it("uses RESEND_FROM with its name", () => {
    assert.equal(
      emailFrom(undefined, { RESEND_FROM: "Acme Help <help@acme.test>" }),
      "Acme Help <help@acme.test>",
    );
  });

  it("accepts a bare address and names it GudDesk", () => {
    assert.equal(emailFrom(undefined, { RESEND_FROM: "help@acme.test" }), "GudDesk <help@acme.test>");
  });

  it("lets the caller set the display name, cleaned for the header", () => {
    assert.equal(
      emailFrom('Bob "<x>"\r\n', { RESEND_FROM: "help@acme.test" }),
      "Bob x <help@acme.test>",
    );
    assert.equal(emailFrom("Acme, Inc", { RESEND_FROM: "help@acme.test" }), '"Acme, Inc" <help@acme.test>');
  });

  it("falls back to noreply@ the app host and warns once without a value", () => {
    const { lines, log } = recorder();
    const env = { NEXT_PUBLIC_APP_URL: "https://support.acme.test" };
    assert.equal(emailFrom(undefined, env, log), "GudDesk <noreply@support.acme.test>");
    assert.equal(emailFrom("Acme", env, log), "Acme <noreply@support.acme.test>");
    assert.equal(lines.length, 1);
    assert.match(lines[0], /RESEND_FROM is not set/);
  });

  it("treats an invalid RESEND_FROM like unset and does not print it", () => {
    const { lines, log } = recorder();
    const from = emailFrom(undefined, { RESEND_FROM: "not an address zzq", NEXT_PUBLIC_APP_URL: "https://a.test" }, log);
    assert.equal(from, "GudDesk <noreply@a.test>");
    assert.equal(lines.length, 1);
    assert.doesNotMatch(lines[0], /zzq/);
  });

  it("never falls back to a GudDesk-owned or Resend test domain", () => {
    for (const appUrl of [undefined, "", "nonsense", "http://localhost:3000"]) {
      const address = fallbackFromAddress(appUrl);
      assert.doesNotMatch(address, /guddesk|resend/i);
    }
    assert.equal(parseFrom(""), null);
  });
});

describe("sendEmail errors", () => {
  it("treats a returned Resend error as failed and logs it redacted", async () => {
    const { lines, log } = recorder();
    const warn = recorder();
    const outcome = await sendEmail(
      "password-reset",
      MESSAGE,
      {
        client: clientReturning({
          data: null,
          error: {
            name: "validation_error",
            statusCode: 422,
            message: `The owner.only@example.com domain is not verified (${KEY})`,
          },
        } as SendResult),
        error: log,
        warn: warn.log,
      },
    );
    assert.deepEqual(outcome, { status: "failed", error: { name: "validation_error", statusCode: 422 } });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /template=password-reset to=j\*\*\*@example\.com error=validation_error \(422\)/);
    for (const leaked of ["jane.doe", "owner.only", KEY, "secret body"]) {
      assert.ok(!lines[0].includes(leaked), leaked);
    }
    assert.equal(warn.lines.length, 0);
  });

  it("turns a thrown error into failed", async () => {
    const { lines, log } = recorder();
    const client = {
      emails: {
        send: async (): Promise<SendResult> => {
          throw new Error("socket hang up for jane.doe@example.com");
        },
      },
    };
    const outcome = await sendEmail("workspace-invitation", MESSAGE, { client, error: log });
    assert.equal(outcome.status, "failed");
    assert.ok(!lines[0].includes("jane.doe"));
  });

  it("warns once when Resend rejects the key, never printing it", async () => {
    const warn = recorder();
    const client = clientReturning({
      data: null,
      error: { name: "restricted_api_key", statusCode: 403, message: "nope" },
    } as SendResult);
    for (let i = 0; i < 3; i++) {
      await sendEmail("inbox-notification", MESSAGE, { client, warn: warn.log, error: () => {} });
    }
    assert.equal(warn.lines.length, 1);
    assert.match(warn.lines[0], /rejected the API key \(403 restricted_api_key\)/);
    assert.ok(!warn.lines[0].includes(KEY));
  });

  it("warns once when RESEND_API_KEY is missing", async () => {
    const warn = recorder();
    const errors = recorder();
    const first = await sendEmail("sla-breach", MESSAGE, { hasApiKey: false, warn: warn.log, error: errors.log });
    await sendEmail("sla-breach", MESSAGE, { hasApiKey: false, warn: warn.log, error: errors.log });
    assert.equal(first.status, "failed");
    assert.equal(warn.lines.length, 1);
    assert.match(warn.lines[0], /RESEND_API_KEY is not set/);
  });

  it("returns sent with the id", async () => {
    const outcome = await sendEmail("email-channel-reply", MESSAGE, {
      client: clientReturning({ data: { id: "em_1" }, error: null } as SendResult),
    });
    assert.deepEqual(outcome, { status: "sent", id: "em_1" });
  });

  it("magic link: logs a 401 redacted, warns once and rethrows clean", async () => {
    const warn = recorder();
    const errors = recorder();
    await assert.rejects(
      sendMagicLinkSafely(
        "jane.doe@example.com",
        () => {
          throw new Error(
            'Resend error: {"statusCode":401,"name":"invalid_api_key","message":"API key is invalid for jane.doe@example.com"}',
          );
        },
        { warn: warn.log, error: errors.log },
      ),
      (error: unknown) =>
        error instanceof MagicLinkSendFailedError && !String(error.message).includes("@"),
    );
    assert.equal(warn.lines.length, 1);
    assert.match(errors.lines[0], /template=magic-link to=j\*\*\*@example\.com error=invalid_api_key \(401\)/);
    assert.ok(!errors.lines[0].includes("jane.doe"));
    assert.equal(redactEmail("Jane <jane@x.test>"), "j***@x.test");
  });
});

describe("callers", () => {
  const senders = [
    "actions/forgot-password.ts",
    "actions/invite-workspace-member.ts",
    "lib/email-notifications.ts",
    "lib/channels/email/provider.ts",
  ];

  it("every send goes through sendEmail with emailFrom", () => {
    for (const file of senders) {
      const source = read(file);
      assert.ok(!/resend\.emails\.send|new Resend\(/.test(source), file);
      assert.match(source, /sendEmail\(/, file);
      assert.match(source, /emailFrom\(/, file);
    }
    const auth = read("auth.config.ts");
    assert.match(auth, /const MAGIC_LINK_FROM = emailFrom\(\);/);
    assert.match(auth, /sendMagicLinkSafely\(/);
  });

  it("forgot password gives the neutral answer in every branch and never says sent", () => {
    const action = read("actions/forgot-password.ts");
    assert.equal((action.match(/success: PASSWORD_RESET_NEUTRAL_MESSAGE/g) ?? []).length, 2);
    assert.ok(!/we sent|Failed to send/i.test(action));
    assert.ok(!/we sent/i.test(read("components/forms/forgot-password-form.tsx")));
    assert.ok(!/sent/i.test(PASSWORD_RESET_NEUTRAL_MESSAGE));
  });

  it("a failed invite email returns the link and the form shows it", () => {
    const action = read("actions/invite-workspace-member.ts");
    assert.match(action, /if \(sent\.status === "failed"\) \{[\s\S]*?emailStatus: "failed",\s*inviteUrl,/);
    const form = read("components/workspace/invite-member-form.tsx");
    assert.match(form, /result\.emailStatus === "failed" && result\.inviteUrl/);
    assert.match(form, /<InviteLinkNotice url=\{inviteLink\} \/>/);
  });
});

describe("no Resend test sender", () => {
  const SKIP_DIRS = new Set([
    "node_modules", ".git", ".next", ".contentlayer", "dist", "public", "coverage", ".turbo",
  ]);
  const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|md|mdx|json|ya?ml|html|css)$/;
  const needle = ["resend", "dev"].join(".");

  function* files(dir: string): Generator<string> {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) yield* files(path);
      else if (name === ".env.example" || (TEXT.test(name) && !/\.test\.tsx?$/.test(name) && !/lock/.test(name))) yield path;
    }
  }

  it("appears in no source, template, doc or config file", () => {
    const hits: string[] = [];
    for (const path of files(ROOT)) {
      if (readFileSync(path, "utf8").includes(needle)) hits.push(path.slice(ROOT.length + 1));
    }
    assert.deepEqual(hits, []);
  });
});
