import { NextRequest } from "next/server";

import { authenticateApiKey, hasPermission, resolveWorkspace } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { safeTrigger } from "@/lib/pusher-server";
import { apiOk, apiError, checkRateLimit, withHeaders } from "@/lib/api-utils";

// POST /api/agent/typing
// Allows external AI agents to send typing indicators to the widget.
// Body: { conversationId, typing: true|false }
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
    const { conversationId, typing, workspaceId: requestedWorkspaceId } = body;

    if (!conversationId || typeof conversationId !== "string") {
      return withHeaders(apiError("conversationId is required", 400), rateResult.headers);
    }

    if (typeof typing !== "boolean") {
      return withHeaders(apiError("typing must be a boolean", 400), rateResult.headers);
    }

    const wsResult = await resolveWorkspace(authContext, requestedWorkspaceId);
    if ("error" in wsResult) {
      return withHeaders(apiError(wsResult.error, wsResult.status), rateResult.headers);
    }

    // Verify conversation belongs to this workspace
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { workspaceId: true },
    });

    if (!conversation || conversation.workspaceId !== wsResult.workspaceId) {
      return withHeaders(apiError("Conversation not found", 404), rateResult.headers);
    }

    // Fire typing event to the visitor widget channel
    const event = typing ? "typing:start" : "typing:stop";
    await safeTrigger(
      `private-visitor-${conversationId}`,
      event,
      {},
      "/api/agent/typing",
    );

    return withHeaders(apiOk({ ok: true }), rateResult.headers);
  } catch (error) {
    console.error("Agent typing error:", error);
    return withHeaders(apiError("Failed to send typing indicator", 500), rateResult.headers);
  }
}
