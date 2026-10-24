import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { withApiAuth, withHeaders, apiOk, apiError } from "@/lib/api-utils";
import { fireAutomations } from "@/lib/automations/dispatch";
import { conversationUpdateEvents, origin } from "@/lib/automations/events";

// ---------------------------------------------------------------------------
// GET /api/v1/conversations/:conversationId  —  Get a conversation
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;

  const result = await withApiAuth(req, { permission: "READ_ONLY" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        workspaceId: true,
        status: true,
        subject: true,
        priority: true,
        tags: true,
        snoozedUntil: true,
        lastMessageAt: true,
        lastMessagePreview: true,
        aiSummary: true,
        metadata: true,
        createdAt: true,
        closedAt: true,
        visitor: {
          select: { id: true, name: true, email: true, avatarUrl: true, metadata: true },
        },
        assignee: {
          select: {
            id: true,
            role: true,
            user: { select: { name: true, image: true, email: true } },
          },
        },
        _count: { select: { messages: true } },
      },
    });

    if (!conversation || conversation.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Conversation not found", 404), rateLimitHeaders);
    }

    const { workspaceId: _ws, ...data } = conversation;
    return withHeaders(apiOk(data), rateLimitHeaders);
  } catch (error) {
    console.error("Get conversation error:", error);
    return withHeaders(apiError("Failed to get conversation", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/conversations/:conversationId  —  Update a conversation
// Body: { status?, assigneeId?, tags?, subject?, priority? }
// Requires: READ_WRITE or higher
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;

  const result = await withApiAuth(req, { permission: "READ_WRITE" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    // Verify conversation belongs to workspace
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true, status: true, tags: true, assigneeId: true },
    });

    if (!existing || existing.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Conversation not found", 404), rateLimitHeaders);
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!["OPEN", "SNOOZED", "CLOSED"].includes(body.status)) {
        return withHeaders(
          apiError("status must be OPEN, SNOOZED, or CLOSED", 400),
          rateLimitHeaders,
        );
      }
      updateData.status = body.status;
      if (body.status === "CLOSED" && existing.status !== "CLOSED") {
        updateData.closedAt = new Date();
      }
      if (body.status !== "CLOSED") {
        updateData.closedAt = null;
      }
    }

    if (body.assigneeId !== undefined) {
      if (body.assigneeId === null) {
        updateData.assigneeId = null;
        if (existing.assigneeId) updateData.unassignedAt = new Date();
      } else {
        // Verify the assignee is a member of this workspace
        const member = await prisma.workspaceMember.findUnique({
          where: { id: body.assigneeId },
          select: { workspaceId: true },
        });
        if (!member || member.workspaceId !== ctx.workspaceId) {
          return withHeaders(apiError("Assignee not found in this workspace", 400), rateLimitHeaders);
        }
        updateData.assigneeId = body.assigneeId;
      }
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags) || !body.tags.every((t: unknown) => typeof t === "string")) {
        return withHeaders(apiError("tags must be an array of strings", 400), rateLimitHeaders);
      }
      updateData.tags = body.tags;
    }

    if (body.subject !== undefined) {
      updateData.subject = typeof body.subject === "string" ? body.subject.trim() : null;
    }

    if (body.priority !== undefined) {
      if (typeof body.priority !== "number" || body.priority < 0 || body.priority > 3) {
        return withHeaders(apiError("priority must be a number 0-3", 400), rateLimitHeaders);
      }
      updateData.priority = body.priority;
    }

    if (body.snoozedUntil !== undefined) {
      updateData.snoozedUntil = body.snoozedUntil ? new Date(body.snoozedUntil) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return withHeaders(apiError("No fields to update", 400), rateLimitHeaders);
    }

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
      select: {
        id: true,
        status: true,
        subject: true,
        priority: true,
        tags: true,
        assigneeId: true,
        snoozedUntil: true,
        closedAt: true,
        updatedAt: true,
      },
    });

    fireAutomations(
      conversationUpdateEvents({
        workspaceId: ctx.workspaceId,
        conversationId,
        before: existing,
        after: conversation,
        origin: origin("api"),
      }),
    );

    return withHeaders(apiOk(conversation), rateLimitHeaders);
  } catch (error) {
    console.error("Update conversation error:", error);
    return withHeaders(apiError("Failed to update conversation", 500), rateLimitHeaders);
  }
}
