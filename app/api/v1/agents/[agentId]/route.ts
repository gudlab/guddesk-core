import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { withApiAuth, withHeaders, apiOk, apiError } from "@/lib/api-utils";
import { uninstallAgent, updateAgent } from "@/lib/agents";

// ---------------------------------------------------------------------------
// GET /api/v1/agents/:agentId  —  Get agent details
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;

  const result = await withApiAuth(req, { permission: "READ_ONLY" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        description: true,
        type: true,
        iconUrl: true,
        creatorName: true,
        creatorUrl: true,
        config: true,
        isEnabled: true,
        priority: true,
        installedAt: true,
        createdAt: true,
        updatedAt: true,
        webhookEndpoint: {
          select: {
            id: true,
            url: true,
            isEnabled: true,
            onMessageCreated: true,
            onConversationCreated: true,
            onConversationClosed: true,
            onConversationAssigned: true,
          },
        },
      },
    });

    if (!agent || agent.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Agent not found", 404), rateLimitHeaders);
    }

    const { workspaceId: _ws, ...data } = agent;
    return withHeaders(apiOk(data), rateLimitHeaders);
  } catch (error) {
    console.error("Get agent error:", error);
    return withHeaders(apiError("Failed to get agent", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/agents/:agentId  —  Update agent configuration
// Body: { name?, description?, config?, isEnabled?, priority?, webhookUrl?, events?, iconUrl?, creatorName?, creatorUrl? }
// Requires: READ_WRITE or higher
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;

  const result = await withApiAuth(req, { permission: "READ_WRITE" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const body = await req.json();

    const updated = await updateAgent(agentId, ctx.workspaceId, {
      name: body.name,
      description: body.description,
      iconUrl: body.iconUrl,
      creatorName: body.creatorName,
      creatorUrl: body.creatorUrl,
      config: body.config,
      isEnabled: body.isEnabled,
      priority: body.priority,
      webhookUrl: body.webhookUrl,
      events: body.events,
    });

    return withHeaders(apiOk(updated), rateLimitHeaders);
  } catch (error) {
    console.error("Update agent error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update agent";
    const status =
      message === "Agent not found"
        ? 404
        : message.includes("HTTPS") || message.includes("URL")
          ? 400
          : message.includes("non-empty") || message.includes("must be")
            ? 400
            : 500;
    return withHeaders(apiError(message, status), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/agents/:agentId  —  Uninstall an agent
// Removes the agent, its webhook endpoint, and its API key.
// Requires: FULL_ACCESS
// ---------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;

  const result = await withApiAuth(req, { permission: "FULL_ACCESS" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    await uninstallAgent(agentId, ctx.workspaceId);

    return withHeaders(apiOk({ deleted: true }), rateLimitHeaders);
  } catch (error) {
    console.error("Uninstall agent error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to uninstall agent";
    const status = message === "Agent not found" ? 404 : 500;
    return withHeaders(apiError(message, status), rateLimitHeaders);
  }
}
