import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  loginErrorMessage,
  MAGIC_LINK_BLOCKED_ERROR,
  MAGIC_LINK_BLOCKED_MESSAGE,
  MAGIC_LINK_BLOCKED_REDIRECT,
  magicLinkSignInGate,
  MagicLinkNotSentError,
  sendMagicLink,
} from "./magic-link";

describe("sendMagicLink", () => {
  it("throws a sign-in error instead of reporting success when the gate skips it", async () => {
    let sent = false;
    await assert.rejects(
      sendMagicLink("jane@example.com", async () => {
        sent = true;
      }, { env: { VERCEL: "1", VERCEL_ENV: "preview" }, log: () => {} }),
      (error: unknown) => {
        assert.ok(error instanceof MagicLinkNotSentError);
        // kind "signIn" makes Auth.js redirect to /login, not "check your email".
        assert.equal((error as unknown as { kind: string }).kind, "signIn");
        return true;
      },
    );
    assert.equal(sent, false);
  });

  it("sends and resolves on production", async () => {
    let sent = false;
    await sendMagicLink("jane@example.com", async () => {
      sent = true;
    }, { env: { VERCEL: "1", VERCEL_ENV: "production" } });
    assert.equal(sent, true);
  });
});

describe("loginErrorMessage", () => {
  it("explains a skipped magic link where email is blocked", () => {
    assert.equal(loginErrorMessage("Configuration", false), MAGIC_LINK_BLOCKED_MESSAGE);
  });

  it("uses a general message where email is allowed, and nothing without an error", () => {
    assert.equal(loginErrorMessage("Configuration", true), "Sign-in failed. Please try again.");
    assert.match(loginErrorMessage("Verification", true) ?? "", /expired/);
    assert.equal(loginErrorMessage(undefined, false), null);
  });
});

describe("magicLinkSignInGate", () => {
  const blocked = { env: { VERCEL: "1", VERCEL_ENV: "preview" } };
  const verification = {
    email: { verificationRequest: true },
    user: { email: "jane@example.com" },
  };

  it("redirects to /login before Auth.js writes a token or sends, where email is blocked", () => {
    const lines: string[] = [];
    const result = magicLinkSignInGate(verification, { ...blocked, log: (l) => lines.push(l) });
    assert.equal(result, MAGIC_LINK_BLOCKED_REDIRECT);
    assert.equal(result, "/login?error=EmailBlocked");
    // Logged at info through the gate's own logger, redacted.
    assert.equal(lines.length, 1);
    assert.match(lines[0], /template=magic-link to=j\*\*\*@example\.com/);
    assert.ok(!lines[0].includes("jane@"));
  });

  it("lets the magic link through on production and self-host", () => {
    assert.equal(
      magicLinkSignInGate(verification, { env: { VERCEL: "1", VERCEL_ENV: "production" } }),
      true,
    );
    assert.equal(magicLinkSignInGate(verification, { env: { NODE_ENV: "production" } }), true);
  });

  it("never blocks password, Google, or the magic link callback itself", () => {
    assert.equal(magicLinkSignInGate({ user: { email: "jane@example.com" } }, blocked), true);
    assert.equal(
      magicLinkSignInGate({ email: { verificationRequest: false }, user: {} }, blocked),
      true,
    );
  });

  it("shows the blocked message for the new error code only where the gate is on", () => {
    assert.equal(loginErrorMessage(MAGIC_LINK_BLOCKED_ERROR, false), MAGIC_LINK_BLOCKED_MESSAGE);
    assert.equal(loginErrorMessage(MAGIC_LINK_BLOCKED_ERROR, true), "Sign-in failed. Please try again.");
  });
});

describe("auth.ts", () => {
  it("wires the gate into the signIn callback", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
    assert.match(src, /async signIn\(params\)\s*\{\s*return magicLinkSignInGate\(params\);/);
  });
});
