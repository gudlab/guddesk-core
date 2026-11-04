import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { McpAuthContext } from "../auth";

// ---------------------------------------------------------------------------
// Helper: JSON text response
// ---------------------------------------------------------------------------
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ---------------------------------------------------------------------------
// Register company tools
// ---------------------------------------------------------------------------

export function registerCompanyTools(server: McpServer, auth: McpAuthContext) {
  // ── list_companies ──────────────────────────────────────────────────────
  server.registerTool(
    "list_companies",
    {
      description:
        "List companies in the workspace. Optionally filter by domain.",
      inputSchema: {
        domain: z.string().optional().describe("Filter by exact domain"),
        limit: z.number().min(1).max(100).optional().describe("Max results (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination"),
      },
    },
    async ({ domain, limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 25;
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (domain) where.domain = domain;

      const findArgs: Record<string, unknown> = {
        where,
        select: {
          id: true,
          name: true,
          domain: true,
          website: true,
          logoUrl: true,
          industry: true,
          metadata: true,
          createdAt: true,
          _count: { select: { visitors: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.company.findMany(findArgs as Parameters<typeof prisma.company.findMany>[0]);
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );

  // ── get_company ────────────────────────────────────────────────────────
  server.registerTool(
    "get_company",
    {
      description:
        "Get a company's details including its customers.",
      inputSchema: {
        companyId: z.string().describe("The company ID"),
      },
    },
    async ({ companyId }) => {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          domain: true,
          website: true,
          logoUrl: true,
          industry: true,
          metadata: true,
          createdAt: true,
          visitors: {
            select: {
              id: true,
              externalId: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastSeenAt: true,
            },
            orderBy: [
              { lastSeenAt: { sort: "desc", nulls: "last" } },
              { createdAt: "desc" },
            ],
            take: 50,
          },
          _count: { select: { visitors: true } },
        },
      });

      if (!company || company.workspaceId !== auth.workspaceId) {
        return json({ error: "Company not found" });
      }

      const { workspaceId: _ws, ...data } = company;
      return json(data);
    },
  );

  // ── create_company ────────────────────────────────────────────────────
  server.registerTool(
    "create_company",
    {
      description: "Create a new company in the workspace.",
      inputSchema: {
        name: z.string().describe("Company name"),
        domain: z.string().optional().describe("Email domain (e.g. acme.com)"),
        website: z.string().optional().describe("Website URL"),
        logoUrl: z.string().optional().describe("Logo image URL"),
        industry: z.string().optional().describe("Industry (e.g. SaaS, Healthcare)"),
        metadata: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Custom key-value metadata"),
      },
    },
    async ({ name, domain, website, logoUrl, industry, metadata }) => {
      try {
        const company = await prisma.company.create({
          data: {
            workspaceId: auth.workspaceId,
            name: name.trim(),
            domain: domain?.trim().toLowerCase() || null,
            website: website?.trim() || null,
            logoUrl: logoUrl?.trim() || null,
            industry: industry?.trim() || null,
            metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
          },
          select: {
            id: true,
            name: true,
            domain: true,
            website: true,
            logoUrl: true,
            industry: true,
            metadata: true,
            createdAt: true,
          },
        });

        return json(company);
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          return json({ error: "A company with this domain already exists" });
        }
        throw error;
      }
    },
  );

  // ── update_company ────────────────────────────────────────────────────
  server.registerTool(
    "update_company",
    {
      description: "Update a company's name, domain, website, logo, industry, or metadata.",
      inputSchema: {
        companyId: z.string().describe("The company ID"),
        name: z.string().optional().describe("Company name"),
        domain: z.string().nullable().optional().describe("Email domain"),
        website: z.string().nullable().optional().describe("Website URL"),
        logoUrl: z.string().nullable().optional().describe("Logo image URL"),
        industry: z.string().nullable().optional().describe("Industry"),
        metadata: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional()
          .describe("Custom key-value metadata"),
      },
    },
    async ({ companyId, name, domain, website, logoUrl, industry, metadata }) => {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { workspaceId: true },
      });

      if (!company || company.workspaceId !== auth.workspaceId) {
        return json({ error: "Company not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name.trim();
      if (domain !== undefined) updateData.domain = domain?.trim().toLowerCase() || null;
      if (website !== undefined) updateData.website = website?.trim() || null;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
      if (industry !== undefined) updateData.industry = industry?.trim() || null;
      if (metadata !== undefined) updateData.metadata = metadata;

      if (Object.keys(updateData).length === 0) {
        return json({ error: "No fields to update" });
      }

      const updated = await prisma.company.update({
        where: { id: companyId },
        data: updateData,
        select: {
          id: true,
          name: true,
          domain: true,
          website: true,
          logoUrl: true,
          industry: true,
          metadata: true,
          createdAt: true,
        },
      });

      return json(updated);
    },
  );
}
