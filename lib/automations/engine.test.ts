import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { matchesConditions } from "@/lib/automations/conditions";
import {
  CONVERSATION_CAP,
  MAX_DEPTH,
  runAutomationEvent,
  scheduleAutomationEvents,
  type RunOutcome,
} from "@/lib/automations/engine";
import {
  bulkClosedEvents,
  conversationClosedEvent,
  conversationCreatedEvents,
  conversationUpdateEvents,
  messageReceivedEvent,
  origin,
  tagAddedEvents,
  type AutomationEvent,
} from "@/lib/automations/events";
import { createFakeWorld } from "@/lib/automations/fake-store.test-helper";
import { processUnassignedFor } from "@/lib/automations/unassigned";

const WS = "ws_1";

async function runAll(events: AutomationEvent[], world: ReturnType<typeof createFakeWorld>) {
  const outcomes: RunOutcome[] = [];
  for (const event of events) outcomes.push(...(await runAutomationEvent(event, world.deps)));
  return outcomes;
}

const ran = (outcomes: { status: string; ruleId: string }[], ruleId: string) =>
  outcomes.filter((o) => o.status === "succeeded" && o.ruleId === ruleId).length;

describe("trigger: conversation created", () => {
  for (const source of ["widget", "email", "v1"] as const) {
    it(`fires for a new ${source} conversation, before "message received" for its first message`, async () => {
      const w = createFakeWorld();
      w.addConversation({ id: "c1" });
      const created = w.addRule({ trigger: "CONVERSATION_CREATED", action: "ADD_TAG", actionConfig: { tag: "new" } });
      const received = w.addRule({
        trigger: "MESSAGE_RECEIVED",
        action: "ADD_TAG",
        actionConfig: { tag: "seen" },
      });
      const events = conversationCreatedEvents({
        workspaceId: WS,
        conversationId: "c1",
        firstMessage: { id: "m1", body: "hello" },
        origin: origin(source === "v1" ? "api" : "visitor"),
      });
      assert.deepEqual(
        events.map((e) => e.trigger),
        ["CONVERSATION_CREATED", "MESSAGE_RECEIVED"],
      );
      const outcomes = await runAll(events, w);
      assert.equal(ran(outcomes, created.id), 1);
      assert.equal(ran(outcomes, received.id), 1);
      assert.deepEqual(w.conversations.get("c1")!.tags, ["new", "seen"]);
    });
  }

  it("has no first-message event when the conversation has no message", () => {
    const events = conversationCreatedEvents({
      workspaceId: WS,
      conversationId: "c1",
      firstMessage: null,
      origin: origin("api"),
    });
    assert.deepEqual(
      events.map((e) => e.trigger),
      ["CONVERSATION_CREATED"],
    );
  });
});

describe("trigger: message received", () => {
  for (const source of ["widget", "email"] as const) {
    it(`fires for a ${source} visitor message and checks message conditions`, async () => {
      const w = createFakeWorld();
      w.addConversation({ id: "c1" });
      const refund = w.addRule({
        trigger: "MESSAGE_RECEIVED",
        action: "ADD_TAG",
        actionConfig: { tag: "billing" },
        conditions: { message_contains: "REFUND" },
      });
      const other = w.addRule({
        trigger: "MESSAGE_RECEIVED",
        action: "ADD_TAG",
        actionConfig: { tag: "x" },
        conditions: { message_contains: "shipping" },
      });
      const outcomes = await runAutomationEvent(
        messageReceivedEvent({
          workspaceId: WS,
          conversationId: "c1",
          messageId: `m-${source}`,
          body: "I want a refund please",
          origin: origin("visitor"),
        }),
        w.deps,
      );
      assert.equal(ran(outcomes, refund.id), 1);
      assert.equal(ran(outcomes, other.id), 0);
    });
  }

  it("is never fired by an automation's own BOT message (SEND_MESSAGE)", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.addRule({ trigger: "CONVERSATION_CREATED", action: "SEND_MESSAGE", actionConfig: { message: "Hi there" } });
    const echo = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "SEND_MESSAGE", actionConfig: { message: "Echo" } });
    const outcomes = await runAll(
      conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }),
      w,
    );
    assert.equal(ran(outcomes, echo.id), 0);
    assert.deepEqual(
      w.messages.filter((m) => m.type === "BOT").map((m) => m.body),
      ["Hi there"],
    );
  });
});

