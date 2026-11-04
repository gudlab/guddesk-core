"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { triggerCsatSurvey } from "@/lib/surveys/trigger";
import { dispatchWebhooks } from "@/lib/webhooks";
import { revalidatePath } from "next/cache";

export async function updateConversationStatus(
  conversationId: string,
  status: "OPEN" | "SNOOZED" | "CLOSED",
  snoozedUntil?: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true, status: true },
    });

    if (!conversation) {
      return { status: "error" as const, message: "Conversation not found" };
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    const data: Record<string, unknown> = {
      status,
      snoozedUntil: status === "SNOOZED" && snoozedUntil ? new Date(snoozedUntil) : null,
      closedAt: status === "CLOSED" ? new Date() : null,
    };

    await prisma.conversation.update({
      where: { id: conversationId },
      data,
    });

    // System message
    const statusLabels = { OPEN: "reopened", SNOOZED: "snoozed", CLOSED: "closed" };
    await prisma.message.create({
      data: {
        conversationId,
        type: "SYSTEM",
        body: `Conversation ${statusLabels[status]} by ${session.user.name ?? "Agent"}`,
        senderId: session.user.id,
        senderName: session.user.name,
      },
    });

    await safeTriggerBatch(
      [
        {
          channel: `private-workspace-${conversation.workspaceId}`,
          name: "conversation:updated",
          data: { conversationId, status },
        },
        {
          channel: `private-conversation-${conversationId}`,
          name: "conversation:updated",
          data: { status },
        },
      ],
      "updateConversationStatus",
    );

    // Trigger CSAT survey on close (fire-and-forget)
    if (status === "CLOSED") {
      triggerCsatSurvey(conversationId).catch((err) =>
        console.error("CSAT trigger error:", err),
      );

      // Dispatch conversation.closed webhook
      await dispatchWebhooks(conversation.workspaceId, "conversation.closed", {
        conversationId,
        closedBy: session.user.id,
        closedByName: session.user.name,
      });
    }

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Update conversation status error:", error);
    return { status: "error" as const, message: "Failed to update status" };
  }
}
