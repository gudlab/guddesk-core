import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { MAX_DEPTH, runAutomationEvent } from "@/lib/automations/engine";
import { messageReceivedEvent, origin } from "@/lib/automations/events";
import { createFakeWorld } from "@/lib/automations/fake-store.test-helper";
import { changeConversationStatus } from "@/lib/conversations/status";

const WS = "ws_1";
const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const CSAT_ON = { isEnabled: true, questionText: "How did we do?", thankYouText: "Thanks!" };

function worldWithCloseRule() {
  const w = createFakeWorld();
  w.addConversation({ id: "c1" });
  const close = w.addRule({
    trigger: "MESSAGE_RECEIVED",
    name: "Close thanks",
    action: "CHANGE_STATUS",
    actionConfig: { status: "CLOSED" },
  });
  return { w, close };
}

const visitorMessage = (id = "m1") =>
  messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: id, body: "thanks", origin: origin("visitor") });

const surveys = (w: ReturnType<typeof createFakeWorld>) =>
  w.messages.filter((m) => m.type === "SYSTEM" && m.body.includes('"type":"csat_survey"'));

describe("automation close behaves like a manual close", () => {
  it("sends the CSAT survey when CSAT is enabled", async () => {
    const { w } = worldWithCloseRule();
    w.csat.set(WS, CSAT_ON);
    await runAutomationEvent(visitorMessage(), w.deps);

    assert.equal(w.conversations.get("c1")!.status, "CLOSED");
    assert.equal(surveys(w).length, 1);
    const survey = JSON.parse(surveys(w)[0].body);
    assert.equal(survey.question, "How did we do?");
    assert.ok(
      w.triggers.some(
        (t) =>
          t.channel === "private-visitor-c1" &&
          t.event === "message:created" &&
          String((t.data as { body: string }).body).includes("csat_survey"),
      ),
      "survey reaches the widget",
    );
  });

  it("sends no survey when CSAT is disabled or not set up, but still closes", async () => {
    for (const config of [{ ...CSAT_ON, isEnabled: false }, null]) {
      const { w } = worldWithCloseRule();
      if (config) w.csat.set(WS, config);
      await runAutomationEvent(visitorMessage(), w.deps);
      assert.equal(w.conversations.get("c1")!.status, "CLOSED");
      assert.equal(surveys(w).length, 0);
      assert.equal(w.webhooks.filter((h) => h.event === "conversation.closed").length, 1);
    }
  });

  it("fires the conversation.closed webhook, marked as an automation", async () => {
    const { w, close } = worldWithCloseRule();
    await runAutomationEvent(visitorMessage(), w.deps);
    const closed = w.webhooks.filter((h) => h.event === "conversation.closed");
    assert.equal(closed.length, 1);
    assert.deepEqual(closed[0], {
      workspaceId: WS,
      event: "conversation.closed",
      data: { conversationId: "c1", closedBy: null, closedByName: null, origin: "automation", ruleId: close.id },
    });
  });

  it("emits the same realtime events and SYSTEM message as the inbox close", async () => {
    const { w } = worldWithCloseRule();
    await runAutomationEvent(visitorMessage(), w.deps);
    assert.deepEqual(
      w.triggers.map((t) => [t.channel, t.event, t.data]),
      [
        ["private-workspace-ws_1", "conversation:updated", { conversationId: "c1", status: "CLOSED" }],
        ["private-conversation-c1", "conversation:updated", { status: "CLOSED" }],
      ],
    );
    assert.deepEqual(
      w.messages.map((m) => m.body),
      ['Conversation closed by automation rule "Close thanks"'],
    );
  });

  it("does the same steps as a manual close of the same conversation", async () => {
    const steps = async (actor: "agent" | "automation") => {
      const w = createFakeWorld();
      w.addConversation({ id: "c1" });
      w.csat.set(WS, CSAT_ON);
      await changeConversationStatus(
        {
          conversationId: "c1",
          workspaceId: WS,
          status: "CLOSED",
          actor:
            actor === "agent"
              ? { kind: "agent", userId: "u1", name: "Sam" }
              : { kind: "automation", ruleId: "r1", ruleName: "Rule" },
          at: w.now(),
        },
        w.statusDeps,
      );
      return {
        events: w.triggers.map((t) => `${t.channel} ${t.event}`),
        webhooks: w.webhooks.map((h) => h.event),
        surveys: surveys(w).length,
        status: w.conversations.get("c1")!.status,
      };
    };
    assert.deepEqual(await steps("automation"), await steps("agent"));
  });

  it("closing an already closed conversation repeats the close effects but fires no closed rules", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1", status: "CLOSED" });
    w.addRule({ trigger: "MESSAGE_RECEIVED", action: "CHANGE_STATUS", actionConfig: { status: "CLOSED" } });
    const onClosed = w.addRule({ trigger: "CONVERSATION_CLOSED", action: "ADD_TAG", actionConfig: { tag: "x" } });
    const outcomes = await runAutomationEvent(visitorMessage(), w.deps);
    assert.equal(outcomes.filter((o) => o.ruleId === onClosed.id).length, 0);
    assert.equal(w.webhooks.filter((h) => h.event === "conversation.closed").length, 1, "same as the inbox re-close");
  });

  it("sends one survey even if the conversation is closed, reopened and closed again", async () => {
    const { w } = worldWithCloseRule();
    w.csat.set(WS, CSAT_ON);
    await runAutomationEvent(visitorMessage("m1"), w.deps);
    w.conversations.get("c1")!.status = "OPEN";
    await runAutomationEvent(visitorMessage("m2"), w.deps);
    assert.equal(surveys(w).length, 1);
  });
});

