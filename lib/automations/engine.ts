/**
 * Automation engine. Runs the enabled rules for one event, in a stable
 * order, with the guards from eng/automation-design.md:
 *
 *   - depth limit and rule chain (loop protection)
 *   - per-conversation and per-workspace rate caps
 *   - one AutomationRun row per (rule, eventKey), inserted before the
 *     action, so a duplicate event runs each rule once
 *   - each rule in its own try/catch
 *
 * Changes made by a rule raise their own events (a tag added, a close),
 * which run after the current event at depth + 1.
 *
 * The store and side effects are passed in, so tests use an in-memory
 * fake. lib/automations/dispatch.ts wires Prisma, Pusher, webhooks and
 * Slack.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import type { AutomationAction, AutomationTrigger } from "@prisma/client";

import { matchesConditions } from "@/lib/automations/conditions";
import type { StatusChangeInput } from "@/lib/conversations/status";
import {
  conversationClosedEvent,
  tagAddedEvents,
  type AutomationEvent,
} from "@/lib/automations/events";

export const MAX_DEPTH = 3;
export const CONVERSATION_CAP = 20;
export const CONVERSATION_CAP_WINDOW_MS = 60 * 60 * 1000;
export const WORKSPACE_CAP = 300;
export const WORKSPACE_CAP_WINDOW_MS = 60 * 1000;
export const EXTERNAL_TIMEOUT_MS = 5000;
export const BOT_SENDER_NAME = "GudDesk Bot";

export type ConversationStatusValue = "OPEN" | "SNOOZED" | "CLOSED";
const STATUSES: readonly string[] = ["OPEN", "SNOOZED", "CLOSED"];

export interface ConversationSnapshot {
  id: string;
  workspaceId: string;
  status: ConversationStatusValue;
  tags: string[];
  visitorName: string | null;
  visitorEmail: string | null;
}

export interface RuleRecord {
  id: string;
  workspaceId: string;
  name: string;
  trigger: AutomationTrigger;
  conditions: unknown;
  action: AutomationAction;
  actionConfig: unknown;
  order: number;
  createdAt: Date;
}

export interface BotMessage {
  id: string;
  type: "BOT";
  body: string;
  senderName: string;
  createdAt: Date;
}

export interface AutomationStore {
  getConversation(conversationId: string): Promise<ConversationSnapshot | null>;
  /** Enabled rules for the trigger in this workspace. */
  listRules(workspaceId: string, trigger: AutomationTrigger): Promise<RuleRecord[]>;
  countConversationRuns(conversationId: string, since: Date): Promise<number>;
  countWorkspaceRuns(workspaceId: string, since: Date): Promise<number>;
  /** Inserts a "running" row. Returns null when (ruleId, eventKey) exists. */
  createRun(data: {
    workspaceId: string;
    ruleId: string;
    conversationId: string;
    trigger: AutomationTrigger;
    eventKey: string;
  }): Promise<{ id: string } | null>;
  finishRun(runId: string, status: "succeeded" | "failed", error: string | null, at: Date): Promise<void>;
  markRuleTriggered(ruleId: string, at: Date): Promise<void>;
  /** False when the member is not in the workspace. */
  assign(conversationId: string, workspaceId: string, memberId: string): Promise<boolean>;
  /** Adds the tag if missing. True when it was added. */
  addTag(conversationId: string, tag: string): Promise<boolean>;
  removeTag(conversationId: string, tag: string): Promise<boolean>;
  addSystemMessage(conversationId: string, body: string): Promise<void>;
  addBotMessage(conversationId: string, body: string, at: Date): Promise<BotMessage>;
  findCannedResponse(workspaceId: string, id: string): Promise<{ body: string } | null>;
  slackWebhookUrl(workspaceId: string): Promise<string | null>;
}

export interface AutomationEffects {
  /** Realtime event. Must not throw (safeTrigger). */
  trigger(channel: string, event: string, data: unknown, label: string): Promise<void>;
  /** Outgoing webhook. Must not throw (dispatchWebhooks). */
  webhook(workspaceId: string, event: string, data: Record<string, unknown>): Promise<void>;
  /** Throws on a failed or timed-out post. */
  postSlack(webhookUrl: string, text: string, signal: AbortSignal): Promise<void>;
  /**
   * The same status change the inbox uses (changeConversationStatus in
   * lib/conversations/status.ts). closedNow: it moved into CLOSED.
   */
  changeStatus(input: StatusChangeInput): Promise<{ closedNow: boolean }>;
}

export interface EngineDeps {
  store: AutomationStore;
  effects: AutomationEffects;
  now?: () => Date;
  log?: (message: string) => void;
  timeoutMs?: number;
}

export type RunOutcome =
  | { ruleId: string; eventKey: string; depth: number; status: "succeeded" | "failed"; error?: string }
  | {
      ruleId: string;
      eventKey: string;
      depth: number;
      status: "skipped";
      reason: "duplicate" | "rate_cap" | "chain";
    };

