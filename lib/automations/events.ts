/**
 * Builders for automation events. Each event carries an eventKey that names
 * the source event, so a retried or duplicated delivery maps to the same
 * key and each rule runs once for it (AutomationRun has a unique
 * (ruleId, eventKey)).
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import type { AutomationTrigger } from "@prisma/client";

export type OriginKind = "visitor" | "agent" | "api" | "system" | "automation";

export interface AutomationOrigin {
  kind: OriginKind;
  /** 0 for events from people, API calls and the scheduler. */
  depth: number;
  /** Rules that led to this event, oldest first. */
  chain: string[];
}

export interface AutomationEvent {
  trigger: AutomationTrigger;
  workspaceId: string;
  conversationId: string;
  eventKey: string;
  messageBody?: string | null;
  addedTag?: string | null;
  /** Run only this rule (the "unassigned for" scheduler picks the rule). */
  ruleId?: string;
  origin: AutomationOrigin;
}

export function origin(kind: Exclude<OriginKind, "automation">): AutomationOrigin {
  return { kind, depth: 0, chain: [] };
}

interface Base {
  workspaceId: string;
  conversationId: string;
  origin: AutomationOrigin;
}

/** "Created", then "message received" for the first visitor message. */
export function conversationCreatedEvents(
  input: Base & { firstMessage?: { id: string; body: string } | null },
): AutomationEvent[] {
  const { workspaceId, conversationId } = input;
  const events: AutomationEvent[] = [
    {
      trigger: "CONVERSATION_CREATED",
      workspaceId,
      conversationId,
      eventKey: `created:${conversationId}`,
      origin: input.origin,
    },
  ];
  if (input.firstMessage) {
    events.push(
      messageReceivedEvent({ ...input, messageId: input.firstMessage.id, body: input.firstMessage.body }),
    );
  }
  return events;
}

/** Visitor messages only. Agent, BOT and note messages never fire it. */
export function messageReceivedEvent(input: Base & { messageId: string; body: string }): AutomationEvent {
  return {
    trigger: "MESSAGE_RECEIVED",
    workspaceId: input.workspaceId,
    conversationId: input.conversationId,
    eventKey: `message:${input.messageId}`,
    messageBody: input.body,
    origin: input.origin,
  };
}

/** Only for a change into CLOSED from another status. */
export function conversationClosedEvent(input: Base & { closedAt: Date }): AutomationEvent {
  return {
    trigger: "CONVERSATION_CLOSED",
    workspaceId: input.workspaceId,
    conversationId: input.conversationId,
    eventKey: `closed:${input.conversationId}:${input.closedAt.getTime()}`,
    origin: input.origin,
  };
}

/** One event per tag in `after` that was not in `before`. */
export function tagAddedEvents(
  input: Base & { before: readonly string[]; after: readonly string[]; at: Date },
): AutomationEvent[] {
  const before = new Set(input.before);
  const added = [...new Set(input.after)].filter((tag) => !before.has(tag));
  return added.map((tag) => ({
    trigger: "TAG_ADDED" as const,
    workspaceId: input.workspaceId,
    conversationId: input.conversationId,
    eventKey: `tag:${input.conversationId}:${tag}:${input.at.getTime()}`,
    addedTag: tag,
    origin: input.origin,
  }));
}

/** since = when the conversation became unassigned (or its createdAt). */
export function unassignedEventKey(conversationId: string, since: Date): string {
  return `unassigned:${conversationId}:${since.getTime()}`;
}

/**
 * Events for a conversation update (v1 PATCH, MCP update_conversation):
 * "closed" for a change into CLOSED, and "tag added" per new tag.
 */
export function conversationUpdateEvents(
  input: Base & {
    before: { status: string; tags: readonly string[] };
    after: { status: string; tags: readonly string[]; closedAt: Date | null; updatedAt: Date };
  },
): AutomationEvent[] {
  const { before, after } = input;
  const events: AutomationEvent[] = [];
  if (before.status !== "CLOSED" && after.status === "CLOSED" && after.closedAt) {
    events.push(conversationClosedEvent({ ...input, closedAt: after.closedAt }));
  }
  events.push(...tagAddedEvents({ ...input, before: before.tags, after: after.tags, at: after.updatedAt }));
  return events;
}

/** Bulk close: once per conversation, only for those that were not closed. */
export function bulkClosedEvents(input: {
  workspaceId: string;
  conversations: readonly { id: string; status: string }[];
  closedAt: Date;
  origin: AutomationOrigin;
}): AutomationEvent[] {
  const seen = new Set<string>();
  const events: AutomationEvent[] = [];
  for (const c of input.conversations) {
    if (c.status === "CLOSED" || seen.has(c.id)) continue;
    seen.add(c.id);
    events.push(
      conversationClosedEvent({
        workspaceId: input.workspaceId,
        conversationId: c.id,
        closedAt: input.closedAt,
        origin: input.origin,
      }),
    );
  }
  return events;
}
