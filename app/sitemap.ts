import { MetadataRoute } from "next";

import { allDocs, allPosts } from "contentlayer/generated";

import { getAllAlternativeSlugs } from "@/lib/alternatives";
import { getAllFeatureSlugs } from "@/lib/features";
import { getPublicHelpSitemapEntries } from "@/lib/help-center/sitemap";
import { getAllUseCaseSlugs } from "@/lib/use-cases";
import { CANONICAL_ORIGIN } from "@/lib/canonical";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = CANONICAL_ORIGIN;

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/pricing",
    "/blog",
    "/docs",
    "/integrations",
    "/roadmap",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = allPosts
    .filter((post) => post.published !== false)
    .map((post) => ({
      url: `${siteUrl}${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Documentation pages
  const docPages: MetadataRoute.Sitemap = allDocs
    .filter((doc) => doc.published !== false)
    .map((doc) => ({
      url: `${siteUrl}${doc.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Alternatives pages (programmatic SEO)
  const alternativePages: MetadataRoute.Sitemap = getAllAlternativeSlugs().map(
    (slug) => ({
      url: `${siteUrl}/alternatives/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  // Feature pages (programmatic SEO)
  const featurePages: MetadataRoute.Sitemap = getAllFeatureSlugs().map(
    (slug) => ({
      url: `${siteUrl}/features/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  // Use case pages (programmatic SEO)
  const useCasePages: MetadataRoute.Sitemap = getAllUseCaseSlugs().map(
    (slug) => ({
      url: `${siteUrl}/use-cases/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  let helpPages: MetadataRoute.Sitemap = [];
  try {
    const helpEntries = await getPublicHelpSitemapEntries();
    helpPages = helpEntries.map((entry) => ({
      url: `${siteUrl}${entry.path}`,
      lastModified: entry.lastModified,
      changeFrequency: "weekly" as const,
      priority: entry.path.split("/").length <= 3 ? 0.6 : 0.5,
    }));
  } catch {
    helpPages = [];
  }

  return [
    ...staticPages,
    ...blogPages,
    ...docPages,
    ...alternativePages,
    ...featurePages,
    ...useCasePages,
    ...helpPages,
  ];
}
