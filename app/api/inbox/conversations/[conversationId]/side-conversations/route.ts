import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/workspace";

// GET /api/inbox/conversations/[conversationId]/side-conversations
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    const sideConversations = await prisma.sideConversation.findMany({
      where: { conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ sideConversations });
  } catch (error) {
    console.error("Fetch side conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch side conversations" },
      { status: 500 },
    );
  }
}
