import { prisma } from "@/lib/db";

import { publicHelpSitemapEntries, type HelpSitemapEntry } from "./seo";

/** Published help indexes, collections, and articles only. Drafts stay out. */
export async function getPublicHelpSitemapEntries(): Promise<HelpSitemapEntry[]> {
  const workspaces = await prisma.workspace.findMany({
    where: {
      collections: { some: { isPublished: true } },
    },
    select: {
      slug: true,
      updatedAt: true,
      collections: {
        where: { isPublished: true },
        select: {
          slug: true,
          isPublished: true,
          updatedAt: true,
          articles: {
            where: { isPublished: true },
            select: {
              slug: true,
              isPublished: true,
              updatedAt: true,
              publishedAt: true,
            },
          },
        },
      },
    },
  });
  return publicHelpSitemapEntries(workspaces);
}
