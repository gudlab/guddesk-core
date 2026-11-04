import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { passwordResetBlocked, passwordResetBlockedMessage, resetSiteHost } from "./password-reset-notice";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("forgot-password where email is blocked", () => {
  it("returns the notice on Preview, Development and Vercel with no VERCEL_ENV", () => {
    for (const env of [
      { VERCEL: "1", VERCEL_ENV: "preview" },
      { VERCEL: "1", VERCEL_ENV: "development" },
      { VERCEL: "1" },
      { NODE_ENV: "development" },
    ]) {
      assert.deepEqual(passwordResetBlocked(env, "https://www.guddesk.com"), {
        blocked: passwordResetBlockedMessage("https://www.guddesk.com"),
      });
    }
  });

  it("returns null where email is sent", () => {
    assert.equal(passwordResetBlocked({ VERCEL: "1", VERCEL_ENV: "production" }), null);
    assert.equal(passwordResetBlocked({ NODE_ENV: "production" }), null);
    assert.equal(passwordResetBlocked({ NODE_ENV: "development", EMAIL_SEND_IN_DEV: "1" }), null);
  });

  it("says no email was sent, not 'check your email'", () => {
    const message = passwordResetBlockedMessage("https://www.guddesk.com");
    assert.match(message, /not sent on this environment/);
    assert.doesNotMatch(message, /check your email/i);
  });

  it("names the configured app URL's host, so self-hosters and forks see their own site", () => {
    assert.match(passwordResetBlockedMessage("https://www.guddesk.com"), /Reset your password on www\.guddesk\.com instead\./);
    assert.match(passwordResetBlockedMessage("https://support.example.com/"), /on support\.example\.com instead/);
    assert.match(passwordResetBlockedMessage("https://help.example.com:8443"), /on help\.example\.com:8443 instead/);
  });

  it("says 'your production site' when the app URL would point back here or is unset", () => {
    for (const url of [
      undefined,
      "",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://app.localhost",
      "https://preview.invalid",
      "not a url",
    ]) {
      assert.equal(resetSiteHost(url), null, String(url));
      assert.match(passwordResetBlockedMessage(url), /on your production site instead\./);
    }
  });

  it("no hardcoded guddesk.com in the notice", () => {
    assert.doesNotMatch(read("lib/password-reset-notice.ts"), /guddesk\.com/);
  });

  it("the action checks before the user lookup, so it can't reveal accounts", () => {
    const action = read("actions/forgot-password.ts");
    const check = action.indexOf("passwordResetBlocked()");
    assert.ok(check > 0);
    assert.ok(check < action.indexOf("findUserByEmail(prisma, normalizedEmail)"));
    assert.ok(check < action.indexOf("prisma.passwordResetToken"));
  });

  it("the form shows the notice instead of the 'Check your email' screen", () => {
    const form = read("components/forms/forgot-password-form.tsx");
    assert.match(form, /setBlockedNotice\(result\.blocked\)/);
    assert.match(form, /Email not sent on this environment/);
    assert.ok(form.indexOf("if (blockedNotice)") < form.indexOf("if (isSubmitted)"));
  });
});
