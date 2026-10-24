import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/** Each call site from eng/automation-design.md and the builder it uses. */
const SITES: [file: string, builders: string[]][] = [
  ["app/api/widget/conversations/route.ts", ["conversationCreatedEvents("]],
  ["lib/channels/email/provider.ts", ["conversationCreatedEvents(", "messageReceivedEvent("]],
  ["app/api/v1/conversations/route.ts", ["conversationCreatedEvents("]],
  ["app/api/widget/conversations/[conversationId]/messages/route.ts", ["messageReceivedEvent("]],
  ["actions/update-conversation-status.ts", ["conversationClosedEvent("]],
  ["actions/bulk-conversation-actions.ts", ["bulkClosedEvents("]],
  ["app/api/v1/conversations/[conversationId]/route.ts", ["conversationUpdateEvents("]],
  ["lib/mcp/tools/conversations.ts", ["conversationUpdateEvents(", "conversationClosedEvent("]],
  ["actions/tag-conversation.ts", ["tagAddedEvents("]],
  ["actions/ai/categorize-conversation.ts", ["tagAddedEvents("]],
];

/** Agent, BOT and note messages never fire "message received". */
const NO_FIRE = [
  "actions/send-message.ts",
  "app/api/agent/reply/route.ts",
  "app/api/v1/conversations/[conversationId]/messages/route.ts",
  "lib/mcp/tools/messages.ts",
  "actions/manage-side-conversation.ts",
];

/** Places that clear the assignee also start the "unassigned for" clock. */
const UNASSIGN = [
  "actions/assign-conversation.ts",
  "actions/bulk-conversation-actions.ts",
  "app/api/v1/conversations/[conversationId]/route.ts",
  "lib/mcp/tools/conversations.ts",
];

describe("automation call sites", () => {
  for (const [file, builders] of SITES) {
    it(`${file} calls fireAutomations`, () => {
      const src = read(file);
      assert.match(src, /import \{ fireAutomations \} from "@\/lib\/automations\/dispatch";/);
      assert.ok(src.includes("fireAutomations("), "calls fireAutomations");
      for (const builder of builders) assert.ok(src.includes(builder), `uses ${builder}`);
    });
  }

  for (const file of NO_FIRE) {
    it(`${file} does not fire automations`, () => {
      assert.ok(!read(file).includes("fireAutomations"));
    });
  }

  for (const file of UNASSIGN) {
    it(`${file} sets unassignedAt when it clears the assignee`, () => {
      assert.ok(read(file).includes("unassignedAt"));
    });
  }

  it("the scheduler runs the automations job next to the SLA check", () => {
    const jobs = read("lib/scheduled/index.ts");
    assert.match(jobs, /name: "automations", run: \(workspaceId\) => runUnassignedAutomations\(workspaceId\)/);
    const route = read("app/api/cron/automations/route.ts");
    assert.match(route, /export const GET = withCronAuth\(run\);/);
    assert.match(route, /export const POST = withCronAuth\(run\);/);
  });

  it("the migration only adds", () => {
    const sql = read("prisma/migrations/0003_automation_runs/migration.sql");
    assert.ok(!/\b(DROP|RENAME|ALTER COLUMN|TRUNCATE|DELETE|UPDATE)\b/i.test(sql.replace(/ON (DELETE|UPDATE) CASCADE/g, "")));
    assert.match(sql, /CREATE TABLE "automation_runs"/);
    assert.match(sql, /ADD COLUMN\s+"unassignedAt" TIMESTAMP\(3\);/);
    assert.match(sql, /CREATE UNIQUE INDEX "automation_runs_ruleId_eventKey_key"/);
  });
});
