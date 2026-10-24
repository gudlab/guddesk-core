import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { fireAutomations } from "@/lib/automations/dispatch";
import { conversationClosedEvent, conversationUpdateEvents, origin } from "@/lib/automations/events";
import { prisma } from "@/lib/db";
import type { McpAuthContext } from "../auth";

// ---------------------------------------------------------------------------
// Helper: JSON text response
// ---------------------------------------------------------------------------
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ---------------------------------------------------------------------------
// Register conversation tools
// ---------------------------------------------------------------------------

export function registerConversationTools(server: McpServer, auth: McpAuthContext) {
  // ── list_conversations ────────────────────────────────────────────────────
  server.registerTool(
    "list_conversations",
    {
      description:
        "List conversations in the workspace. Supports filtering by status (OPEN, SNOOZED, CLOSED) and assignee.",
      inputSchema: {
        status: z.enum(["OPEN", "SNOOZED", "CLOSED"]).optional().describe("Filter by conversation status"),
        assigneeId: z.string().optional().describe("Filter by assignee workspace-member ID"),
        limit: z.number().min(1).max(100).optional().describe("Max results to return (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination (ID of last item)"),
      },
    },
    async ({ status, assigneeId, limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 25;
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (status) where.status = status;
      if (assigneeId) where.assigneeId = assigneeId;

      const findArgs: Record<string, unknown> = {
        where,
        select: {
          id: true,
          status: true,
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
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.conversation.findMany(findArgs as Parameters<typeof prisma.conversation.findMany>[0]);
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );

  // ── get_conversation ──────────────────────────────────────────────────────
  server.registerTool(
    "get_conversation",
    {
      description: "Get details of a single conversation by ID.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
      },
    },
    async ({ conversationId }) => {
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

      if (!conversation || conversation.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const { workspaceId: _ws, ...data } = conversation;
      return json(data);
    },
  );

  // ── update_conversation ───────────────────────────────────────────────────
  server.registerTool(
    "update_conversation",
    {
      description:
        "Update a conversation's status, assignee, priority, tags, or subject.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
        status: z.enum(["OPEN", "SNOOZED", "CLOSED"]).optional().describe("New status"),
        assigneeId: z.string().nullable().optional().describe("Workspace-member ID to assign, or null to unassign"),
        priority: z.number().min(0).max(3).optional().describe("Priority 0-3"),
        tags: z.array(z.string()).optional().describe("Tags array"),
        subject: z.string().nullable().optional().describe("Conversation subject"),
      },
    },
    async ({ conversationId, status, assigneeId, priority, tags, subject }) => {
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true, status: true, tags: true, assigneeId: true },
      });

      if (!existing || existing.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const updateData: Record<string, unknown> = {};

      if (status !== undefined) {
        updateData.status = status;
        if (status === "CLOSED" && existing.status !== "CLOSED") {
          updateData.closedAt = new Date();
        }
        if (status !== "CLOSED") {
          updateData.closedAt = null;
        }
      }

      if (assigneeId !== undefined) {
        if (assigneeId === null) {
          updateData.assigneeId = null;
          if (existing.assigneeId) updateData.unassignedAt = new Date();
        } else {
          const member = await prisma.workspaceMember.findUnique({
            where: { id: assigneeId },
            select: { workspaceId: true },
          });
          if (!member || member.workspaceId !== auth.workspaceId) {
            return json({ error: "Assignee not found in this workspace" });
          }
          updateData.assigneeId = assigneeId;
        }
      }

      if (tags !== undefined) updateData.tags = tags;
      if (subject !== undefined) updateData.subject = subject;
      if (priority !== undefined) updateData.priority = priority;

      if (Object.keys(updateData).length === 0) {
        return json({ error: "No fields to update" });
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
          workspaceId: auth.workspaceId,
          conversationId,
          before: existing,
          after: conversation,
          origin: origin("api"),
        }),
      );

      return json(conversation);
    },
  );

  // ── assign_conversation ───────────────────────────────────────────────────
  server.registerTool(
    "assign_conversation",
    {
      description: "Assign a conversation to a workspace member.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
        assigneeId: z.string().describe("Workspace-member ID to assign to"),
      },
    },
    async ({ conversationId, assigneeId }) => {
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
      });

      if (!existing || existing.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const member = await prisma.workspaceMember.findUnique({
        where: { id: assigneeId },
        select: { workspaceId: true },
      });

      if (!member || member.workspaceId !== auth.workspaceId) {
        return json({ error: "Assignee not found in this workspace" });
      }

      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { assigneeId },
        select: {
          id: true,
          status: true,
          assigneeId: true,
          updatedAt: true,
        },
      });

      return json(conversation);
    },
  );

  // ── close_conversation ────────────────────────────────────────────────────
  server.registerTool(
    "close_conversation",
    {
      description: "Close/resolve a conversation.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID to close"),
      },
    },
    async ({ conversationId }) => {
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true, status: true },
      });

      if (!existing || existing.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          status: "CLOSED",
          closedAt: existing.status !== "CLOSED" ? new Date() : undefined,
        },
        select: {
          id: true,
          status: true,
          closedAt: true,
          updatedAt: true,
        },
      });

      if (existing.status !== "CLOSED" && conversation.closedAt) {
        fireAutomations(
          conversationClosedEvent({
            workspaceId: auth.workspaceId,
            conversationId,
            closedAt: conversation.closedAt,
            origin: origin("api"),
          }),
        );
      }

      return json(conversation);
    },
  );
}
