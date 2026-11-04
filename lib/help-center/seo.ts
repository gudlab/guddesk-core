/**
 * Help center metadata, public paths, JSON-LD, and sitemap URL builders.
 *
 * Mirror to gudlab/guddesk-core as lib/help-center/seo.ts
 */

import { FALLBACK_COLLECTION_SLUG } from "./slug";

export function helpCenterPath(parts: {
  workspaceSlug: string;
  collectionSlug?: string;
  articleSlug?: string;
}): string {
  const segments = [parts.workspaceSlug];
  if (parts.collectionSlug) segments.push(parts.collectionSlug);
  if (parts.articleSlug) segments.push(parts.articleSlug);
  return `/help/${segments.join("/")}`;
}

export function articlePublicPath(
  workspaceSlug: string,
  collectionSlug: string | null | undefined,
  articleSlug: string,
): string {
  return helpCenterPath({
    workspaceSlug,
    collectionSlug: collectionSlug || FALLBACK_COLLECTION_SLUG,
    articleSlug,
  });
}

export function helpCenterTitle(
  settingsTitle: string | null | undefined,
  workspaceName: string,
): string {
  const titled = settingsTitle?.trim();
  return titled || `${workspaceName} Help Center`;
}

export function helpMetaDescription(
  text: string | null | undefined,
  fallback: string,
  max = 160,
): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  const source = flat || fallback.replace(/\s+/g, " ").trim();
  if (source.length <= max) return source;
  return `${source.slice(0, max - 1).trimEnd()}…`;
}

const QUESTION_WORDS =
  /^(how|what|why|when|where|who|which|can|could|do|does|did|is|are|was|were|should|will|would|may|might)\b/i;

function stripQuestionMarkup(line: string): string {
  return line
    .trim()
    .replace(/^#{1,3}\s+/, "")
    .replace(/^q:\s+/i, "")
    .replace(/^\*\*(.+)\*\*$/s, "$1")
    .trim();
}

/** A heading-style question, not a question buried in a paragraph. */
export function questionHeading(line: string): string | null {
  const stripped = stripQuestionMarkup(line);
  if (!stripped.endsWith("?")) return null;
  if (stripped.length > 140 || stripped.length < 8) return null;
  if (stripped.includes(". ")) return null;
  const raw = line.trim();
  const markedUp =
    /^#{1,3}\s+/.test(raw) || /^q:\s+/i.test(raw) || /^\*\*.+\*\*$/.test(raw);
  if (!markedUp && !QUESTION_WORDS.test(stripped)) return null;
  return stripped;
}

/**
 * FAQPage pairs only when the body is clearly Q&A: optional intro, then
 * question headings each followed by an answer. Skip mixed/narrative articles.
 */
export function extractFaqPairs(
  body: string,
): { question: string; answer: string }[] {
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .flatMap((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length === 0) return [];
      if (lines.length === 1) return lines;

      const parts: string[] = [];
      let current: string[] = [];
      for (const line of lines) {
        if (questionHeading(line)) {
          if (current.length > 0) {
            parts.push(current.join(" "));
            current = [];
          }
          parts.push(line);
        } else {
          current.push(line);
        }
      }
      if (current.length > 0) parts.push(current.join(" "));
      return parts.length > 0 ? parts : [lines.join(" ")];
    })
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length < 4) return [];

  let index = 0;
  if (!questionHeading(blocks[0] ?? "")) {
    index = 1;
  }

  const pairs: { question: string; answer: string }[] = [];
  while (index < blocks.length) {
    const question = questionHeading(blocks[index] ?? "");
    if (!question) return [];
    index += 1;
    const answerParts: string[] = [];
    while (index < blocks.length && !questionHeading(blocks[index] ?? "")) {
      answerParts.push(blocks[index]!);
      index += 1;
    }
    const answer = answerParts.join(" ").replace(/\s+/g, " ").trim();
    if (!answer) return [];
    pairs.push({ question, answer });
  }

  return pairs.length >= 2 ? pairs : [];
}

function isoDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function articleJsonLd(input: {
  url: string;
  headline: string;
  description: string;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string | null;
  publisherName: string;
}): Record<string, unknown> {
  const datePublished = isoDate(input.datePublished);
  const dateModified = isoDate(input.dateModified) ?? datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@type": "Organization", name: input.publisherName },
    publisher: {
      "@type": "Organization",
      name: input.publisherName,
    },
  };
}

export function faqPageJsonLd(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> | null {
  if (faqs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbListJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type PublicHelpArticle = {
  slug: string;
  isPublished: boolean;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type PublicHelpCollection = {
  slug: string;
  isPublished: boolean;
  updatedAt: Date;
  articles: PublicHelpArticle[];
};

export type PublicHelpWorkspace = {
  slug: string;
  updatedAt: Date;
  collections: PublicHelpCollection[];
};

export type HelpSitemapEntry = {
  path: string;
  lastModified: Date;
};

/** Build sitemap paths from already-filtered public help data. Drafts stay out. */
export function publicHelpSitemapEntries(
  workspaces: PublicHelpWorkspace[],
): HelpSitemapEntry[] {
  const entries: HelpSitemapEntry[] = [];

  for (const workspace of workspaces) {
    const publishedCollections = workspace.collections.filter(
      (collection) => collection.isPublished,
    );
    if (publishedCollections.length === 0) continue;

    let workspaceModified = workspace.updatedAt;
    const collectionEntries: HelpSitemapEntry[] = [];

    for (const collection of publishedCollections) {
      let collectionModified = collection.updatedAt;
      for (const article of collection.articles) {
        if (!article.isPublished) continue;
        const lastModified = article.updatedAt;
        if (lastModified > collectionModified)
          collectionModified = lastModified;
        if (lastModified > workspaceModified) workspaceModified = lastModified;
        collectionEntries.push({
          path: articlePublicPath(
            workspace.slug,
            collection.slug,
            article.slug,
          ),
          lastModified,
        });
      }
      if (collectionModified > workspaceModified) {
        workspaceModified = collectionModified;
      }
      collectionEntries.unshift({
        path: helpCenterPath({
          workspaceSlug: workspace.slug,
          collectionSlug: collection.slug,
        }),
        lastModified: collectionModified,
      });
    }

    entries.push({
      path: helpCenterPath({ workspaceSlug: workspace.slug }),
      lastModified: workspaceModified,
    });
    entries.push(...collectionEntries);
  }

  return entries;
}
