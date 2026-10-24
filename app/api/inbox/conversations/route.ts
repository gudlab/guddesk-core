import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cursorPageArgs, splitCursorPage } from "@/lib/pagination";
import { requireWorkspaceMember } from "@/lib/workspace";

// GET /api/inbox/conversations?workspaceId=xxx&status=OPEN&assigneeId=yyy&limit=25&cursor=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") as "OPEN" | "SNOOZED" | "CLOSED" | null;
    const assigneeId = searchParams.get("assigneeId");
    const cursor = searchParams.get("cursor");
    let limit = parseInt(searchParams.get("limit") ?? "25", 10);
    if (isNaN(limit) || limit < 1) limit = 25;
    if (limit > 100) limit = 100;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    await requireWorkspaceMember(workspaceId, session.user.id);

    const where: Record<string, unknown> = { workspaceId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    // Cursor-based pagination: one extra row tells us if there's a next page.
    const paginationClause = cursorPageArgs(cursor, limit, { lookahead: true });

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          visitor: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          assignee: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
          _count: { select: { messages: true } },
        },
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
