export interface RetrievableArticle {
  id: string;
  title: string;
  body: string;
  excerpt: string | null;
  slug: string;
  isPublished: boolean;
  collectionSlug: string | null;
}

export interface RankedArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  collectionSlug: string | null;
  score: number;
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "do",
  "for",
  "from",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "please",
  "the",
  "to",
  "we",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

export function tokenizeQuery(query: string): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const raw of query.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw) || seen.has(raw)) continue;
    seen.add(raw);
    tokens.push(raw);
  }
  return tokens;
}

export function articleExcerpt(
  article: { excerpt?: string | null; body: string },
  max = 800,
): string {
  const text = (article.excerpt?.trim() || article.body)
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `token` starts a word in `text` ("refund" matches "Refunds"). */
export function containsToken(text: string, token: string): boolean {
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(token)}`, "i").test(text);
}

export function scoreArticle(
  article: Pick<RetrievableArticle, "title" | "body" | "excerpt">,
  tokens: string[],
): number {
  if (tokens.length === 0) return 0;
  const title = article.title;
  const body = `${article.excerpt ?? ""} ${article.body}`;
  let score = 0;
  for (const token of tokens) {
    if (containsToken(title, token)) score += 3;
    else if (containsToken(body, token)) score += 1;
  }
  return score;
}

/** Prisma `where` that can only return published articles for a workspace. */
export function publishedArticleWhere(
  workspaceId: string,
  tokens: string[],
): {
  workspaceId: string;
  isPublished: true;
  OR?: Array<
    | { title: { contains: string; mode: "insensitive" } }
    | { body: { contains: string; mode: "insensitive" } }
    | { excerpt: { contains: string; mode: "insensitive" } }
  >;
} {
  const where: {
    workspaceId: string;
    isPublished: true;
    OR?: Array<
      | { title: { contains: string; mode: "insensitive" } }
      | { body: { contains: string; mode: "insensitive" } }
      | { excerpt: { contains: string; mode: "insensitive" } }
    >;
  } = {
    workspaceId,
    isPublished: true,
  };
  if (tokens.length > 0) {
    where.OR = tokens.flatMap((token) => [
      { title: { contains: token, mode: "insensitive" as const } },
      { body: { contains: token, mode: "insensitive" as const } },
      { excerpt: { contains: token, mode: "insensitive" as const } },
    ]);
  }
  return where;
}

export function rankPublishedArticles(
  articles: RetrievableArticle[],
  query: string,
  limit = 5,
): RankedArticle[] {
  const tokens = tokenizeQuery(query);
  return articles
    .filter((article) => article.isPublished)
    .map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: articleExcerpt(article),
      slug: article.slug,
      collectionSlug: article.collectionSlug,
      score: scoreArticle(article, tokens),
    }))
    .filter((article) => (tokens.length === 0 ? false : article.score > 0))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function helpCenterArticleUrl(
  appUrl: string,
  workspaceSlug: string,
  article: Pick<RankedArticle, "slug" | "collectionSlug">,
): string | null {
  if (!article.collectionSlug) return null;
  const base = appUrl.replace(/\/+$/, "");
  return `${base}/help/${workspaceSlug}/${article.collectionSlug}/${article.slug}`;
}
