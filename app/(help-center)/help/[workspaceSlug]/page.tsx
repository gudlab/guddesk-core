import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLdScript } from "@/components/shared/json-ld";
import { canonicalUrl } from "@/lib/canonical";
import { helpRouteMetadata } from "@/lib/help-center/metadata";
import {
  getHelpWorkspaceBySlug,
  listPublishedCollections,
} from "@/lib/help-center/public";
import {
  breadcrumbListJsonLd,
  helpCenterPath,
  helpCenterTitle,
  helpMetaDescription,
} from "@/lib/help-center/seo";

type PageProps = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) return {};

  const title = helpCenterTitle(workspace.helpCenterSettings?.title, workspace.name);
  const description = helpMetaDescription(
    workspace.helpCenterSettings?.subtitle,
    `Help articles from ${workspace.name}.`,
  );
  return helpRouteMetadata({
    title,
    description,
    path: helpCenterPath({ workspaceSlug: workspace.slug }),
  });
}

export default async function HelpCenterPage({ params }: PageProps) {
  const { workspaceSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const settings = workspace.helpCenterSettings;
  const collections = await listPublishedCollections(workspace.id);
  const title = helpCenterTitle(settings?.title, workspace.name);
  const primaryColor = settings?.primaryColor ?? "#3ECF8E";
  const indexPath = helpCenterPath({ workspaceSlug: workspace.slug });

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLdScript
        data={breadcrumbListJsonLd([
          { name: title, url: canonicalUrl(indexPath) },
        ])}
      />
      <div
        className="px-4 py-16 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <h1 className="text-3xl font-bold">{title}</h1>
        {settings?.subtitle && (
          <p className="mx-auto mt-2 max-w-lg text-lg opacity-90">
            {settings.subtitle}
          </p>
        )}

        <form
          action={`/help/${workspace.slug}/search`}
          className="mx-auto mt-6 max-w-md"
        >
          <input
            type="search"
            name="q"
            placeholder="Search articles..."
            className="w-full rounded-lg px-4 py-3 text-gray-900 shadow-md outline-none"
          />
        </form>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {collections.length === 0 ? (
          <p className="text-center text-gray-500">
            No articles published yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={helpCenterPath({
                  workspaceSlug: workspace.slug,
                  collectionSlug: col.slug,
                })}
                className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {col.icon && <span className="text-2xl">{col.icon}</span>}
                <h2 className="mt-2 text-lg font-semibold">{col.name}</h2>
                {col.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {col.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  {col._count.articles} article
                  {col._count.articles !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
