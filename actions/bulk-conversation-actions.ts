"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { safeTrigger } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";

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
      select: { id: true },
    });

    const validIds = conversations.map((c) => c.id);
    if (validIds.length === 0) {
      return { status: "error" as const, message: "No valid conversations found" };
    }

    const data: Record<string, unknown> = {};

    if (action === "close") {
      data.status = "CLOSED";
      data.closedAt = new Date();
    } else if (action === "reopen") {
      data.status = "OPEN";
      data.closedAt = null;
    } else if (action === "assign") {
      data.assigneeId = assigneeId ?? null;
    }

    await prisma.conversation.updateMany({
      where: { id: { in: validIds } },
      data,
    });

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
