/**
 * Shared select/where for the agent inbox list
 * (GET /api/inbox/conversations). Keep the measure script on this path
 * so a timing run hits the same columns as the live route.
 */

export const INBOX_LIST_P95_BUDGET_MS = 300;
export const INBOX_LIST_DEFAULT_LIMIT = 25;
export const INBOX_LIST_MAX_LIMIT = 100;

export const inboxConversationListSelect = {
  id: true,
  status: true,
  channel: true,
  lastMessageAt: true,
  lastMessagePreview: true,
  tags: true,
  assigneeId: true,
  visitor: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
} as const;

export type InboxListStatus = "OPEN" | "SNOOZED" | "CLOSED";

export type InboxListWhere = {
  workspaceId: string;
  status?: InboxListStatus;
  assigneeId?: string;
};

export function inboxConversationListWhere(
  workspaceId: string,
  status: InboxListStatus | null,
  assigneeId: string | null,
): InboxListWhere {
  const where: InboxListWhere = { workspaceId };
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;
  return where;
}

export function inboxConversationListLimit(raw: string | null): number {
  let limit = parseInt(raw ?? String(INBOX_LIST_DEFAULT_LIMIT), 10);
  if (Number.isNaN(limit) || limit < 1) limit = INBOX_LIST_DEFAULT_LIMIT;
  if (limit > INBOX_LIST_MAX_LIMIT) limit = INBOX_LIST_MAX_LIMIT;
  return limit;
}
