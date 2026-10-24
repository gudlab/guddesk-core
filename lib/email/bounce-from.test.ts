import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { bounceFrom } from "./bounce-from";

describe("unverified-reply bounce sender", () => {
  it("uses RESEND_FROM, named or bare", () => {
    assert.equal(bounceFrom({ RESEND_FROM: "Acme Help <help@acme.test>" }), "Acme Help <help@acme.test>");
    assert.equal(bounceFrom({ RESEND_FROM: "help@acme.test" }), "GudDesk <help@acme.test>");
  });

  it("without a valid RESEND_FROM, noreply@ the app's own host", () => {
    assert.equal(bounceFrom({ NEXT_PUBLIC_APP_URL: "https://support.acme.test" }), "GudDesk <noreply@support.acme.test>");
    assert.equal(bounceFrom({ RESEND_FROM: "not an address", NEXT_PUBLIC_APP_URL: "https://support.acme.test" }), "GudDesk <noreply@support.acme.test>");
    assert.equal(bounceFrom({}), "GudDesk <noreply@localhost>");
  });

  it("the bounce never hardcodes a guddesk.com sender", () => {
    const notifications = readFileSync(join(__dirname, "..", "email-notifications.ts"), "utf8");
    const bounce = notifications.slice(notifications.indexOf("export async function sendUnverifiedReplyBounce"));
    assert.match(bounce, /from: bounceFrom\(\),/);
    assert.ok(!bounce.includes("guddesk.com"));
    assert.ok(!readFileSync(join(__dirname, "bounce-from.ts"), "utf8").includes("guddesk.com"));
  });
});
