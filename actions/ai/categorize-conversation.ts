"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";
import { callClaude } from "@/lib/ai/client";
import { CATEGORIZE_SYSTEM } from "@/lib/ai/prompts";

export async function categorizeConversation(conversationId: string) {
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

    const messages = await prisma.message.findMany({
      where: { conversationId, type: { in: ["VISITOR", "AGENT"] } },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: { type: true, body: true },
    });

    const conversationText = messages
      .map((m) => `${m.type === "VISITOR" ? "Customer" : "Agent"}: ${m.body}`)
      .join("\n");

    const result = await callClaude({
      workspaceId: conversation.workspaceId,
      feature: "categorize",
      system: CATEGORIZE_SYSTEM,
      messages: [{ role: "user", content: conversationText }],
      maxTokens: 128,
      conversationId,
    });

    if (!result) {
      return { status: "error" as const, message: "AI features require a Pro plan" };
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(result);
      if (!Array.isArray(tags)) tags = [];
      tags = tags.filter((t): t is string => typeof t === "string").slice(0, 5);
    } catch {
      tags = [];
    }

    if (tags.length > 0) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { tags },
      });
    }

    return { status: "success" as const, tags };
  } catch (error) {
    console.error("Categorize conversation error:", error);
    return { status: "error" as const, message: "Failed to categorize" };
  }
}
