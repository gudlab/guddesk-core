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
// Register customer tools
// ---------------------------------------------------------------------------

export function registerCustomerTools(server: McpServer, auth: McpAuthContext) {
  // ── list_customers ──────────────────────────────────────────────────────
  server.registerTool(
    "list_customers",
    {
      description:
        "List customers (visitors) in the workspace. Optionally filter by email.",
      inputSchema: {
        email: z.string().optional().describe("Filter by exact email address"),
        limit: z.number().min(1).max(100).optional().describe("Max results (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination"),
      },
    },
    async ({ email, limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 25;
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (email) where.email = email;

      const findArgs: Record<string, unknown> = {
        where,
        select: {
          id: true,
          externalId: true,
          name: true,
          email: true,
          avatarUrl: true,
          metadata: true,
          lastSeenAt: true,
          createdAt: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.visitor.findMany(findArgs as Parameters<typeof prisma.visitor.findMany>[0]);
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );

  // ── get_customer ────────────────────────────────────────────────────────
  server.registerTool(
    "get_customer",
    {
      description:
        "Get a customer's details including their recent conversations.",
      inputSchema: {
        customerId: z.string().describe("The customer (visitor) ID"),
      },
    },
    async ({ customerId }) => {
      const customer = await prisma.visitor.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          workspaceId: true,
          externalId: true,
          name: true,
          email: true,
          avatarUrl: true,
          metadata: true,
          lastSeenAt: true,
          createdAt: true,
          conversations: {
            select: {
              id: true,
              status: true,
              subject: true,
              lastMessageAt: true,
              lastMessagePreview: true,
              createdAt: true,
            },
            orderBy: { lastMessageAt: "desc" },
            take: 10,
          },
          _count: { select: { conversations: true } },
        },
      });

      if (!customer || customer.workspaceId !== auth.workspaceId) {
        return json({ error: "Customer not found" });
      }

      const { workspaceId: _ws, ...data } = customer;
      return json(data);
    },
  );

  // ── update_customer ──────────────────────────────────────────────────────
  server.registerTool(
    "update_customer",
    {
      description:
        "Update a customer's name, email, avatar URL, or metadata.",
      inputSchema: {
        customerId: z.string().describe("The customer (visitor) ID"),
        name: z.string().nullable().optional().describe("Display name"),
        email: z.string().nullable().optional().describe("Email address"),
        avatarUrl: z.string().nullable().optional().describe("Avatar image URL"),
        metadata: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional()
          .describe("Custom key-value metadata"),
      },
    },
    async ({ customerId, name, email, avatarUrl, metadata }) => {
      const customer = await prisma.visitor.findUnique({
        where: { id: customerId },
        select: { id: true, workspaceId: true },
      });

      if (!customer || customer.workspaceId !== auth.workspaceId) {
        return json({ error: "Customer not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (metadata !== undefined) updateData.metadata = metadata;

      if (Object.keys(updateData).length === 0) {
        return json({ error: "No fields to update" });
      }

      const updated = await prisma.visitor.update({
        where: { id: customerId },
        data: updateData,
        select: {
          id: true,
          externalId: true,
          name: true,
          email: true,
          avatarUrl: true,
          metadata: true,
          lastSeenAt: true,
          createdAt: true,
        },
      });

      return json(updated);
    },
  );

  // ── list_customer_events ───────────────────────────────────────────────
  server.registerTool(
    "list_customer_events",
    {
      description:
        "List timeline events for a customer. Shows identification, profile updates, company assignments, etc.",
      inputSchema: {
        customerId: z.string().describe("The customer (visitor) ID"),
        type: z.string().optional().describe("Filter by event type (e.g. 'customer.identified')"),
        limit: z.number().min(1).max(100).optional().describe("Max results (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination"),
      },
    },
    async ({ customerId, type, limit: rawLimit, cursor }) => {
      const customer = await prisma.visitor.findUnique({
        where: { id: customerId },
        select: { workspaceId: true },
      });

      if (!customer || customer.workspaceId !== auth.workspaceId) {
        return json({ error: "Customer not found" });
      }

      const limit = rawLimit ?? 25;
      const where: Record<string, unknown> = {
        visitorId: customerId,
        workspaceId: auth.workspaceId,
      };
      if (type) where.type = type;

      const findArgs: Record<string, unknown> = {
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.customerEvent.findMany(
        findArgs as Parameters<typeof prisma.customerEvent.findMany>[0],
      );
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );
}
