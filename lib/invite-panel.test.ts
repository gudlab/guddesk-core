import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { InvitePanel } from "../components/workspace/invite-panel";
import { INVITE_SKIPPED_MESSAGE } from "./invite-notice";

const URL_ = "https://preview.example.test/invitation?token=tok_123";
const notice = { message: INVITE_SKIPPED_MESSAGE, inviteUrl: URL_ };
const form = createElement("form", { "data-testid": "invite-form" });

function render(props: {
  seatLimit: { used: number; max: number } | null;
  linkNotice: typeof notice | null;
}) {
  return renderToStaticMarkup(
    createElement(InvitePanel, {
      workspaceId: "ws_1",
      canUpgrade: true,
      form,
      ...props,
    }),
  );
}

describe("InvitePanel", () => {
  it("keeps the invite link when that invite filled the last seat (FREE: owner + 1 invite)", () => {
    const html = render({ seatLimit: { used: 2, max: 2 }, linkNotice: notice });
    assert.ok(html.includes(URL_), "link is shown");
    assert.ok(html.includes("Copy link"));
    assert.ok(html.includes(INVITE_SKIPPED_MESSAGE));
    // The seat-limit notice replaces the form.
    assert.ok(html.includes("Upgrade to Pro"));
    assert.ok(!html.includes("invite-form"));
  });

  it("shows the form and the link while a seat is still free", () => {
    const html = render({ seatLimit: null, linkNotice: notice });
    assert.ok(html.includes("invite-form"));
    assert.ok(html.includes(URL_));
  });

  it("shows no link when there is none", () => {
    const html = render({ seatLimit: { used: 2, max: 2 }, linkNotice: null });
    assert.ok(!html.includes("Copy link"));
    assert.ok(!html.includes("invitation?token="));
  });
});

describe("InviteMemberForm", () => {
  const src = readFileSync(
    new URL("../components/workspace/invite-member-form.tsx", import.meta.url),
    "utf8",
  );

  it("has no early return on the seat limit, so its link state is rendered in both states", () => {
    assert.doesNotMatch(src, /if\s*\(\s*seatLimit\s*\)\s*\{?\s*return/);
    assert.match(src, /<InvitePanel[\s\S]*linkNotice=\{linkNotice\}/);
  });
});

describe("members page", () => {
  it("never puts invitation tokens in the page props", () => {
    const page = readFileSync(
      new URL(
        "../app/(protected)/workspace/[workspaceSlug]/settings/members/page.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    assert.doesNotMatch(page, /token/);
  });
});
