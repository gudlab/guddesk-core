import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  inboxConversationListLimit,
  inboxConversationListSelect,
  inboxConversationListWhere,
  type InboxListStatus,
} from "@/lib/inbox-conversations";
import { cursorPageArgs, splitCursorPage } from "@/lib/pagination";
import { requireWorkspaceMember } from "@/lib/workspace";
import { scheduleOpportunisticJobs } from "@/lib/scheduled";

// GET /api/inbox/conversations?workspaceId=xxx&status=OPEN&assigneeId=yyy&limit=25&cursor=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") as InboxListStatus | null;
    const assigneeId = searchParams.get("assigneeId");
    const cursor = searchParams.get("cursor");
    const limit = inboxConversationListLimit(searchParams.get("limit"));

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId, session.user.id);
    // The inbox polls this route, so it also runs the SLA check for this
    // workspace at most every 5 minutes, after the response.
    scheduleOpportunisticJobs(workspaceId);

    const where = inboxConversationListWhere(workspaceId, status, assigneeId);

    // Cursor-based pagination: one extra row tells us if there's a next page.
    const paginationClause = cursorPageArgs(cursor, limit, { lookahead: true });

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        select: inboxConversationListSelect,
        // id breaks ties (equal or null lastMessageAt) so cursor pages are stable.
        orderBy: [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { id: "desc" }],
        ...paginationClause,
      }),
      prisma.conversation.count({ where }),
    ]);

    const { items: trimmed, hasMore, nextCursor } = splitCursorPage(conversations, limit);

    return NextResponse.json({
      conversations: trimmed,
      total,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
