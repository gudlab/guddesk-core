"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace";
import { articleSchema } from "@/lib/validations/article";
import { HELP_SLUG_MAX, isUrlSafeSlug, nextStoredSlug } from "@/lib/help-center/slug";
import { revalidatePath } from "next/cache";

export async function createArticle(
  workspaceId: string,
  data: {
    title: string;
    slug: string;
    body: string;
    excerpt?: string;
    collectionId: string | null;
  },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN", "AGENT"]);

    const validated = articleSchema.parse(data);

    // Check slug uniqueness within workspace
    const existing = await prisma.article.findUnique({
      where: { workspaceId_slug: { workspaceId, slug: validated.slug } },
    });
    if (existing) {
      return { status: "error" as const, message: "An article with this slug already exists" };
    }

    // Get max order for the collection
    const maxOrder = await prisma.article.aggregate({
      where: { workspaceId, collectionId: validated.collectionId },
      _max: { order: true },
    });

    const article = await prisma.article.create({
      data: {
        workspaceId,
        title: validated.title,
        slug: validated.slug,
        body: validated.body,
        excerpt: validated.excerpt ?? null,
        collectionId: validated.collectionId,
        authorId: session.user.id,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidatePath(`/workspace`);
    return { status: "success" as const, id: article.id };
  } catch (error) {
    console.error("Create article error:", error);
    return { status: "error" as const, message: "Failed to create article" };
  }
}

export async function updateArticle(
  articleId: string,
  data: {
    title?: string;
    slug?: string;
    body?: string;
    excerpt?: string;
    collectionId?: string | null;
  },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { workspaceId: true, slug: true },
    });
    if (!article) {
      return { status: "error" as const, message: "Article not found" };
    }

    await requireWorkspaceRole(article.workspaceId, session.user.id, ["OWNER", "ADMIN", "AGENT"]);

    let nextSlug = article.slug;
    if (data.slug !== undefined) {
      nextSlug = nextStoredSlug(data.slug, article.slug, HELP_SLUG_MAX.article);
      if (!isUrlSafeSlug(nextSlug)) {
        return { status: "error" as const, message: "Slug must be lowercase letters, numbers, and hyphens" };
      }
      if (nextSlug !== article.slug) {
        const existing = await prisma.article.findUnique({
          where: { workspaceId_slug: { workspaceId: article.workspaceId, slug: nextSlug } },
        });
        if (existing) {
          return { status: "error" as const, message: "Slug already in use" };
        }
      }
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: nextSlug }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.collectionId !== undefined && { collectionId: data.collectionId }),
      },
    });

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Update article error:", error);
    return { status: "error" as const, message: "Failed to update article" };
  }
}

export async function publishArticle(articleId: string, publish: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { workspaceId: true },
    });
    if (!article) {
      return { status: "error" as const, message: "Article not found" };
    }

    await requireWorkspaceRole(article.workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    await prisma.article.update({
      where: { id: articleId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    revalidatePath(`/workspace`);
    revalidatePath(`/help`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Publish article error:", error);
    return { status: "error" as const, message: "Failed to publish article" };
  }
}

export async function deleteArticle(articleId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { workspaceId: true },
    });
    if (!article) {
      return { status: "error" as const, message: "Article not found" };
    }

    await requireWorkspaceRole(article.workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    await prisma.article.delete({ where: { id: articleId } });

    revalidatePath(`/workspace`);
    revalidatePath(`/help`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Delete article error:", error);
    return { status: "error" as const, message: "Failed to delete article" };
  }
}