describe("trigger: conversation closed", () => {
  it("fires only on a change into CLOSED", async () => {
    const at = new Date("2026-10-24T12:00:00Z");
    const base = { workspaceId: WS, conversationId: "c1", origin: origin("api") };
    const close = (from: string, to: string) =>
      conversationUpdateEvents({
        ...base,
        before: { status: from, tags: [] },
        after: { status: to, tags: [], closedAt: to === "CLOSED" ? at : null, updatedAt: at },
      }).filter((e) => e.trigger === "CONVERSATION_CLOSED").length;
    assert.equal(close("OPEN", "CLOSED"), 1);
    assert.equal(close("SNOOZED", "CLOSED"), 1);
    assert.equal(close("CLOSED", "CLOSED"), 0);
    assert.equal(close("CLOSED", "OPEN"), 0);
    assert.equal(close("OPEN", "SNOOZED"), 0);

    const w = createFakeWorld();
    w.addConversation({ id: "c1", status: "CLOSED" });
    const rule = w.addRule({ trigger: "CONVERSATION_CLOSED", action: "ADD_TAG", actionConfig: { tag: "done" } });
    const outcomes = await runAutomationEvent(conversationClosedEvent({ ...base, closedAt: at }), w.deps);
    assert.equal(ran(outcomes, rule.id), 1);
  });

  it("fires once per conversation in a bulk close, skipping ones already closed", () => {
    const events = bulkClosedEvents({
      workspaceId: WS,
      conversations: [
        { id: "a", status: "OPEN" },
        { id: "b", status: "CLOSED" },
        { id: "c", status: "SNOOZED" },
        { id: "a", status: "OPEN" },
      ],
      closedAt: new Date(),
      origin: origin("agent"),
    });
    assert.deepEqual(
      events.map((e) => e.conversationId),
      ["a", "c"],
    );
  });

  it("CHANGE_STATUS to CLOSED raises its own closed event", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.addRule({ trigger: "MESSAGE_RECEIVED", action: "CHANGE_STATUS", actionConfig: { status: "CLOSED" } });
    const onClose = w.addRule({ trigger: "CONVERSATION_CLOSED", action: "ADD_TAG", actionConfig: { tag: "auto" } });
    const outcomes = await runAutomationEvent(
      messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "x", origin: origin("visitor") }),
      w.deps,
    );
    assert.equal(ran(outcomes, onClose.id), 1);
    assert.equal(w.conversations.get("c1")!.status, "CLOSED");
  });
});

describe("trigger: tag added", () => {
  it("fires once per new tag, not for a tag already present", async () => {
    const at = new Date("2026-10-24T12:00:00Z");
    const events = tagAddedEvents({
      workspaceId: WS,
      conversationId: "c1",
      before: ["bug"],
      after: ["bug", "urgent", "vip", "urgent"],
      at,
      origin: origin("agent"),
    });
    assert.deepEqual(
      events.map((e) => e.addedTag),
      ["urgent", "vip"],
    );

    const w = createFakeWorld();
    w.addConversation({ id: "c1", tags: ["bug", "urgent", "vip"] });
    const rule = w.addRule({
      trigger: "TAG_ADDED",
      action: "SEND_MESSAGE",
      actionConfig: { message: "We are on it" },
      conditions: { tags_contain: "urgent" },
    });
    const outcomes = await runAll(events, w);
    assert.equal(ran(outcomes, rule.id), 2);
  });

  it("ADD_TAG fires tag added only when the tag was missing", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1", tags: ["vip"] });
    w.addRule({ trigger: "CONVERSATION_CREATED", action: "ADD_TAG", actionConfig: { tag: "vip" } });
    const onTag = w.addRule({ trigger: "TAG_ADDED", action: "ADD_TAG", actionConfig: { tag: "other" } });
    const outcomes = await runAll(
      conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }),
      w,
    );
    assert.equal(ran(outcomes, onTag.id), 0);
  });
});

