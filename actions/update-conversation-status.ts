"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { changeConversationStatus } from "@/lib/conversations/status";
import { prismaStatusDeps } from "@/lib/conversations/status-prisma";
import { revalidatePath } from "next/cache";
import { fireAutomations } from "@/lib/automations/dispatch";
import { conversationClosedEvent, origin } from "@/lib/automations/events";

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
      select: { workspaceId: true },
    });

    if (!conversation) {
      return { status: "error" as const, message: "Conversation not found" };
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    // Same path as an automation close (lib/conversations/status.ts): the
    // SYSTEM message, realtime events, CSAT survey and closed webhook.
    const { closedNow, closedAt } = await changeConversationStatus(
      {
        conversationId,
        workspaceId: conversation.workspaceId,
        status,
        snoozedUntil: status === "SNOOZED" && snoozedUntil ? new Date(snoozedUntil) : null,
        actor: { kind: "agent", userId: session.user.id, name: session.user.name ?? null },
        at: new Date(),
      },
      prismaStatusDeps(),
    );

    // Only a change into CLOSED fires "conversation closed".
    if (closedNow && closedAt) {
      fireAutomations(
        conversationClosedEvent({
          workspaceId: conversation.workspaceId,
          conversationId,
          closedAt,
          origin: origin("agent"),
        }),
      );
    }

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Update conversation status error:", error);
    return { status: "error" as const, message: "Failed to update status" };
  }
}
