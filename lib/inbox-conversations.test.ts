import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INBOX_LIST_DEFAULT_LIMIT,
  INBOX_LIST_MAX_LIMIT,
  INBOX_LIST_P95_BUDGET_MS,
  inboxConversationListLimit,
  inboxConversationListSelect,
  inboxConversationListWhere,
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

  it("selects list fields only (no message count, no unused columns)", () => {
    assert.equal("id" in inboxConversationListSelect, true);
    assert.equal("visitor" in inboxConversationListSelect, true);
    assert.equal("_count" in inboxConversationListSelect, false);
    assert.equal("assignee" in inboxConversationListSelect, false);
    assert.equal("aiSummary" in inboxConversationListSelect, false);
    assert.equal("metadata" in inboxConversationListSelect, false);
  });
});
