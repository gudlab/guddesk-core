import { randomBytes } from "crypto";

import { NextRequest } from "next/server";

import { authenticateApiKey, hasPermission, resolveWorkspace } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { apiOk, apiError, checkRateLimit, withHeaders } from "@/lib/api-utils";

// ---------------------------------------------------------------------------
// GET /api/agent/webhooks  —  List webhook endpoints
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const authContext = await authenticateApiKey(req);
  if (!authContext) {
    return apiError(
      "Invalid API key. Pass it as Authorization: Bearer <key> or x-api-key header.",
      401,
    );
  }

  if (!hasPermission(authContext, "READ_ONLY")) {
    return apiError("Insufficient permissions", 403);
  }

  const rateResult = await checkRateLimit(authContext.apiKeyId, authContext.userId);
  if (!rateResult.allowed) return rateResult.response;

  try {
    // Resolve workspace from key scope or query param
    const requestedWorkspaceId = req.nextUrl.searchParams.get("workspaceId");
    const wsResult = await resolveWorkspace(authContext, requestedWorkspaceId);
    if ("error" in wsResult) {
      return withHeaders(apiError(wsResult.error, wsResult.status), rateResult.headers);
    }

    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { workspaceId: wsResult.workspaceId },
      select: {
        id: true,
        url: true,
        description: true,
        isEnabled: true,
        onMessageCreated: true,
        onConversationCreated: true,
        onConversationClosed: true,
        onConversationAssigned: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return withHeaders(apiOk(endpoints), rateResult.headers);
  } catch (error) {
    console.error("List webhooks error:", error);
    return withHeaders(apiError("Failed to list webhooks", 500), rateResult.headers);
  }
}

// ---------------------------------------------------------------------------
// POST /api/agent/webhooks  —  Register a new webhook endpoint
// Requires: FULL_ACCESS
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const authContext = await authenticateApiKey(req);
  if (!authContext) {
    return apiError(
      "Invalid API key. Pass it as Authorization: Bearer <key> or x-api-key header.",
      401,
    );
  }

  if (!hasPermission(authContext, "FULL_ACCESS")) {
    return apiError("This API key does not have full access permissions", 403);
  }

  const rateResult = await checkRateLimit(authContext.apiKeyId, authContext.userId);
  if (!rateResult.allowed) return rateResult.response;

  try {
    const body = await req.json();
    const { url, description, events, workspaceId: requestedWorkspaceId } = body;

    if (!url || typeof url !== "string") {
      return withHeaders(apiError("url is required", 400), rateResult.headers);
    }

    try {
      new URL(url);
    } catch {
      return withHeaders(apiError("Invalid URL format", 400), rateResult.headers);
    }

    // Resolve workspace from key scope or request body
    const wsResult = await resolveWorkspace(authContext, requestedWorkspaceId);
    if ("error" in wsResult) {
      return withHeaders(apiError(wsResult.error, wsResult.status), rateResult.headers);
    }

    // Check if an endpoint with this exact URL already exists for the workspace
    const existing = await prisma.webhookEndpoint.findFirst({
      where: { workspaceId: wsResult.workspaceId, url },
      select: { id: true, secret: true, isEnabled: true },
    });

    if (existing) {
      // Re-enable if disabled, and return the existing endpoint
      if (!existing.isEnabled) {
        await prisma.webhookEndpoint.update({
          where: { id: existing.id },
          data: { isEnabled: true },
        });
      }

      return withHeaders(
        apiOk({
          status: "exists",
          endpoint: {
            id: existing.id,
            url,
            secret: existing.secret,
            isEnabled: true,
          },
        }),
        rateResult.headers,
      );
    }

    const secret = randomBytes(32).toString("hex");

    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        workspaceId: wsResult.workspaceId,
        url,
        secret,
        description: typeof description === "string" ? description : "gud-agent",
        onMessageCreated: events?.onMessageCreated ?? true,
        onConversationCreated: events?.onConversationCreated ?? true,
        onConversationClosed: events?.onConversationClosed ?? false,
        onConversationAssigned: events?.onConversationAssigned ?? false,
      },
    });

    return withHeaders(
      apiOk(
        {
          status: "created",
          endpoint: {
            id: endpoint.id,
            url: endpoint.url,
            secret: endpoint.secret,
            isEnabled: endpoint.isEnabled,
          },
        },
        undefined,
        201,
      ),
      rateResult.headers,
    );
  } catch (error) {
    console.error("Create webhook error:", error);
    return withHeaders(apiError("Failed to create webhook", 500), rateResult.headers);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/agent/webhooks  —  Remove a webhook endpoint
// Body: { endpointId: string } or { url: string }
// Requires: FULL_ACCESS
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  const authContext = await authenticateApiKey(req);
  if (!authContext) {
    return apiError(
      "Invalid API key. Pass it as Authorization: Bearer <key> or x-api-key header.",
      401,
    );
  }

  if (!hasPermission(authContext, "FULL_ACCESS")) {
    return apiError("This API key does not have full access permissions", 403);
  }

  const rateResult = await checkRateLimit(authContext.apiKeyId, authContext.userId);
  if (!rateResult.allowed) return rateResult.response;

  try {
    const body = await req.json();
    const { endpointId, url, workspaceId: requestedWorkspaceId } = body;

    if (!endpointId && !url) {
      return withHeaders(apiError("endpointId or url is required", 400), rateResult.headers);
    }

    // Resolve workspace from key scope or request body
    const wsResult = await resolveWorkspace(authContext, requestedWorkspaceId);
    if ("error" in wsResult) {
      return withHeaders(apiError(wsResult.error, wsResult.status), rateResult.headers);
    }

    // Find the endpoint (by ID or URL) and verify ownership
    const endpoint = endpointId
      ? await prisma.webhookEndpoint.findUnique({
          where: { id: endpointId },
          select: { id: true, workspaceId: true },
        })
      : await prisma.webhookEndpoint.findFirst({
          where: { workspaceId: wsResult.workspaceId, url },
          select: { id: true, workspaceId: true },
        });

    if (!endpoint || endpoint.workspaceId !== wsResult.workspaceId) {
      return withHeaders(apiError("Webhook endpoint not found", 404), rateResult.headers);
    }

    await prisma.webhookEndpoint.delete({ where: { id: endpoint.id } });

    return withHeaders(apiOk({ deleted: true }), rateResult.headers);
  } catch (error) {
    console.error("Delete webhook error:", error);
    return withHeaders(apiError("Failed to delete webhook", 500), rateResult.headers);
  }
}
