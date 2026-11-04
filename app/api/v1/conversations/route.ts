import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import {
  withApiAuth,
  withHeaders,
  apiOk,
  apiError,
  parsePagination,
  prismaPagination,
  buildPaginationResult,
} from "@/lib/api-utils";

// ---------------------------------------------------------------------------
// GET /api/v1/conversations  —  List conversations
// Query: ?workspaceId=&status=OPEN|SNOOZED|CLOSED&assigneeId=&limit=&cursor=
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const result = await withApiAuth(req, { permission: "READ_ONLY" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const params = req.nextUrl.searchParams;
    const status = params.get("status") as "OPEN" | "SNOOZED" | "CLOSED" | null;
    const assigneeId = params.get("assigneeId");

    const where: Record<string, unknown> = { workspaceId: ctx.workspaceId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;

    const pagination = parsePagination(req);

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        select: {
          id: true,
          status: true,
          channel: true,
          subject: true,
          priority: true,
          tags: true,
          lastMessageAt: true,
          lastMessagePreview: true,
          createdAt: true,
          closedAt: true,
          visitor: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          assignee: {
            select: {
              id: true,
              user: { select: { name: true, image: true } },
            },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: "desc" },
        ...prismaPagination(pagination),
      }),
      prisma.conversation.count({ where }),
    ]);

    const { items, meta } = buildPaginationResult(conversations, pagination, total);

    return withHeaders(apiOk(items, meta), rateLimitHeaders);
  } catch (error) {
    console.error("List conversations error:", error);
    return withHeaders(apiError("Failed to list conversations", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/conversations  —  Create a conversation
// Body: { visitorId, subject?, message? }
// Requires: READ_WRITE or higher
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const result = await withApiAuth(req, { permission: "READ_WRITE" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const body = await req.json();
    const { visitorId, subject, message } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return withHeaders(apiError("visitorId is required", 400), rateLimitHeaders);
    }

    // Verify the visitor belongs to this workspace
    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
      select: { workspaceId: true },
    });

    if (!visitor || visitor.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Visitor not found", 404), rateLimitHeaders);
    }

    const conversation = await prisma.conversation.create({
      data: {
        workspaceId: ctx.workspaceId,
        visitorId,
        channel: "API",
        subject: typeof subject === "string" ? subject.trim() : null,
        ...(message && typeof message === "string"
          ? {
              lastMessageAt: new Date(),
              lastMessagePreview:
                message.length > 100 ? message.slice(0, 100) + "..." : message,
              messages: {
                create: {
                  type: "VISITOR",
                  body: message,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        status: true,
        channel: true,
        subject: true,
        createdAt: true,
        visitor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return withHeaders(apiOk(conversation, undefined, 201), rateLimitHeaders);
  } catch (error) {
    console.error("Create conversation error:", error);
    return withHeaders(apiError("Failed to create conversation", 500), rateLimitHeaders);
  }
}
