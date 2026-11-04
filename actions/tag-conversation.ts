"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { safeTrigger } from "@/lib/pusher-server";
import { revalidatePath } from "next/cache";

export async function tagConversation(
  conversationId: string,
  tags: string[],
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

    // Dedupe and sanitize tags
    const cleanTags = Array.from(new Set(tags.map((t) => t.trim().toLowerCase()))).filter(
      (t) => t.length > 0 && t.length <= 50,
    );

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { tags: cleanTags },
    });

    await safeTrigger(
      `private-workspace-${conversation.workspaceId}`,
      "conversation:updated",
      { conversationId, tags: cleanTags },
      "tagConversation",
    );

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Tag conversation error:", error);
    return { status: "error" as const, message: "Failed to update tags" };
  }
}
