import { NextRequest } from "next/server";

import { authenticateApiKey, hasPermission, resolveWorkspace } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { apiOk, apiError, checkRateLimit, withHeaders } from "@/lib/api-utils";

// POST /api/agent/reply
// Allows external AI agents to send BOT messages into conversations.
// Authenticated via API key (Authorization: Bearer or x-api-key header).
// Requires READ_WRITE permission or higher.
export async function POST(req: NextRequest) {
  const authContext = await authenticateApiKey(req);
  if (!authContext) {
    return apiError(
      "Invalid API key. Pass it as Authorization: Bearer <key> or x-api-key header.",
      401,
    );
  }

  if (!hasPermission(authContext, "READ_WRITE")) {
    return apiError("This API key does not have write permissions", 403);
  }

  const rateResult = await checkRateLimit(authContext.apiKeyId, authContext.userId);
  if (!rateResult.allowed) return rateResult.response;

  try {
    const body = await req.json();
    const { conversationId, body: messageBody, senderName, workspaceId: requestedWorkspaceId } = body;

    if (!conversationId || typeof conversationId !== "string") {
      return withHeaders(apiError("conversationId is required", 400), rateResult.headers);
    }

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return withHeaders(
        apiError("body is required and must be a non-empty string", 400),
        rateResult.headers,
      );
    }

    // Resolve workspace from the API key scope or request body
    const wsResult = await resolveWorkspace(authContext, requestedWorkspaceId);
    if ("error" in wsResult) {
      return withHeaders(apiError(wsResult.error, wsResult.status), rateResult.headers);
    }

    // Verify the conversation belongs to this workspace
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true, assigneeId: true, status: true },
    });

    if (!conversation || conversation.workspaceId !== wsResult.workspaceId) {
      return withHeaders(apiError("Conversation not found", 404), rateResult.headers);
    }

    // Block bot replies when a human agent is assigned
    if (conversation.assigneeId) {
      return withHeaders(
        apiOk({
          skipped: true,
          reason: "conversation_assigned",
          conversationId,
        }),
        rateResult.headers,
      );
    }

    // Block bot replies to closed conversations
    if (conversation.status === "CLOSED") {
      return withHeaders(
        apiOk({
          skipped: true,
          reason: "conversation_closed",
          conversationId,
        }),
        rateResult.headers,
      );
    }

    // Create BOT message
    const message = await prisma.message.create({
      data: {
        conversationId,
        type: "BOT",
        body: messageBody.trim(),
        senderName: typeof senderName === "string" ? senderName : "AI Agent",
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

    // Trigger real-time events (same pattern as agent messages).
    // Awaited so they actually flush on Vercel serverless.
    const messagePayload = {
      id: message.id,
      type: message.type,
      body: message.body,
      senderId: null,
      senderName: message.senderName,
      createdAt: message.createdAt,
    };
    await safeTriggerBatch(
      [
        { channel: `private-visitor-${conversationId}`, name: "typing:stop", data: {} },
        { channel: `private-visitor-${conversationId}`, name: "message:created", data: messagePayload },
        { channel: `private-conversation-${conversationId}`, name: "message:created", data: messagePayload },
        {
          channel: `private-workspace-${wsResult.workspaceId}`,
          name: "conversation:new-message",
          data: {
            conversationId,
            lastMessageAt: new Date(),
            lastMessagePreview: preview,
          },
        },
      ],
      "/api/agent/reply",
    );

    return withHeaders(
      apiOk({ messageId: message.id, conversationId }),
      rateResult.headers,
    );
  } catch (error) {
    console.error("Agent reply error:", error);
    return withHeaders(apiError("Failed to send reply", 500), rateResult.headers);
  }
}
