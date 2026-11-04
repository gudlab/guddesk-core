import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArticleFeedbackButtons } from "@/components/articles/article-feedback-buttons";
import { JsonLdScript } from "@/components/shared/json-ld";
import { canonicalUrl } from "@/lib/canonical";
import { helpRouteMetadata } from "@/lib/help-center/metadata";
import {
  findPublishedArticleBySlug,
  getHelpWorkspaceBySlug,
  incrementArticleViews,
} from "@/lib/help-center/public";
import { FALLBACK_COLLECTION_SLUG } from "@/lib/help-center/slug";
import {
  articleJsonLd,
  articlePublicPath,
  breadcrumbListJsonLd,
  extractFaqPairs,
  faqPageJsonLd,
  helpCenterPath,
  helpCenterTitle,
  helpMetaDescription,
} from "@/lib/help-center/seo";

type PageProps = {
  params: Promise<{
    workspaceSlug: string;
    collectionSlug: string;
    articleSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceSlug, articleSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) return {};

  const article = await findPublishedArticleBySlug(workspace.id, articleSlug);
  if (!article) return {};

  const title = helpCenterTitle(workspace.helpCenterSettings?.title, workspace.name);
  const description = helpMetaDescription(
    article.excerpt,
    article.body,
  );
  return helpRouteMetadata({
    title: `${article.title} | ${title}`,
    description,
    path: articlePublicPath(
      workspace.slug,
      article.collection?.slug,
      article.slug,
    ),
    article: {
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      authorName: article.author?.name,
    },
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { workspaceSlug, collectionSlug, articleSlug } = await params;
  const workspace = await getHelpWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const article = await findPublishedArticleBySlug(workspace.id, articleSlug);
  if (!article) notFound();

  const canonicalPath = articlePublicPath(
    workspace.slug,
    article.collection?.slug,
    article.slug,
  );
  if (
    articleSlug !== article.slug ||
    collectionSlug !== (article.collection?.slug ?? FALLBACK_COLLECTION_SLUG)
  ) {
    redirect(canonicalPath);
  }

  await incrementArticleViews(article.id);

  const helpTitle = helpCenterTitle(
    workspace.helpCenterSettings?.title,
    workspace.name,
  );
  const description = helpMetaDescription(article.excerpt, article.body);
  const primaryColor = workspace.helpCenterSettings?.primaryColor ?? "#3ECF8E";
  const indexPath = helpCenterPath({ workspaceSlug: workspace.slug });
  const collectionPath = article.collection
    ? helpCenterPath({
        workspaceSlug: workspace.slug,
        collectionSlug: article.collection.slug,
      })
    : null;
  const canonical = canonicalUrl(canonicalPath);
  const faqs = extractFaqPairs(article.body);

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLdScript
        data={articleJsonLd({
          url: canonical,
          headline: article.title,
          description,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          authorName: article.author?.name,
          publisherName: workspace.name,
        })}
      />
      <JsonLdScript data={faqPageJsonLd(faqs)} />
      <JsonLdScript
        data={breadcrumbListJsonLd([
          { name: helpTitle, url: canonicalUrl(indexPath) },
          ...(article.collection && collectionPath
            ? [{ name: article.collection.name, url: canonicalUrl(collectionPath) }]
            : []),
          { name: article.title, url: canonical },
        ])}
      />
      <div
        className="px-4 py-6 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Link href={indexPath} className="hover:opacity-100">
              Help Center
            </Link>
            <span>/</span>
            {article.collection && collectionPath && (
              <>
                <Link href={collectionPath} className="hover:opacity-100">
                  {article.collection.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="truncate">{article.title}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <article className="rounded-lg border bg-white px-8 py-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            {article.author?.name && <span>By {article.author.name}</span>}
            {article.publishedAt && (
              <span>
                Published{" "}
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="prose prose-gray mt-6 max-w-none">
            {article.body.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="mt-6 rounded-lg border bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            Was this article helpful?
          </p>
          <ArticleFeedbackButtons articleId={article.id} />
        </div>
      </div>
    </div>
  );
}
