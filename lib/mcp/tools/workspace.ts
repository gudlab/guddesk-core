import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { McpAuthContext } from "../auth";

// ---------------------------------------------------------------------------
// Helper: JSON text response
// ---------------------------------------------------------------------------
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ---------------------------------------------------------------------------
// Register workspace tools
// ---------------------------------------------------------------------------

export function registerWorkspaceTools(server: McpServer, auth: McpAuthContext) {
  // ── get_workspace ─────────────────────────────────────────────────────────
  server.registerTool(
    "get_workspace",
    {
      description:
        "Get information about the current workspace including member/conversation/article counts.",
      inputSchema: {},
    },
    async () => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: auth.workspaceId },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              conversations: true,
              articles: true,
            },
          },
        },
      });

      if (!workspace) {
        return json({ error: "Workspace not found" });
      }

      return json(workspace);
    },
  );

  // ── list_workspace_members ────────────────────────────────────────────────
  server.registerTool(
    "list_workspace_members",
    {
      description: "List all members of the current workspace with their roles.",
      inputSchema: {
        role: z
          .enum(WorkspaceRole)
          .optional()
          .describe(`Filter by role (${Object.values(WorkspaceRole).join(", ")})`),
      },
    },
    async ({ role }) => {
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (role) where.role = role;

      const members = await prisma.workspaceMember.findMany({
        where,
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return json({ items: members, total: members.length });
    },
  );
}
