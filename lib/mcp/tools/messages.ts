import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { prisma } from "@/lib/db";
import { safeTrigger, safeTriggerBatch } from "@/lib/pusher-server";
import type { McpAuthContext } from "../auth";
import { cursorPageArgs, splitCursorPage } from "@/lib/pagination";

// ---------------------------------------------------------------------------
// Helper: JSON text response
// ---------------------------------------------------------------------------
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ---------------------------------------------------------------------------
// Register message tools
// ---------------------------------------------------------------------------

export function registerMessageTools(server: McpServer, auth: McpAuthContext) {
  // ── list_messages ─────────────────────────────────────────────────────────
  server.registerTool(
    "list_messages",
    {
      description: "List messages in a conversation, ordered oldest-first.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
        limit: z.number().min(1).max(100).optional().describe("Max results (default 50)"),
        cursor: z.string().optional().describe("Cursor for pagination (ID of last item)"),
      },
    },
    async ({ conversationId, limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 50;

      // Verify conversation belongs to workspace
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
      });

      if (!conversation || conversation.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const findArgs: Record<string, unknown> = {
        where: { conversationId },
        select: {
          id: true,
          type: true,
          body: true,
          senderId: true,
          senderName: true,
          attachments: true,
          createdAt: true,
          sender: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "asc" },
        ...cursorPageArgs(cursor, limit, { lookahead: true }),
      };

      const rows = await prisma.message.findMany(findArgs as Parameters<typeof prisma.message.findMany>[0]);
      const { items, nextCursor } = splitCursorPage(rows, limit);

      return json({ items, nextCursor });
    },
  );

  // ── send_message ──────────────────────────────────────────────────────────
  server.registerTool(
    "send_message",
    {
      description:
        "Send a reply to a conversation. The message is visible to the customer. " +
        "Type defaults to BOT; use AGENT for human-like responses.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
        body: z.string().min(1).describe("Message body text"),
        type: z.enum(["BOT", "AGENT"]).optional().describe("Message type (default BOT)"),
        senderName: z.string().optional().describe("Display name for the sender"),
      },
    },
    async ({ conversationId, body: messageBody, type, senderName }) => {
      // Verify conversation belongs to workspace
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
      });

      if (!conversation || conversation.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const messageType = type === "AGENT" ? "AGENT" : "BOT";

      const message = await prisma.message.create({
        data: {
          conversationId,
          type: messageType,
          body: messageBody.trim(),
          senderName: senderName ?? undefined,
        },
        select: {
          id: true,
          type: true,
          body: true,
          senderName: true,
          createdAt: true,
        },
      });

      // Update conversation metadata
      const preview =
        messageBody.length > 100
          ? messageBody.slice(0, 100) + "..."
          : messageBody;

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        },
      });

      // Trigger real-time events via Pusher (awaited so they actually
      // reach Pusher under Vercel serverless).
      const payload = {
        id: message.id,
        type: message.type,
        body: message.body,
        senderId: null,
        senderName: message.senderName,
        createdAt: message.createdAt,
      };
      await safeTriggerBatch(
        [
          { channel: `private-visitor-${conversationId}`, name: "message:created", data: payload },
          { channel: `private-conversation-${conversationId}`, name: "message:created", data: payload },
          {
            channel: `private-workspace-${auth.workspaceId}`,
            name: "conversation:new-message",
            data: {
              conversationId,
              lastMessageAt: new Date(),
              lastMessagePreview: preview,
            },
          },
        ],
        "mcp.send_message",
      );

      return json(message);
    },
  );

  // ── add_internal_note ─────────────────────────────────────────────────────
  server.registerTool(
    "add_internal_note",
    {
      description:
        "Add an internal note to a conversation. Internal notes are only visible " +
        "to workspace members, not to the customer.",
      inputSchema: {
        conversationId: z.string().describe("The conversation ID"),
        body: z.string().min(1).describe("Note body text"),
        senderName: z.string().optional().describe("Display name for the note author"),
      },
    },
    async ({ conversationId, body: noteBody, senderName }) => {
      // Verify conversation belongs to workspace
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
      });

      if (!conversation || conversation.workspaceId !== auth.workspaceId) {
        return json({ error: "Conversation not found" });
      }

      const note = await prisma.message.create({
        data: {
          conversationId,
          type: "NOTE",
          body: noteBody.trim(),
          senderName: senderName ?? undefined,
        },
        select: {
          id: true,
          type: true,
          body: true,
          senderName: true,
          createdAt: true,
        },
      });

      // Trigger real-time events (only to agents, not visitor channel).
      // Awaited so the trigger actually flushes on Vercel serverless.
      await safeTrigger(
        `private-conversation-${conversationId}`,
        "message:created",
        {
          id: note.id,
          type: note.type,
          body: note.body,
          senderId: null,
          senderName: note.senderName,
          createdAt: note.createdAt,
        },
        "mcp.add_internal_note",
      );

      return json(note);
    },
  );
}
