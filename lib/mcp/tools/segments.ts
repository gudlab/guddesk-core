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
// Register segment tools
// ---------------------------------------------------------------------------

export function registerSegmentTools(server: McpServer, auth: McpAuthContext) {
  // ── list_segments ──────────────────────────────────────────────────────
  server.registerTool(
    "list_segments",
    {
      description: "List customer segments in the workspace.",
      inputSchema: {
        limit: z.number().min(1).max(100).optional().describe("Max results (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination"),
      },
    },
    async ({ limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 25;
      const findArgs: Record<string, unknown> = {
        where: { workspaceId: auth.workspaceId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.customerSegment.findMany(
        findArgs as Parameters<typeof prisma.customerSegment.findMany>[0],
      );
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );

  // ── get_segment ────────────────────────────────────────────────────────
  server.registerTool(
    "get_segment",
    {
      description: "Get a customer segment's details and conditions.",
      inputSchema: {
        segmentId: z.string().describe("The segment ID"),
      },
    },
    async ({ segmentId }) => {
      const segment = await prisma.customerSegment.findUnique({
        where: { id: segmentId },
      });

      if (!segment || segment.workspaceId !== auth.workspaceId) {
        return json({ error: "Segment not found" });
      }

      return json(segment);
    },
  );

  // ── create_segment ────────────────────────────────────────────────────
  server.registerTool(
    "create_segment",
    {
      description:
        "Create a customer segment with filter conditions. Conditions are AND-ed.",
      inputSchema: {
        name: z.string().describe("Segment name"),
        description: z.string().optional().describe("Optional description"),
        conditions: z
          .array(
            z.object({
              field: z.string().describe("Field to filter on (e.g. 'email', 'metadata.plan', 'companyId', 'lastSeenAt')"),
              operator: z.string().describe("Operator (equals, contains, gt, lt, before, after, is_set, is_not_set)"),
              value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional().describe("Value to compare against"),
            }),
          )
          .describe("Array of filter conditions"),
        color: z.string().optional().describe("Badge color (hex, e.g. '#6366f1')"),
      },
    },
    async ({ name, description, conditions, color }) => {
      const segment = await prisma.customerSegment.create({
        data: {
          workspaceId: auth.workspaceId,
          name: name.trim(),
          description: description?.trim() || null,
          conditions: conditions as unknown as object,
          color: color || null,
        },
      });

      return json(segment);
    },
  );
}
