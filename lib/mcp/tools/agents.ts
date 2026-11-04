import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { prisma } from "@/lib/db";
import type { McpAuthContext } from "../auth";

// ---------------------------------------------------------------------------
// Helper: JSON text response
// ---------------------------------------------------------------------------
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ---------------------------------------------------------------------------
// Register agent tools
// ---------------------------------------------------------------------------

export function registerAgentTools(server: McpServer, auth: McpAuthContext) {
  // ── list_agents ─────────────────────────────────────────────────────────
  server.registerTool(
    "list_agents",
    {
      description: "List installed agents in the workspace.",
      inputSchema: {
        type: z
          .enum(["BUILT_IN", "MARKETPLACE", "CUSTOM"])
          .optional()
          .describe("Filter by agent type"),
        enabled: z.boolean().optional().describe("Filter by enabled status"),
      },
    },
    async ({ type, enabled }) => {
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (type) where.type = type;
      if (enabled !== undefined) where.isEnabled = enabled;

      const agents = await prisma.agent.findMany({
        where,
        select: {
          id: true,
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
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });

      return json({ items: agents, total: agents.length });
    },
  );

  // ── get_agent ───────────────────────────────────────────────────────────
  server.registerTool(
    "get_agent",
    {
      description: "Get details of an installed agent by ID.",
      inputSchema: {
        agentId: z.string().describe("The agent ID"),
      },
    },
    async ({ agentId }) => {
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

      if (!agent || agent.workspaceId !== auth.workspaceId) {
        return json({ error: "Agent not found" });
      }

      const { workspaceId: _ws, ...data } = agent;
      return json(data);
    },
  );
}