describe("automation close and loop protection", () => {
  it("a close by an automation fires closed rules once, at depth 1 with the chain", async () => {
    const { w, close } = worldWithCloseRule();
    const onClosed = w.addRule({ trigger: "CONVERSATION_CLOSED", action: "ADD_TAG", actionConfig: { tag: "done" } });
    const outcomes = await runAutomationEvent(visitorMessage(), w.deps);
    const run = outcomes.filter((o) => o.ruleId === onClosed.id);
    assert.deepEqual(
      run.map((o) => [o.status, o.depth]),
      [["succeeded", 1]],
    );
    assert.equal(outcomes.filter((o) => o.ruleId === close.id && o.status === "succeeded").length, 1);
  });

  it("closed rules that reopen and close again stop at the guards", async () => {
    const { w } = worldWithCloseRule();
    // On close: reopen. On close: close again. Neither may loop.
    w.addRule({ trigger: "CONVERSATION_CLOSED", action: "CHANGE_STATUS", actionConfig: { status: "OPEN" }, order: 0 });
    const reclose = w.addRule({
      trigger: "CONVERSATION_CLOSED",
      action: "CHANGE_STATUS",
      actionConfig: { status: "CLOSED" },
      order: 1,
    });
    const outcomes = await runAutomationEvent(visitorMessage(), w.deps);
    for (const o of outcomes) assert.ok(o.depth < MAX_DEPTH);
    // reclose runs at depth 1, closes again, and its own closed event skips it through the chain.
    assert.ok(outcomes.some((o) => o.ruleId === reclose.id && o.status === "skipped" && o.reason === "chain"));
    assert.ok(outcomes.length < 10, `bounded: ${outcomes.length} outcomes`);
  });

  it("the shared close path never fires automations itself", () => {
    for (const file of ["lib/conversations/status.ts", "lib/conversations/status-prisma.ts"]) {
      const code = read(file)
        .split("\n")
        .filter((line) => !/^\s*(\*|\/\/|\/\*)/.test(line))
        .join("\n");
      assert.ok(!code.includes("fireAutomations"), file);
      assert.ok(!code.includes("@/lib/automations/"), file);
    }
  });

  it("the inbox close and the engine use the same close path", () => {
    const action = read("actions/update-conversation-status.ts");
    assert.match(action, /changeConversationStatus\(/);
    assert.match(action, /prismaStatusDeps\(\)/);
    assert.ok(!action.includes("triggerCsatSurvey"), "CSAT goes through the shared path");
    const dispatch = read("lib/automations/dispatch.ts");
    assert.match(dispatch, /changeStatus: \(input: StatusChangeInput\) => changeConversationStatus\(input, prismaStatusDeps\(\)\)/);
    const deps = read("lib/conversations/status-prisma.ts");
    assert.match(deps, /triggerCsatSurvey,/);
    assert.match(deps, /webhook: dispatchWebhooks,/);
  });
});