describe("trigger: unassigned for", () => {
  it("fires once, and again only after being assigned and unassigned", async () => {
    const w = createFakeWorld();
    const c = w.addConversation({ id: "c1" });
    const rule = w.addRule({
      trigger: "CONVERSATION_UNASSIGNED_FOR",
      action: "ADD_TAG",
      actionConfig: { tag: "waiting" },
      conditions: { unassigned_minutes: 30 },
    });

    w.advance(29 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 0, "not yet");

    w.advance(2 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 1);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 0, "only once");
    assert.equal(w.rules.find((r) => r.id === rule.id)!.triggerCount, 1);

    // Assigned: no run while it has an assignee.
    c.assigneeId = "m1";
    w.advance(60 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 0);

    // Unassigned again: the clock restarts.
    c.assigneeId = null;
    c.unassignedAt = w.now();
    w.advance(10 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 0);
    w.advance(21 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps)).succeeded, 1);
  });

  it("skips closed conversations and rules without minutes, and can run for one workspace", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "closed", status: "CLOSED" });
    w.addConversation({ id: "other", workspaceId: "ws_2" });
    w.addRule({ trigger: "CONVERSATION_UNASSIGNED_FOR", action: "ADD_TAG", actionConfig: { tag: "t" } });
    w.addRule({
      trigger: "CONVERSATION_UNASSIGNED_FOR",
      workspaceId: "ws_2",
      action: "ADD_TAG",
      actionConfig: { tag: "t" },
      conditions: { unassigned_minutes: 5 },
    });
    w.advance(60 * 60 * 1000);
    assert.equal((await processUnassignedFor(w.deps, WS)).succeeded, 0);
    assert.equal((await processUnassignedFor(w.deps, "ws_2")).succeeded, 1);
  });
});

describe("loop protection", () => {
  it(`an ADD_TAG chain stops at depth ${MAX_DEPTH}`, async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    // a -> b -> c -> d -> e, each rule adds the next tag.
    const tags = ["a", "b", "c", "d", "e"];
    const rules = tags.slice(0, -1).map((tag, i) =>
      w.addRule({
        trigger: "TAG_ADDED",
        action: "ADD_TAG",
        actionConfig: { tag: tags[i + 1] },
        conditions: { tags_contain: tag, tags_not_contain: tags[i + 1] },
        order: i,
      }),
    );
    w.conversations.get("c1")!.tags = ["a"];
    const outcomes = await runAll(
      tagAddedEvents({ workspaceId: WS, conversationId: "c1", before: [], after: ["a"], at: w.now(), origin: origin("agent") }),
      w,
    );
    const succeeded = outcomes.filter((o) => o.status === "succeeded");
    assert.equal(succeeded.length, MAX_DEPTH);
    assert.deepEqual(
      succeeded.map((o) => o.depth),
      [0, 1, 2],
    );
    assert.equal(ran(outcomes, rules[3].id), 0);
    assert.deepEqual(w.conversations.get("c1")!.tags, ["a", "b", "c", "d"]);
    assert.ok(w.logs.some((l) => l.includes("depth 3")));
  });

  it("A/B tag ping-pong stops through the rule chain", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    // A adds "x" and B adds "y" on any tag added. Each tag they add raises
    // a new event; the chain stops a rule from running again on an event
    // that its own action caused.
    const a = w.addRule({ id: "A", trigger: "TAG_ADDED", action: "ADD_TAG", actionConfig: { tag: "x" }, order: 0 });
    const b = w.addRule({ id: "B", trigger: "TAG_ADDED", action: "ADD_TAG", actionConfig: { tag: "y" }, order: 1 });
    w.conversations.get("c1")!.tags = ["start"];
    const outcomes = await runAll(
      tagAddedEvents({
        workspaceId: WS,
        conversationId: "c1",
        before: [],
        after: ["start"],
        at: w.now(),
        origin: origin("agent"),
      }),
      w,
    );
    const chainSkips = outcomes.filter((o) => o.status === "skipped" && o.reason === "chain");
    assert.deepEqual(
      chainSkips.map((o) => o.ruleId).sort(),
      [a.id, b.id],
    );
    // A rule never runs inside a chain it started.
    for (const o of outcomes) assert.ok(o.depth < MAX_DEPTH);
    assert.equal(ran(outcomes, a.id), 2);
    assert.equal(ran(outcomes, b.id), 2);
  });

  it(`the per-conversation cap skips run ${CONVERSATION_CAP + 1} within an hour`, async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    const rule = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "ADD_TAG", actionConfig: { tag: "t" } });
    const send = (n: number) =>
      runAutomationEvent(
        messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: `m${n}`, body: "x", origin: origin("visitor") }),
        w.deps,
      );
    for (let n = 1; n <= CONVERSATION_CAP; n++) {
      assert.equal(ran(await send(n), rule.id), 1, `run ${n}`);
      w.advance(60 * 1000);
    }
    const capped = await send(CONVERSATION_CAP + 1);
    assert.deepEqual(
      capped.map((o) => (o.status === "skipped" ? o.reason : o.status)),
      ["rate_cap"],
    );
    assert.equal(w.logs.filter((l) => l.includes("skipped: rate_cap")).length, 1);

    w.advance(60 * 60 * 1000);
    assert.equal(ran(await send(CONVERSATION_CAP + 2), rule.id), 1, "allowed again after an hour");
  });
});

