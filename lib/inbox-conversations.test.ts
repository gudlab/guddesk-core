import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  INBOX_LIST_DEFAULT_LIMIT,
  INBOX_LIST_MAX_LIMIT,
  INBOX_LIST_P95_BUDGET_MS,
  inboxConversationListLimit,
  inboxConversationListSelect,
  inboxConversationListWhere,
  inboxListAuthz,
} from "./inbox-conversations";

describe("inbox conversation list helpers", () => {
  it("keeps the p95 budget at 300ms", () => {
    assert.equal(INBOX_LIST_P95_BUDGET_MS, 300);
  });

  it("builds a workspace+status+assignee where clause", () => {
    assert.deepEqual(
      inboxConversationListWhere("ws_1", "OPEN", "mem_1"),
      { workspaceId: "ws_1", status: "OPEN", assigneeId: "mem_1" },
    );
    assert.deepEqual(inboxConversationListWhere("ws_1", null, null), {
      workspaceId: "ws_1",
    });
  });

  it("clamps the page size", () => {
    assert.equal(inboxConversationListLimit(null), INBOX_LIST_DEFAULT_LIMIT);
    assert.equal(inboxConversationListLimit("0"), INBOX_LIST_DEFAULT_LIMIT);
    assert.equal(inboxConversationListLimit("10"), 10);
    assert.equal(inboxConversationListLimit("999"), INBOX_LIST_MAX_LIMIT);
  });

  it("denies a signed-in user who is not a member of the requested workspace", () => {
    assert.deepEqual(inboxListAuthz("user_a", "ws_b", false), {
      ok: false,
      status: 403,
      error: "Not a member of this workspace",
    });
    assert.deepEqual(inboxListAuthz("user_a", "ws_a", true), {
      ok: true,
      workspaceId: "ws_a",
      userId: "user_a",
    });
    assert.deepEqual(inboxListAuthz(undefined, "ws_a", false), {
      ok: false,
      status: 401,
      error: "Unauthorized",
    });
    assert.deepEqual(inboxListAuthz("user_a", null, true), {
      ok: false,
      status: 400,
      error: "workspaceId required",
    });
  });

  it("the list route applies inboxListAuthz before loading conversations", () => {
    const src = readFileSync(
      join(process.cwd(), "app/api/inbox/conversations/route.ts"),
      "utf8",
    );
    assert.match(src, /inboxListAuthz/);
    assert.ok(src.indexOf("inboxListAuthz") < src.indexOf("prisma.conversation.findMany"));
  });

  it("selects list fields only (no message count, no unused columns)", () => {
    assert.equal("id" in inboxConversationListSelect, true);
    assert.equal("visitor" in inboxConversationListSelect, true);
    assert.equal("_count" in inboxConversationListSelect, false);
    assert.equal("assignee" in inboxConversationListSelect, false);
    assert.equal("aiSummary" in inboxConversationListSelect, false);
    assert.equal("metadata" in inboxConversationListSelect, false);
  });
});
