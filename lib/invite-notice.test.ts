import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INVITE_FAILED_MESSAGE,
  INVITE_SENT_MESSAGE,
  INVITE_SKIPPED_MESSAGE,
  INVITE_UNSENT_NO_LINK_MESSAGE,
  inviteNotice,
} from "./invite-notice";

const URL = "https://guddesk-git-x.vercel.app/invitation?token=abc";

describe("inviteNotice", () => {
  it("does not say the invitation was sent when the gate skipped the email", () => {
    const notice = inviteNotice({ emailStatus: "skipped", inviteUrl: URL });
    assert.deepEqual(notice, { kind: "link", message: INVITE_SKIPPED_MESSAGE, inviteUrl: URL });
    assert.doesNotMatch(notice.message, /sent successfully/i);
  });

  it("shows the link when the email failed", () => {
    assert.deepEqual(inviteNotice({ emailStatus: "failed", inviteUrl: URL }), {
      kind: "link",
      message: INVITE_FAILED_MESSAGE,
      inviteUrl: URL,
    });
  });

  it("says sent only when the email went out", () => {
    assert.deepEqual(inviteNotice({ emailStatus: "sent" }), { kind: "sent", message: INVITE_SENT_MESSAGE });
    assert.deepEqual(inviteNotice({}), { kind: "sent", message: INVITE_SENT_MESSAGE });
  });

  it("never says sent for a skipped or failed email without a link", () => {
    for (const emailStatus of ["skipped", "failed"] as const) {
      const notice = inviteNotice({ emailStatus });
      assert.deepEqual(notice, { kind: "unsent", message: INVITE_UNSENT_NO_LINK_MESSAGE });
      assert.notEqual(notice.message, INVITE_SENT_MESSAGE);
      assert.doesNotMatch(notice.message, /invitation sent/i);
    }
  });
});
