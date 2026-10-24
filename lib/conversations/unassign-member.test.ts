import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { processUnassignedFor } from "@/lib/automations/unassigned";
import { createFakeWorld } from "@/lib/automations/fake-store.test-helper";
import { unassignMemberConversations } from "@/lib/conversations/unassign-member";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const MIN = 60 * 1000;

describe("removing a member unassigns their conversations with unassignedAt = now", () => {
  it("builds the update for a member and for a deleted user", () => {
    const now = new Date("2026-10-24T16:00:00Z");
    assert.deepEqual(unassignMemberConversations({ memberId: "m1" }, now), {
      where: { assigneeId: "m1" },
      data: { assigneeId: null, unassignedAt: now },
    });
    assert.deepEqual(unassignMemberConversations({ userId: "u1" }, now), {
      where: { assignee: { is: { userId: "u1" } } },
      data: { assigneeId: null, unassignedAt: now },
    });
  });

  it("refuses an empty id, which Prisma would read as no filter", () => {
    assert.throws(() => unassignMemberConversations({ memberId: "" }, new Date()));
    assert.throws(() => unassignMemberConversations({ userId: "" }, new Date()));
  });

  it("'unassigned for' counts from the removal, not from an older unassignedAt", async () => {
    const w = createFakeWorld();
    w.addRule({
      trigger: "CONVERSATION_UNASSIGNED_FOR",
      action: "ADD_TAG",
      actionConfig: { tag: "late" },
      conditions: { unassigned_minutes: 30 },
    });
    // Created unassigned, then assigned to m1 for two hours.
    const c = w.addConversation({ id: "c1" });
    c.assigneeId = "m1";
    w.advance(120 * MIN);

    // m1 is removed. Apply the same update the action runs.
    const { where, data } = unassignMemberConversations({ memberId: "m1" }, w.now());
    for (const conv of w.conversations.values()) {
      if (conv.assigneeId === where.assigneeId) Object.assign(conv, data);
    }
    assert.equal(c.unassignedAt?.getTime(), w.now().getTime());
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 0, "not early");
    w.advance(31 * MIN);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 1);
    assert.deepEqual(c.tags, ["late"]);
  });

  it("the remove-member action and the user delete route run it in the same transaction as the delete", () => {
    const action = read("actions/remove-workspace-member.ts");
    assert.match(
      action,
      /prisma\.\$transaction\(\[\s*prisma\.conversation\.updateMany\(unassignMemberConversations\(\{ memberId \}, new Date\(\)\)\),\s*prisma\.workspaceMember\.delete\(/,
    );
    const route = read("app/api/user/route.ts");
    assert.match(route, /if \(!currentUser\?\.id\)/);
    assert.match(
      route,
      /prisma\.\$transaction\(\[\s*prisma\.conversation\.updateMany\(\s*unassignMemberConversations\(\{ userId \}, new Date\(\)\),?\s*\),\s*prisma\.user\.delete\(/,
    );
  });
});
