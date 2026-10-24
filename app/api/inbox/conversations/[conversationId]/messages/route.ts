import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { messagesQueryArgs } from "@/lib/inbox-polling";
import { requireWorkspaceMember } from "@/lib/workspace";

// GET /api/inbox/conversations/[conversationId]/messages[?after=ISO-8601[&afterId=id]]
// `after` (optional) returns only messages created at or after that time,
// oldest first, at most MESSAGES_AFTER_TAKE (200) of them. The inbox polling
// fallback uses it so each poll reads a few rows, not the whole thread.
// `afterId` (optional, with `after`) continues strictly after the message
// with that createdAt and id; the poller sends it after a full page.
// Without `after`, or when it isn't a date, the response is the full thread,
// uncapped, as before (the initial load needs all of it). A date outside
// 1970 to 9999 is clamped into that range (see parseMessagesAfter), so an
// early date returns the oldest 200 messages, not the full thread.
export async function GET(
  req: NextRequest,
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
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    const messages = await prisma.message.findMany({
      ...messagesQueryArgs(
        conversationId,
        req.nextUrl.searchParams.get("after"),
        req.nextUrl.searchParams.get("afterId"),
      ),
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