describe("idempotency", () => {
  const event = () =>
    messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "x", origin: origin("visitor") });

  it("the same event delivered twice gives one run and one action", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.addRule({ trigger: "MESSAGE_RECEIVED", action: "SEND_MESSAGE", actionConfig: { message: "Thanks" } });
    await runAutomationEvent(event(), w.deps);
    const second = await runAutomationEvent(event(), w.deps);
    assert.equal(w.runs.length, 1);
    assert.equal(w.calls.addBotMessage, 1);
    assert.deepEqual(
      second.map((o) => (o.status === "skipped" ? o.reason : o.status)),
      ["duplicate"],
    );
  });

  it("two concurrent deliveries give one run", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.addRule({ trigger: "MESSAGE_RECEIVED", action: "SEND_MESSAGE", actionConfig: { message: "Thanks" } });
    await Promise.all([runAutomationEvent(event(), w.deps), runAutomationEvent(event(), w.deps)]);
    assert.equal(w.runs.length, 1);
    assert.equal(w.calls.addBotMessage, 1);
  });
});

describe("failure isolation", () => {
  it("rule 1 throws, rule 2 still runs, and the failure is stored without details", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.members.set("m1", WS);
    w.failures.set("assign", new Error("connection lost to ada@example.com"));
    const first = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "ASSIGN_TO", actionConfig: { assigneeId: "m1" }, order: 0 });
    const second = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "ADD_TAG", actionConfig: { tag: "t" }, order: 1 });
    const outcomes = await runAutomationEvent(
      messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "x", origin: origin("visitor") }),
      w.deps,
    );
    assert.equal(outcomes.find((o) => o.ruleId === first.id)!.status, "failed");
    assert.equal(ran(outcomes, second.id), 1);
    const failedRun = w.runs.find((r) => r.ruleId === first.id)!;
    assert.equal(failedRun.status, "failed");
    assert.equal(failedRun.error, "Error");
    assert.equal(w.rules.find((r) => r.id === first.id)!.triggerCount, 0, "only successes count");
  });

  it("the caller returns normally when a scheduled run throws", async () => {
    const tasks: (() => Promise<void>)[] = [];
    const logged: string[] = [];
    function handler() {
      scheduleAutomationEvents(
        conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }),
        {
          after: (task) => tasks.push(task),
          run: async () => {
            throw new Error("db down");
          },
          log: (m) => logged.push(m),
        },
      );
      return { status: 200 };
    }
    assert.deepEqual(handler(), { status: 200 });
    assert.equal(tasks.length, 1, "deferred with after()");
    await tasks[0]();
    assert.equal(logged.length, 1);

    // after() itself throwing (outside a request) is caught too.
    assert.doesNotThrow(() =>
      scheduleAutomationEvents([conversationClosedEvent({ workspaceId: WS, conversationId: "c1", closedAt: new Date(), origin: origin("api") })], {
        after: () => {
          throw new Error("after() outside a request");
        },
        run: async () => undefined,
        log: () => undefined,
      }),
    );
  });

  it("a Slack timeout marks the run failed and later rules still run", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.slack.set(WS, "https://hooks.slack.test/x");
    w.deps.timeoutMs = 20;
    w.setPostSlack(
      (_url, _text, signal) =>
        new Promise((_resolve, reject) => {
          // AbortSignal.timeout() doesn't keep the event loop alive, so a
          // hanging request needs a timer of its own here (fetch has one).
          const hang = setTimeout(() => undefined, 5000);
          signal.addEventListener("abort", () => {
            clearTimeout(hang);
            reject(signal.reason);
          });
        }),
    );
    const slack = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "NOTIFY_SLACK", actionConfig: { message: "New" }, order: 0 });
    const later = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "ADD_TAG", actionConfig: { tag: "t" }, order: 1 });
    const outcomes = await runAutomationEvent(
      messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "secret text", origin: origin("visitor") }),
      w.deps,
    );
    assert.deepEqual(outcomes.find((o) => o.ruleId === slack.id), {
      ruleId: slack.id,
      eventKey: "message:m1",
      depth: 0,
      status: "failed",
      error: "timeout",
    });
    assert.equal(w.runs.find((r) => r.ruleId === slack.id)!.error, "timeout");
    assert.equal(ran(outcomes, later.id), 1);
  });

  it("Slack text has the rule's message and the visitor name, not the message body", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1", visitorName: null });
    w.slack.set(WS, "https://hooks.slack.test/x");
    const texts: string[] = [];
    w.setPostSlack(async (_url, text) => {
      texts.push(text);
    });
    w.addRule({ trigger: "MESSAGE_RECEIVED", name: "VIP", action: "NOTIFY_SLACK", actionConfig: { message: "VIP wrote in" } });
    await runAutomationEvent(
      messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "my card number", origin: origin("visitor") }),
      w.deps,
    );
    assert.deepEqual(texts, ['Automation "VIP": VIP wrote in (conversation with a visitor)']);
  });
});

