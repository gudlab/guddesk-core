/**
 * In-memory automation store and effects for tests. Not a test file
 * itself (the runner only picks up *.test.ts).
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import type { AutomationAction, AutomationTrigger } from "@prisma/client";

import type {
  AutomationEffects,
  AutomationStore,
  BotMessage,
  ConversationStatusValue,
  EngineDeps,
  RuleRecord,
} from "@/lib/automations/engine";
import { unassignedEventKey } from "@/lib/automations/events";
import type { UnassignedCandidate, UnassignedStore } from "@/lib/automations/prisma-store";

export interface FakeConversation {
  id: string;
  workspaceId: string;
  status: ConversationStatusValue;
  tags: string[];
  assigneeId: string | null;
  unassignedAt: Date | null;
  createdAt: Date;
  visitorName: string | null;
  visitorEmail: string | null;
}

export interface FakeRun {
  id: string;
  workspaceId: string;
  ruleId: string;
  conversationId: string;
  trigger: AutomationTrigger;
  eventKey: string;
  status: string;
  error: string | null;
  createdAt: Date;
}

export interface FakeMessage {
  id: string;
  conversationId: string;
  type: "SYSTEM" | "BOT";
  body: string;
}

let seq = 0;
const id = (prefix: string) => `${prefix}_${++seq}`;

export function createFakeWorld(start = new Date("2026-10-24T12:00:00Z")) {
  let clock = start.getTime();
  const conversations = new Map<string, FakeConversation>();
  const rules: (RuleRecord & { isEnabled: boolean; triggerCount: number })[] = [];
  const runs: FakeRun[] = [];
  const messages: FakeMessage[] = [];
  const members = new Map<string, string>(); // memberId -> workspaceId
  const canned = new Map<string, { workspaceId: string; body: string }>();
  const slack = new Map<string, string>();
  const triggers: { channel: string; event: string; data: unknown }[] = [];
  const webhooks: { workspaceId: string; event: string; data: Record<string, unknown> }[] = [];
  const logs: string[] = [];
  const calls: Record<string, number> = {};
  const count = (name: string) => {
    calls[name] = (calls[name] ?? 0) + 1;
  };
  let postSlack: AutomationEffects["postSlack"] = async () => undefined;
  const failures = new Map<string, Error>(); // store method -> error to throw

  const fail = (name: string) => {
    const error = failures.get(name);
    if (error) throw error;
  };

  const store: AutomationStore & UnassignedStore = {
    async getConversation(conversationId) {
      const c = conversations.get(conversationId);
      return c
        ? {
            id: c.id,
            workspaceId: c.workspaceId,
            status: c.status,
            tags: [...c.tags],
            visitorName: c.visitorName,
            visitorEmail: c.visitorEmail,
          }
        : null;
    },
    async listRules(workspaceId, trigger) {
      return rules.filter((r) => r.workspaceId === workspaceId && r.trigger === trigger && r.isEnabled);
    },
    async countConversationRuns(conversationId, since) {
      return runs.filter((r) => r.conversationId === conversationId && r.createdAt >= since).length;
    },
    async countWorkspaceRuns(workspaceId, since) {
      return runs.filter((r) => r.workspaceId === workspaceId && r.createdAt >= since).length;
    },
    async createRun(data) {
      // Check and insert with no await in between, like a unique index.
      if (runs.some((r) => r.ruleId === data.ruleId && r.eventKey === data.eventKey)) return null;
      const run: FakeRun = { ...data, id: id("run"), status: "running", error: null, createdAt: new Date(clock) };
      runs.push(run);
      return { id: run.id };
    },
    async finishRun(runId, status, error) {
      const run = runs.find((r) => r.id === runId)!;
      run.status = status;
      run.error = error;
    },
    async markRuleTriggered(ruleId) {
      rules.find((r) => r.id === ruleId)!.triggerCount++;
    },
    async assign(conversationId, workspaceId, memberId) {
      fail("assign");
      count("assign");
      if (members.get(memberId) !== workspaceId) return false;
      conversations.get(conversationId)!.assigneeId = memberId;
      return true;
    },
    async addTag(conversationId, tag) {
      count("addTag");
      const c = conversations.get(conversationId)!;
      if (c.tags.includes(tag)) return false;
      c.tags.push(tag);
      return true;
    },
    async removeTag(conversationId, tag) {
      const c = conversations.get(conversationId)!;
      if (!c.tags.includes(tag)) return false;
      c.tags = c.tags.filter((t) => t !== tag);
      return true;
    },
    async setStatus(conversationId, status) {
      const c = conversations.get(conversationId)!;
      const closedNow = status === "CLOSED" && c.status !== "CLOSED";
      c.status = status;
      return { closedNow };
    },
    async addSystemMessage(conversationId, body) {
      messages.push({ id: id("msg"), conversationId, type: "SYSTEM", body });
    },
    async addBotMessage(conversationId, body): Promise<BotMessage> {
      count("addBotMessage");
      const m = { id: id("msg"), conversationId, type: "BOT" as const, body };
      messages.push(m);
      return { id: m.id, type: "BOT", body, senderName: "GudDesk Bot", createdAt: new Date(clock) };
    },
    async findCannedResponse(workspaceId, cannedId) {
      const c = canned.get(cannedId);
      return c && c.workspaceId === workspaceId ? { body: c.body } : null;
    },
    async slackWebhookUrl(workspaceId) {
      return slack.get(workspaceId) ?? null;
    },
    async listUnassignedRules(workspaceId) {
      return rules.filter(
        (r) =>
          r.trigger === "CONVERSATION_UNASSIGNED_FOR" &&
          r.isEnabled &&
          (!workspaceId || r.workspaceId === workspaceId),
      );
    },
    async findUnassignedCandidates(rule, cutoff, limit): Promise<UnassignedCandidate[]> {
      return [...conversations.values()]
        .filter((c) => c.workspaceId === rule.workspaceId && c.status === "OPEN" && c.assigneeId === null)
        .map((c) => ({ conversationId: c.id, since: c.unassignedAt ?? c.createdAt }))
        .filter((c) => c.since <= cutoff)
        .filter(
          (c) =>
            !runs.some(
              (r) => r.ruleId === rule.id && r.eventKey === unassignedEventKey(c.conversationId, c.since),
            ),
        )
        .sort((a, b) => a.since.getTime() - b.since.getTime())
        .slice(0, limit);
    },
  };

  const effects: AutomationEffects = {
    async trigger(channel, event, data) {
      triggers.push({ channel, event, data });
    },
    async webhook(workspaceId, event, data) {
      webhooks.push({ workspaceId, event, data });
    },
    postSlack: (url, text, signal) => postSlack(url, text, signal),
  };

  const deps: EngineDeps & { store: AutomationStore & UnassignedStore } = {
    store,
    effects,
    now: () => new Date(clock),
    log: (m) => logs.push(m),
  };

  return {
    deps,
    conversations,
    rules,
    runs,
    messages,
    members,
    canned,
    slack,
    triggers,
    webhooks,
    logs,
    calls,
    failures,
    setPostSlack(fn: AutomationEffects["postSlack"]) {
      postSlack = fn;
    },
    advance(ms: number) {
      clock += ms;
    },
    now: () => new Date(clock),
    addConversation(input: Partial<FakeConversation> & { id: string; workspaceId?: string }) {
      const c: FakeConversation = {
        workspaceId: "ws_1",
        status: "OPEN",
        tags: [],
        assigneeId: null,
        unassignedAt: null,
        createdAt: new Date(clock),
        visitorName: "Ada",
        visitorEmail: "ada@example.com",
        ...input,
      };
      conversations.set(c.id, c);
      return c;
    },
    addRule(input: {
      id?: string;
      workspaceId?: string;
      trigger: AutomationTrigger;
      action: AutomationAction;
      actionConfig?: Record<string, unknown>;
      conditions?: Record<string, unknown> | null;
      order?: number;
      isEnabled?: boolean;
      name?: string;
    }) {
      const rule = {
        id: input.id ?? id("rule"),
        workspaceId: input.workspaceId ?? "ws_1",
        name: input.name ?? "Rule",
        trigger: input.trigger,
        conditions: input.conditions ?? null,
        action: input.action,
        actionConfig: input.actionConfig ?? {},
        order: input.order ?? 0,
        createdAt: new Date(clock + rules.length),
        isEnabled: input.isEnabled ?? true,
        triggerCount: 0,
      };
      rules.push(rule);
      return rule;
    },
  };
}
