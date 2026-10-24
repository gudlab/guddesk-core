/**
 * Changing a conversation's status. The inbox action
 * (actions/update-conversation-status.ts) and the automation CHANGE_STATUS
 * action both go through this, so a close by an automation does what a
 * manual close does: the SYSTEM message, the realtime events, the CSAT
 * survey (where enabled) and the conversation.closed webhook. Closing a
 * conversation that is already closed does none of these.
 *
 * It does not fire automations. The caller does that when closedNow is
 * true: the inbox action with fireAutomations(), the engine as a follow-up
 * event at depth + 1, so the depth and chain guards still apply.
 *
 * The side effects are passed in (lib/conversations/status-prisma.ts wires
 * the real ones), so tests use fakes.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */

export type StatusValue = "OPEN" | "SNOOZED" | "CLOSED";

export type StatusActor =
  | { kind: "agent"; userId: string; name: string | null }
  | { kind: "automation"; ruleId: string; ruleName: string };

export interface StatusChangeInput {
  conversationId: string;
  workspaceId: string;
  status: StatusValue;
  /** Only used for SNOOZED. */
  snoozedUntil?: Date | null;
  actor: StatusActor;
  at: Date;
}

export interface RealtimeEvent {
  channel: string;
  name: string;
  data: unknown;
}

export interface StatusChangeDeps {
  /** Moves the conversation into CLOSED only if it is not CLOSED. True when it did. */
  closeIfNotClosed(conversationId: string, at: Date): Promise<boolean>;
  update(
    conversationId: string,
    data: { status: StatusValue; snoozedUntil: Date | null; closedAt: Date | null },
  ): Promise<void>;
  addSystemMessage(
    conversationId: string,
    body: string,
    sender: { id: string; name: string | null } | null,
  ): Promise<void>;
  /** Must not throw (safeTriggerBatch). */
  triggerBatch(events: RealtimeEvent[], label: string): Promise<unknown>;
  /** Sends the CSAT survey if CSAT is enabled for the workspace. */
  triggerCsatSurvey(conversationId: string): Promise<unknown>;
  /** Must not throw (dispatchWebhooks). */
  webhook(workspaceId: string, event: string, data: Record<string, unknown>): Promise<void>;
  log?: (message: string, error: unknown) => void;
}

const LABELS: Record<StatusValue, string> = { OPEN: "reopened", SNOOZED: "snoozed", CLOSED: "closed" };

export async function changeConversationStatus(
  input: StatusChangeInput,
  deps: StatusChangeDeps,
): Promise<{ closedNow: boolean; closedAt: Date | null }> {
  const { conversationId, workspaceId, status, actor, at } = input;
  const closedAt = status === "CLOSED" ? at : null;
  const snoozedUntil = status === "SNOOZED" ? (input.snoozedUntil ?? null) : null;

  if (status === "CLOSED") {
    const won = await deps.closeIfNotClosed(conversationId, at);
    // Already closed (a double click, two agents, or a rule and an agent
    // at once): only the caller whose conditional update won does the
    // close effects, so there is one SYSTEM message, one CSAT survey and
    // one conversation.closed webhook per close.
    if (!won) return { closedNow: false, closedAt: null };
  } else {
    await deps.update(conversationId, { status, snoozedUntil, closedAt });
  }
  const closedNow = status === "CLOSED";

  const label = LABELS[status];
  if (actor.kind === "agent") {
    await deps.addSystemMessage(conversationId, `Conversation ${label} by ${actor.name ?? "Agent"}`, {
      id: actor.userId,
      name: actor.name,
    });
  } else {
    await deps.addSystemMessage(conversationId, `Conversation ${label} by automation rule "${actor.ruleName}"`, null);
  }

  await deps.triggerBatch(
    [
      {
        channel: `private-workspace-${workspaceId}`,
        name: "conversation:updated",
        data: { conversationId, status },
      },
      {
        channel: `private-conversation-${conversationId}`,
        name: "conversation:updated",
        data: { status },
      },
    ],
    actor.kind === "agent" ? "updateConversationStatus" : "automation.CHANGE_STATUS",
  );

  if (status === "CLOSED") {
    try {
      await deps.triggerCsatSurvey(conversationId);
    } catch (error) {
      (deps.log ?? console.error)("CSAT trigger error:", error);
    }

    await deps.webhook(
      workspaceId,
      "conversation.closed",
      actor.kind === "agent"
        ? { conversationId, closedBy: actor.userId, closedByName: actor.name }
        : { conversationId, closedBy: null, closedByName: null, origin: "automation", ruleId: actor.ruleId },
    );
  }

  return { closedNow, closedAt };
}