/** A failure we describe ourselves. Its message is safe to store. */
export class AutomationActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AutomationActionError";
  }
}

/** Short error for the run row: never message bodies or emails. */
export function shortError(error: unknown): string {
  if (error instanceof AutomationActionError) return error.message.slice(0, 200);
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") return "timeout";
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? `${error.name} ${code}` : error.name;
  }
  return "unknown error";
}

function sortRules(rules: RuleRecord[]): RuleRecord[] {
  return [...rules].sort(
    (a, b) =>
      a.order - b.order ||
      a.createdAt.getTime() - b.createdAt.getTime() ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

function config(rule: RuleRecord): Record<string, unknown> {
  const c = rule.actionConfig;
  return c && typeof c === "object" && !Array.isArray(c) ? (c as Record<string, unknown>) : {};
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Runs one event and every event it causes. A rule failure never throws;
 * the result says what happened to each rule.
 */
export async function runAutomationEvent(first: AutomationEvent, deps: EngineDeps): Promise<RunOutcome[]> {
  const outcomes: RunOutcome[] = [];
  const queue: AutomationEvent[] = [first];
  while (queue.length > 0) {
    const event = queue.shift()!;
    outcomes.push(...(await runOneEvent(event, deps, queue)));
  }
  return outcomes;
}

async function runOneEvent(
  event: AutomationEvent,
  deps: EngineDeps,
  queue: AutomationEvent[],
): Promise<RunOutcome[]> {
  const log = deps.log ?? ((m: string) => console.warn(m));
  const now = deps.now ?? (() => new Date());
  const depth = event.origin.depth;

  if (depth >= MAX_DEPTH) {
    log(`[automations] dropped ${event.trigger} for ${event.conversationId}: depth ${depth}`);
    return [];
  }

  const conversation = await deps.store.getConversation(event.conversationId);
  if (!conversation || conversation.workspaceId !== event.workspaceId) return [];

  let rules = sortRules(await deps.store.listRules(event.workspaceId, event.trigger));
  if (event.ruleId) rules = rules.filter((rule) => rule.id === event.ruleId);

  // Conditions use this snapshot, so an earlier rule's changes don't
  // change which later rules match the same event.
  const snapshot = {
    tags: [...conversation.tags],
    status: conversation.status,
    visitorEmail: conversation.visitorEmail,
    messageBody: event.messageBody ?? null,
  };

  const outcomes: RunOutcome[] = [];
  let capLogged = false;

  for (const rule of rules) {
    if (rule.trigger !== event.trigger || rule.workspaceId !== event.workspaceId) continue;
    if (!matchesConditions(rule.conditions, snapshot)) continue;
    const base = { ruleId: rule.id, eventKey: event.eventKey, depth };

    if (event.origin.chain.includes(rule.id)) {
      outcomes.push({ ...base, status: "skipped", reason: "chain" });
      continue;
    }

    let runId: string | null = null;
    try {
      const at = now();
      const [perConversation, perWorkspace] = await Promise.all([
        deps.store.countConversationRuns(
          event.conversationId,
          new Date(at.getTime() - CONVERSATION_CAP_WINDOW_MS),
        ),
        deps.store.countWorkspaceRuns(event.workspaceId, new Date(at.getTime() - WORKSPACE_CAP_WINDOW_MS)),
      ]);
      if (perConversation >= CONVERSATION_CAP || perWorkspace >= WORKSPACE_CAP) {
        if (!capLogged) {
          log(`[automations] skipped: rate_cap for ${event.trigger} on ${event.conversationId}`);
          capLogged = true;
        }
        outcomes.push({ ...base, status: "skipped", reason: "rate_cap" });
        continue;
      }

      const run = await deps.store.createRun({
        workspaceId: event.workspaceId,
        ruleId: rule.id,
        conversationId: event.conversationId,
        trigger: event.trigger,
        eventKey: event.eventKey,
      });
      if (!run) {
        outcomes.push({ ...base, status: "skipped", reason: "duplicate" });
        continue;
      }
      runId = run.id;

      const followUps = await executeAction(rule, conversation, event, deps);
      const done = now();
      await deps.store.finishRun(run.id, "succeeded", null, done);
      await deps.store.markRuleTriggered(rule.id, done);
      outcomes.push({ ...base, status: "succeeded" });

      const nextOrigin = {
        kind: "automation" as const,
        depth: depth + 1,
        chain: [...event.origin.chain, rule.id],
      };
      for (const next of followUps) queue.push({ ...next, origin: nextOrigin });
    } catch (error) {
      const message = shortError(error);
      log(`[automations] rule ${rule.id} failed on ${event.trigger}: ${message}`);
      if (runId) {
        await deps.store.finishRun(runId, "failed", message, now()).catch(() => undefined);
      }
      outcomes.push({ ...base, status: "failed", error: message });
    }
  }

  return outcomes;
}

async function executeAction(
  rule: RuleRecord,
  conversation: ConversationSnapshot,
  event: AutomationEvent,
  deps: EngineDeps,
): Promise<AutomationEvent[]> {
  const { store, effects } = deps;
  const cfg = config(rule);
  const conversationId = conversation.id;
  const workspaceId = conversation.workspaceId;
  const now = deps.now ?? (() => new Date());
  const updated = () =>
    effects.trigger(
      `private-workspace-${workspaceId}`,
      "conversation:updated",
      { conversationId },
      `automation.${rule.action}`,
    );

  switch (rule.action) {
    case "ASSIGN_TO": {
      const memberId = str(cfg.assigneeId);
      if (!memberId) throw new AutomationActionError("no assignee set");
      const ok = await store.assign(conversationId, workspaceId, memberId);
      if (!ok) throw new AutomationActionError("assignee is not in this workspace");
      await store.addSystemMessage(conversationId, "Auto-assigned by automation rule");
      await updated();
      return [];
    }

    case "ADD_TAG": {
      const tag = str(cfg.tag);
      if (!tag) throw new AutomationActionError("no tag set");
      const added = await store.addTag(conversationId, tag);
      if (!added) return [];
      await updated();
      return tagAddedEvents({
        workspaceId,
        conversationId,
        before: [],
        after: [tag],
        at: now(),
        origin: event.origin,
      });
    }

    case "REMOVE_TAG": {
      const tag = str(cfg.tag);
      if (!tag) throw new AutomationActionError("no tag set");
      if (await store.removeTag(conversationId, tag)) await updated();
      return [];
    }

    case "CHANGE_STATUS": {
      const status = str(cfg.status);
      if (!status || !STATUSES.includes(status)) throw new AutomationActionError("no valid status set");
      const at = now();
      // Exactly like a manual close: SYSTEM message, realtime events, CSAT
      // survey where enabled, and the conversation.closed webhook. The
      // closed event goes back through this engine as a follow-up at
      // depth + 1, so the depth and chain guards apply to it.
      const { closedNow } = await effects.changeStatus({
        conversationId,
        workspaceId,
        status: status as ConversationStatusValue,
        actor: { kind: "automation", ruleId: rule.id, ruleName: rule.name },
        at,
      });
      return closedNow
        ? [conversationClosedEvent({ workspaceId, conversationId, closedAt: at, origin: event.origin })]
        : [];
    }

    case "SEND_MESSAGE": {
      let body: string | null = null;
      const cannedId = str(cfg.cannedResponseId);
      if (cannedId) {
        // Looked up in this workspace only.
        const canned = await store.findCannedResponse(workspaceId, cannedId);
        body = str(canned?.body);
      }
      body ??= str(cfg.message);
      if (!body) throw new AutomationActionError("no message or canned response found");

      // A BOT message never fires "message received" and does not count as
      // the first response for SLA.
      const message = await store.addBotMessage(conversationId, body, now());
      const payload = {
        id: message.id,
        type: message.type,
        body: message.body,
        senderName: message.senderName,
        createdAt: message.createdAt,
      };
      await effects.trigger(
        `private-conversation-${conversationId}`,
        "message:created",
        payload,
        "automation.SEND_MESSAGE",
      );
      await effects.trigger(
        `private-visitor-${conversationId}`,
        "message:created",
        payload,
        "automation.SEND_MESSAGE",
      );
      await effects.webhook(workspaceId, "message.created", {
        conversationId,
        messageId: message.id,
        type: message.type,
        body: message.body,
        senderName: message.senderName,
        workspaceId,
        origin: "automation",
      });
      return [];
    }

    case "NOTIFY_SLACK": {
      const url = await store.slackWebhookUrl(workspaceId);
      if (!url) throw new AutomationActionError("Slack is not connected");
      const who = conversation.visitorName ?? "a visitor";
      const text = `Automation "${rule.name}": ${str(cfg.message) ?? "New activity"} (conversation with ${who})`;
      await effects.postSlack(url, text, AbortSignal.timeout(deps.timeoutMs ?? EXTERNAL_TIMEOUT_MS));
      return [];
    }
  }
  throw new AutomationActionError("unknown action");
}

/**
 * Runs the events after the response. Never throws and never blocks the
 * caller: a failure is logged.
 */
export function scheduleAutomationEvents(
  events: AutomationEvent[],
  deps: {
    after: (task: () => Promise<void>) => void;
    run: (event: AutomationEvent) => Promise<unknown>;
    log?: (message: string, error: unknown) => void;
  },
): void {
  if (events.length === 0) return;
  const log = deps.log ?? ((m: string, e: unknown) => console.error(m, e));
  try {
    deps.after(async () => {
      // In order: "created" runs before "message received".
      for (const event of events) {
        try {
          await deps.run(event);
        } catch (error) {
          log(`[automations] ${event.trigger} failed for ${event.conversationId}`, error);
        }
      }
    });
  } catch (error) {
    log("[automations] could not schedule events", error);
  }
}
