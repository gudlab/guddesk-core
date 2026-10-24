/**
 * Removing a workspace member (or deleting the user) leaves their
 * conversations without an assignee. The foreign key would null assigneeId
 * on its own (onDelete: SetNull) but leave unassignedAt as it was, so an
 * "unassigned for" rule would count from an old time and fire early.
 * Callers run this update in the same transaction as the delete.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */

export type MemberScope = { memberId: string } | { userId: string };

export function unassignMemberConversations(scope: MemberScope, now: Date) {
  // An empty id would make Prisma drop the filter and match every
  // assigned conversation.
  const id = "memberId" in scope ? scope.memberId : scope.userId;
  if (!id) throw new Error("unassignMemberConversations needs a member or user id");
  return {
    where:
      "memberId" in scope
        ? { assigneeId: scope.memberId }
        : { assignee: { is: { userId: scope.userId } } },
    data: { assigneeId: null, unassignedAt: now },
  };
}
