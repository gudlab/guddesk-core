"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { safeTrigger } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";
import { fireAutomations } from "@/lib/automations/dispatch";
import { bulkClosedEvents, origin } from "@/lib/automations/events";

export async function bulkUpdateConversations(
  workspaceId: string,
  conversationIds: string[],
  action: "close" | "reopen" | "assign",
  assigneeId?: string | null,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    await requireWorkspaceMember(workspaceId, session.user.id);

    if (conversationIds.length === 0 || conversationIds.length > 50) {
      return { status: "error" as const, message: "Select 1-50 conversations" };
    }

    // Verify all conversations belong to the workspace
    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIds }, workspaceId },
      select: { id: true, status: true },
    });

    const validIds = conversations.map((c) => c.id);
    if (validIds.length === 0) {
      return { status: "error" as const, message: "No valid conversations found" };
    }

    const data: Record<string, unknown> = {};
    const now = new Date();

    if (action === "close") {
      data.status = "CLOSED";
      data.closedAt = now;
    } else if (action === "reopen") {
      data.status = "OPEN";
      data.closedAt = null;
    } else if (action === "assign") {
      data.assigneeId = assigneeId ?? null;
    }

    if (action === "assign" && !assigneeId) {
      // Unassign: start the "unassigned for" clock only on conversations
      // that had an assignee.
      await prisma.conversation.updateMany({
        where: { id: { in: validIds }, assigneeId: { not: null } },
        data: { assigneeId: null, unassignedAt: now },
      });
    } else {
      await prisma.conversation.updateMany({
        where: { id: { in: validIds } },
        data,
      });
    }

    if (action === "close") {
      // Once per conversation, and only for the ones that were not closed.
      fireAutomations(
        bulkClosedEvents({ workspaceId, conversations, closedAt: now, origin: origin("agent") }),
      );
    }

    await safeTrigger(
      `private-workspace-${workspaceId}`,
      "conversations:bulk-updated",
      { conversationIds: validIds, action },
      "bulkUpdateConversations",
    );

    revalidatePath(`/workspace`);
    return { status: "success" as const, count: validIds.length };
  } catch (error) {
    console.error("Bulk conversation action error:", error);
    return { status: "error" as const, message: "Failed to update conversations" };
  }
}
