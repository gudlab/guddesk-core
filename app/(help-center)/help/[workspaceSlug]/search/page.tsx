import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { helpRouteMetadata } from "@/lib/help-center/metadata";
import {
  getHelpWorkspaceBySlug,
  searchPublishedArticles,
} from "@/lib/help-center/public";
import {
  articlePublicPath,
  helpCenterPath,
  helpCenterTitle,
} from "@/lib/help-center/seo";

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) return {};

  const title = helpCenterTitle(workspace.helpCenterSettings?.title, workspace.name);
  return helpRouteMetadata({
    title: `Search | ${title}`,
    description: `Search articles in ${title}.`,
    path: `${helpCenterPath({ workspaceSlug: workspace.slug })}/search`,
    noIndex: true,
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: PageProps) {
  const { workspaceSlug } = await params;
  const { q } = await searchParams;

  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const query = q?.trim() ?? "";
  const articles = query
    ? await searchPublishedArticles(workspace.id, query)
    : [];

  const primaryColor = workspace.helpCenterSettings?.primaryColor ?? "#3ECF8E";
  const indexPath = helpCenterPath({ workspaceSlug: workspace.slug });

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="px-4 py-10 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href={indexPath}
            className="text-sm opacity-80 hover:opacity-100"
          >
            &larr; Back to Help Center
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Search Results</h1>
          <form action={`${indexPath}/search`} className="mt-4">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              className="w-full rounded-lg px-4 py-3 text-gray-900 shadow-md outline-none"
            />
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {!query ? (
          <p className="text-center text-gray-500">
            Enter a search term to find articles.
          </p>
        ) : articles.length === 0 ? (
          <p className="text-center text-gray-500">
            No articles found for &quot;{query}&quot;
          </p>
        ) : (
          <div className="space-y-2">
            <p className="mb-4 text-sm text-gray-500">
              {articles.length} result{articles.length !== 1 ? "s" : ""} for
              &quot;{query}&quot;
            </p>
            {articles.map((article) => (
              <Link
                key={article.id}
                href={articlePublicPath(
                  workspace.slug,
                  article.collection?.slug,
                  article.slug,
                )}
                className="block rounded-lg border bg-white px-5 py-4 transition-shadow hover:shadow-sm"
              >
                <h3 className="font-medium text-gray-900">{article.title}</h3>
                {article.excerpt && (
                  <p className="mt-1 text-sm text-gray-500">
                    {article.excerpt}
                  </p>
                )}
                {article.collection && (
                  <span className="mt-2 inline-block text-xs text-gray-400">
                    {article.collection.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
