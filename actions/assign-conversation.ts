"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { revalidatePath } from "next/cache";

export async function assignConversation(
  conversationId: string,
  assigneeId: string | null,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true },
    });

    if (!conversation) {
      return { status: "error" as const, message: "Conversation not found" };
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    // Validate assignee is a workspace member if provided
    if (assigneeId) {
      const member = await prisma.workspaceMember.findUnique({
        where: { id: assigneeId },
        select: { workspaceId: true },
      });
      if (!member || member.workspaceId !== conversation.workspaceId) {
        return { status: "error" as const, message: "Invalid assignee" };
      }
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { assigneeId },
      include: {
        assignee: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    const assigneeName = updated.assignee?.user.name ?? "Unknown";
    const actorName = session.user.name ?? "Someone";

    const events: Array<{ channel: string; name: string; data: unknown }> = [];

    if (assigneeId) {
      // Assignment: visible to both agents and visitors in widget
      const sysMsg = await prisma.message.create({
        data: {
          conversationId,
          type: "SYSTEM",
          body: `${assigneeName} has joined the chat`,
          senderId: session.user.id,
        },
      });

      const payload = {
        id: sysMsg.id,
        body: sysMsg.body,
        type: "SYSTEM",
        senderName: null,
        createdAt: sysMsg.createdAt.toISOString(),
      };
      events.push(
        { channel: `private-visitor-${conversationId}`, name: "message:created", data: payload },
        { channel: `private-conversation-${conversationId}`, name: "message:created", data: payload },
      );
    } else {
      // Unassignment: internal only (NOTE type is filtered out of widget API)
      const noteMsg = await prisma.message.create({
        data: {
          conversationId,
          type: "NOTE",
          body: `${actorName} unassigned this conversation`,
          senderId: session.user.id,
        },
      });

      events.push({
        channel: `private-conversation-${conversationId}`,
        name: "message:created",
        data: {
          id: noteMsg.id,
          body: noteMsg.body,
          type: "NOTE",
          senderName: actorName,
          createdAt: noteMsg.createdAt.toISOString(),
        },
      });
    }

    // Broadcast conversation update (refreshes list and sidebar)
    events.push({
      channel: `private-workspace-${conversation.workspaceId}`,
      name: "conversation:updated",
      data: { conversationId, assigneeId },
    });

    await safeTriggerBatch(events, "assignConversation");

    // Dispatch conversation.assigned webhook
    if (assigneeId) {
      await dispatchWebhooks(conversation.workspaceId, "conversation.assigned", {
        conversationId,
        assigneeId,
        assigneeName: updated.assignee?.user.name ?? null,
        assignedBy: session.user.id,
        assignedByName: session.user.name,
      });
    }

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Assign conversation error:", error);
    return { status: "error" as const, message: "Failed to assign conversation" };
  }
}