describe("side effects", () => {
  it("a canned response resolves inside its own workspace only", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.canned.set("cr_own", { workspaceId: WS, body: "Canned hello" });
    w.canned.set("cr_other", { workspaceId: "ws_2", body: "Other workspace text" });
    const own = w.addRule({ trigger: "MESSAGE_RECEIVED", action: "SEND_MESSAGE", actionConfig: { cannedResponseId: "cr_own" } });
    const other = w.addRule({
      trigger: "MESSAGE_RECEIVED",
      action: "SEND_MESSAGE",
      actionConfig: { cannedResponseId: "cr_other" },
    });
    const fallback = w.addRule({
      trigger: "MESSAGE_RECEIVED",
      action: "SEND_MESSAGE",
      actionConfig: { cannedResponseId: "cr_other", message: "Fallback text" },
    });
    const outcomes = await runAutomationEvent(
      messageReceivedEvent({ workspaceId: WS, conversationId: "c1", messageId: "m1", body: "x", origin: origin("visitor") }),
      w.deps,
    );
    assert.equal(ran(outcomes, own.id), 1);
    assert.equal(outcomes.find((o) => o.ruleId === other.id)!.status, "failed");
    assert.equal(ran(outcomes, fallback.id), 1);
    assert.deepEqual(
      w.messages.filter((m) => m.type === "BOT").map((m) => m.body),
      ["Canned hello", "Fallback text"],
    );
  });

  it("the BOT message reaches the visitor channel with its payload, and the webhook says origin automation", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.addRule({ trigger: "CONVERSATION_CREATED", action: "SEND_MESSAGE", actionConfig: { message: "Welcome" } });
    await runAll(conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }), w);

    const visitor = w.triggers.find((t) => t.channel === "private-visitor-c1");
    assert.ok(visitor, "sent to the widget");
    assert.equal(visitor.event, "message:created");
    assert.equal((visitor.data as { body: string }).body, "Welcome");
    assert.equal((visitor.data as { type: string }).type, "BOT");
    assert.ok(w.triggers.some((t) => t.channel === "private-conversation-c1" && t.event === "message:created"));

    assert.equal(w.webhooks.length, 1);
    assert.equal(w.webhooks[0].event, "message.created");
    assert.equal(w.webhooks[0].data.origin, "automation");
  });

  it("ASSIGN_TO refuses a member from another workspace", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    w.members.set("m_other", "ws_2");
    const rule = w.addRule({ trigger: "CONVERSATION_CREATED", action: "ASSIGN_TO", actionConfig: { assigneeId: "m_other" } });
    const outcomes = await runAll(conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }), w);
    assert.equal(outcomes.find((o) => o.ruleId === rule.id)!.status, "failed");
    assert.equal(w.conversations.get("c1")!.assigneeId, null);
  });
});

