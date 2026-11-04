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
// Register article tools
// ---------------------------------------------------------------------------

export function registerArticleTools(server: McpServer, auth: McpAuthContext) {
  // ── list_articles ───────────────────────────────────────────────────────
  server.registerTool(
    "list_articles",
    {
      description:
        "List knowledge base articles. Optionally filter by collection or publication status.",
      inputSchema: {
        collectionId: z.string().optional().describe("Filter by collection ID"),
        published: z.boolean().optional().describe("Filter by published status"),
        limit: z.number().min(1).max(100).optional().describe("Max results (default 25)"),
        cursor: z.string().optional().describe("Cursor for pagination"),
      },
    },
    async ({ collectionId, published, limit: rawLimit, cursor }) => {
      const limit = rawLimit ?? 25;
      const where: Record<string, unknown> = { workspaceId: auth.workspaceId };
      if (collectionId) where.collectionId = collectionId;
      if (published !== undefined) where.isPublished = published;

      const findArgs: Record<string, unknown> = {
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          isPublished: true,
          publishedAt: true,
          viewCount: true,
          helpfulCount: true,
          notHelpfulCount: true,
          createdAt: true,
          updatedAt: true,
          collection: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit + 1,
      };

      if (cursor) {
        findArgs.cursor = { id: cursor };
        findArgs.skip = 1;
      }

      const rows = await prisma.article.findMany(findArgs as Parameters<typeof prisma.article.findMany>[0]);
      const hasNext = rows.length > limit;
      const items = hasNext ? rows.slice(0, limit) : rows;
      const nextCursor = hasNext ? items[items.length - 1].id : null;

      return json({ items, nextCursor });
    },
  );

  // ── get_article ─────────────────────────────────────────────────────────
  server.registerTool(
    "get_article",
    {
      description: "Get a knowledge base article's full content by ID.",
      inputSchema: {
        articleId: z.string().describe("The article ID"),
      },
    },
    async ({ articleId }) => {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: {
          id: true,
          workspaceId: true,
          title: true,
          slug: true,
          body: true,
          excerpt: true,
          isPublished: true,
          publishedAt: true,
          viewCount: true,
          helpfulCount: true,
          notHelpfulCount: true,
          createdAt: true,
          updatedAt: true,
          collection: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      if (!article || article.workspaceId !== auth.workspaceId) {
        return json({ error: "Article not found" });
      }

      const { workspaceId: _ws, ...data } = article;
      return json(data);
    },
  );

  // ── search_articles ─────────────────────────────────────────────────────
  server.registerTool(
    "search_articles",
    {
      description:
        "Search knowledge base articles by title or content. Returns published articles matching the query.",
      inputSchema: {
        query: z.string().min(1).describe("Search query string"),
        limit: z.number().min(1).max(50).optional().describe("Max results (default 10)"),
      },
    },
    async ({ query, limit: rawLimit }) => {
      const limit = rawLimit ?? 10;

      // Use Prisma's contains for simple text search
      // In production this could use full-text search or a dedicated search engine
      const articles = await prisma.article.findMany({
        where: {
          workspaceId: auth.workspaceId,
          isPublished: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
          collection: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });

      return json({ items: articles, total: articles.length });
    },
  );
}
