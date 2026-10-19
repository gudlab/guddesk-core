import "server-only";

import { createHash } from "crypto";

import { NextRequest } from "next/server";
import { ApiKeyPermission } from "@prisma/client";

import { permissionAtLeast } from "@/lib/api-permissions";
import { prisma } from "@/lib/db";

export interface AuthenticatedApiContext {
  userId: string;
  workspaceId: string | null; // null = key has access to all user's workspaces
  permission: ApiKeyPermission;
  apiKeyId: string;
}

/**
 * Extract the raw API key from the request.
 * Supports: `Authorization: Bearer <key>` or `x-api-key: <key>`
 */
function extractKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return req.headers.get("x-api-key")?.trim() || null;
}

/**
 * Hash an API key with SHA-256 (hex output).
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Authenticate an API request using the API key system.
 *
 * Looks up the hashed key in the `api_keys` table, checks enabled + expiry,
 * and returns the user context with optional workspace scope and permission level.
 *
 * Returns null if authentication fails.
 */
export async function authenticateApiKey(
  req: NextRequest,
): Promise<AuthenticatedApiContext | null> {
  const rawKey = extractKey(req);
  if (!rawKey) return null;

  // All API keys start with "gd_"
  if (!rawKey.startsWith("gd_")) return null;

  const hash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      permission: true,
      isEnabled: true,
      expiresAt: true,
    },
  });

  if (!apiKey) return null;
  if (!apiKey.isEnabled) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update lastUsedAt (fire-and-forget, don't block the request)
  void prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    userId: apiKey.userId,
    workspaceId: apiKey.workspaceId,
    permission: apiKey.permission,
    apiKeyId: apiKey.id,
  };
}

/**
 * Permission check helper.
 * Returns true if the context has at least the required permission level.
 *
 * Hierarchy: FULL_ACCESS > READ_WRITE > READ_ONLY
 */
export function hasPermission(
  context: AuthenticatedApiContext,
  required: ApiKeyPermission,
): boolean {
  return permissionAtLeast(context.permission, required);
}

/**
 * Resolve the workspace for an API request.
 *
 * - If the API key is scoped to a specific workspace, that workspace is always used.
 * - If the API key is scoped to "all workspaces" (workspaceId is null), the caller
 *   must provide a workspaceId in the request, and we verify the user is a member.
 *
 * Returns the resolved workspaceId or an error message.
 */
export async function resolveWorkspace(
  context: AuthenticatedApiContext,
  requestedWorkspaceId?: string | null,
): Promise<{ workspaceId: string } | { error: string; status: number }> {
  // Key is scoped to a specific workspace — always use it
  if (context.workspaceId) {
    return { workspaceId: context.workspaceId };
  }

  // Key is scoped to all workspaces — require workspaceId in the request
  if (!requestedWorkspaceId) {
    return {
      error:
        "This API key has access to all workspaces. Provide a workspaceId in the request body or query parameter.",
      status: 400,
    };
  }

  // Verify the user is a member of the requested workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: requestedWorkspaceId,
        userId: context.userId,
      },
    },
    select: { workspaceId: true },
  });

  if (!membership) {
    return {
      error: "You are not a member of the specified workspace",
      status: 403,
    };
  }

  return { workspaceId: requestedWorkspaceId };
}
