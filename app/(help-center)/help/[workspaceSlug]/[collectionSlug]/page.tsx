import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { JsonLdScript } from "@/components/shared/json-ld";
import { canonicalUrl } from "@/lib/canonical";
import { helpRouteMetadata } from "@/lib/help-center/metadata";
import {
  findPublishedCollectionBySlug,
  getHelpWorkspaceBySlug,
  listPublishedArticlesInCollection,
} from "@/lib/help-center/public";
import {
  articlePublicPath,
  breadcrumbListJsonLd,
  helpCenterPath,
  helpCenterTitle,
  helpMetaDescription,
} from "@/lib/help-center/seo";

type PageProps = {
  params: Promise<{ workspaceSlug: string; collectionSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceSlug, collectionSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) return {};

  const collection = await findPublishedCollectionBySlug(
    workspace.id,
    collectionSlug,
  );
  if (!collection) return {};

  const title = helpCenterTitle(workspace.helpCenterSettings?.title, workspace.name);
  return helpRouteMetadata({
    title: `${collection.name} | ${title}`,
    description: helpMetaDescription(
      collection.description,
      `Articles in ${collection.name}.`,
    ),
    path: helpCenterPath({
      workspaceSlug: workspace.slug,
      collectionSlug: collection.slug,
    }),
  });
}

export default async function CollectionPage({ params }: PageProps) {
  const { workspaceSlug, collectionSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const collection = await findPublishedCollectionBySlug(
    workspace.id,
    collectionSlug,
  );
  if (!collection) notFound();

  const canonicalPath = helpCenterPath({
    workspaceSlug: workspace.slug,
    collectionSlug: collection.slug,
  });
  if (collectionSlug !== collection.slug) {
    redirect(canonicalPath);
  }

  const articles = await listPublishedArticlesInCollection(
    workspace.id,
    collection.id,
  );
  const title = helpCenterTitle(workspace.helpCenterSettings?.title, workspace.name);
  const primaryColor = workspace.helpCenterSettings?.primaryColor ?? "#3ECF8E";
  const indexPath = helpCenterPath({ workspaceSlug: workspace.slug });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLdScript
        data={breadcrumbListJsonLd([
          { name: title, url: canonicalUrl(indexPath) },
          { name: collection.name, url: canonicalUrl(canonicalPath) },
        ])}
      />
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
          <h1 className="mt-2 text-2xl font-bold">
            {collection.icon && <span className="mr-2">{collection.icon}</span>}
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-1 opacity-90">{collection.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {articles.length === 0 ? (
          <p className="text-center text-gray-500">
            No articles in this collection yet.
          </p>
        ) : (
          <div className="space-y-1">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={articlePublicPath(
                  workspace.slug,
                  collection.slug,
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
