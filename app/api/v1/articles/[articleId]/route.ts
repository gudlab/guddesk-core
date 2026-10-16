import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { withApiAuth, withHeaders, apiOk, apiError } from "@/lib/api-utils";

// ---------------------------------------------------------------------------
// GET /api/v1/articles/:articleId  —  Get an article
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;

  const result = await withApiAuth(req, { permission: "READ_ONLY" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
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

    if (!article || article.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Article not found", 404), rateLimitHeaders);
    }

    const { workspaceId: _ws, ...data } = article;
    return withHeaders(apiOk(data), rateLimitHeaders);
  } catch (error) {
    console.error("Get article error:", error);
    return withHeaders(apiError("Failed to get article", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/articles/:articleId  —  Update an article
// Body: { title?, slug?, body?, excerpt?, collectionId?, isPublished? }
// Requires: READ_WRITE or higher
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;

  const result = await withApiAuth(req, { permission: "READ_WRITE" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      select: { workspaceId: true, isPublished: true },
    });

    if (!existing || existing.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Article not found", 404), rateLimitHeaders);
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return withHeaders(apiError("title must be a non-empty string", 400), rateLimitHeaders);
      }
      updateData.title = body.title.trim();
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return withHeaders(apiError("slug must be a non-empty string", 400), rateLimitHeaders);
      }
      const newSlug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      // Check uniqueness
      const slugExists = await prisma.article.findUnique({
        where: {
          workspaceId_slug: {
            workspaceId: ctx.workspaceId,
            slug: newSlug,
          },
        },
        select: { id: true },
      });
      if (slugExists && slugExists.id !== articleId) {
        return withHeaders(
          apiError("An article with this slug already exists", 409),
          rateLimitHeaders,
        );
      }
      updateData.slug = newSlug;
    }

    if (body.body !== undefined) {
      if (typeof body.body !== "string") {
        return withHeaders(apiError("body must be a string", 400), rateLimitHeaders);
      }
      updateData.body = body.body;
    }

    if (body.excerpt !== undefined) {
      updateData.excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : null;
    }

    if (body.collectionId !== undefined) {
      if (body.collectionId !== null) {
        const collection = await prisma.collection.findUnique({
          where: { id: body.collectionId },
          select: { workspaceId: true },
        });
        if (!collection || collection.workspaceId !== ctx.workspaceId) {
          return withHeaders(apiError("Collection not found", 404), rateLimitHeaders);
        }
      }
      updateData.collectionId = body.collectionId;
    }

    if (body.isPublished !== undefined) {
      updateData.isPublished = Boolean(body.isPublished);
      // Set publishedAt when publishing for the first time
      if (body.isPublished && !existing.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return withHeaders(apiError("No fields to update", 400), rateLimitHeaders);
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
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
    });

    return withHeaders(apiOk(article), rateLimitHeaders);
  } catch (error) {
    console.error("Update article error:", error);
    return withHeaders(apiError("Failed to update article", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/articles/:articleId  —  Delete an article
// Requires: FULL_ACCESS
// ---------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;

  const result = await withApiAuth(req, { permission: "FULL_ACCESS" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      select: { workspaceId: true },
    });

    if (!existing || existing.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Article not found", 404), rateLimitHeaders);
    }

    await prisma.article.delete({ where: { id: articleId } });

    return withHeaders(apiOk({ deleted: true }), rateLimitHeaders);
  } catch (error) {
    console.error("Delete article error:", error);
    return withHeaders(apiError("Failed to delete article", 500), rateLimitHeaders);
  }
}
