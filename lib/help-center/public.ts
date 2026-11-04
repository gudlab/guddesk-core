import { cache } from "react";

import { prisma } from "@/lib/db";

import { HELP_SLUG_MAX, pickBySlugPreference, slugLookupCandidates } from "./slug";

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  helpCenterSettings: true,
} as const;

export const getHelpWorkspaceBySlug = cache(async (workspaceSlug: string) => {
  return prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: workspaceSelect,
  });
});

export const findPublishedArticleBySlug = cache(
  async (workspaceId: string, articleSlug: string) => {
    const candidates = slugLookupCandidates(articleSlug, HELP_SLUG_MAX.article);
    const rows = await prisma.article.findMany({
      where: {
        workspaceId,
        isPublished: true,
        slug: { in: candidates },
      },
      include: {
        author: { select: { name: true } },
        collection: { select: { name: true, slug: true } },
      },
    });
    return pickBySlugPreference(rows, candidates);
  },
);

export const findPublishedCollectionBySlug = cache(
  async (workspaceId: string, collectionSlug: string) => {
    const candidates = slugLookupCandidates(
      collectionSlug,
      HELP_SLUG_MAX.collection,
    );
    const rows = await prisma.collection.findMany({
      where: {
        workspaceId,
        isPublished: true,
        slug: { in: candidates },
      },
    });
    return pickBySlugPreference(rows, candidates);
  },
);

export const listPublishedCollections = cache(async (workspaceId: string) => {
  return prisma.collection.findMany({
    where: { workspaceId, isPublished: true },
    include: {
      _count: { select: { articles: { where: { isPublished: true } } } },
    },
    orderBy: { order: "asc" },
  });
});

export const listPublishedArticlesInCollection = cache(
  async (workspaceId: string, collectionId: string) => {
    return prisma.article.findMany({
      where: {
        workspaceId,
        collectionId,
        isPublished: true,
      },
      select: { id: true, title: true, slug: true, excerpt: true },
      orderBy: { order: "asc" },
    });
  },
);

export async function searchPublishedArticles(
  workspaceId: string,
  query: string,
) {
  return prisma.article.findMany({
    where: {
      workspaceId,
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      collection: { select: { slug: true, name: true } },
    },
    take: 20,
  });
}

export async function incrementArticleViews(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });
}