describe("ordering and conditions", () => {
  it("runs rules by order, then createdAt, against the event snapshot", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    const second = w.addRule({ trigger: "CONVERSATION_CREATED", action: "ADD_TAG", actionConfig: { tag: "two" }, order: 1 });
    const first = w.addRule({ trigger: "CONVERSATION_CREATED", action: "ADD_TAG", actionConfig: { tag: "one" }, order: 0 });
    // Matches only if it saw "one", which an earlier rule added during this
    // event, so it must not match.
    const sawOne = w.addRule({
      trigger: "CONVERSATION_CREATED",
      action: "ADD_TAG",
      actionConfig: { tag: "three" },
      conditions: { tags_contain: "one" },
      order: 2,
    });
    const outcomes = await runAll(
      conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }),
      w,
    );
    assert.deepEqual(
      outcomes.filter((o) => o.depth === 0).map((o) => o.ruleId),
      [first.id, second.id],
    );
    assert.equal(ran(outcomes, sawOne.id), 0);
  });

  it("a set condition with nothing to compare does not match", () => {
    const ctx = { tags: ["a"], status: "OPEN", visitorEmail: null, messageBody: null };
    assert.equal(matchesConditions({ message_contains: "x" }, ctx), false);
    assert.equal(matchesConditions({ visitor_email_contains: "@acme" }, ctx), false);
    assert.equal(matchesConditions({ status: "CLOSED" }, ctx), false);
    assert.equal(matchesConditions({ tags_contain: "a", unassigned_minutes: 30 }, ctx), true);
    assert.equal(matchesConditions(null, ctx), true);
  });

  it("ignores rules from another workspace and disabled rules", async () => {
    const w = createFakeWorld();
    w.addConversation({ id: "c1" });
    const other = w.addRule({ trigger: "CONVERSATION_CREATED", workspaceId: "ws_2", action: "ADD_TAG", actionConfig: { tag: "x" } });
    const off = w.addRule({ trigger: "CONVERSATION_CREATED", isEnabled: false, action: "ADD_TAG", actionConfig: { tag: "y" } });
    const outcomes = await runAll(
      conversationCreatedEvents({ workspaceId: WS, conversationId: "c1", origin: origin("visitor") }),
      w,
    );
    assert.equal(ran(outcomes, other.id) + ran(outcomes, off.id), 0);
  });
});
