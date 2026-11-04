import { articlePublicPath } from "@/lib/help-center/seo";

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
  "about",
  "also",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "been",
  "being",
  "but",
  "by",
  "can",
  "could",
  "do",
  "does",
  "for",
  "from",
  "get",
  "got",
  "had",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "many",
  "me",
  "much",
  "my",
  "need",
  "not",
  "of",
  "on",
  "only",
  "or",
  "our",
  "please",
  "same",
  "should",
  "some",
  "than",
  "that",
  "the",
  "there",
  "these",
  "this",
  "those",
  "to",
  "too",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

/** Small paraphrase map for short/support-style queries. */
const SYNONYMS: Record<string, readonly string[]> = {
  bubble: ["launcher", "widget", "messenger"],
  cellphone: ["mobile", "phone"],
  convo: ["conversation"],
  convos: ["conversation", "conversations"],
  launcher: ["widget", "messenger"],
  messenger: ["widget"],
  mobile: ["phone"],
  phone: ["mobile", "phones"],
  phones: ["mobile", "phone"],
  teammate: ["member"],
  teammates: ["member", "members"],
};

const SNIPPET_MAX = 3000;
const SNIPPET_WINDOW = 320;
const COMPACT_TOKEN_MIN = 8;

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

type TokenGroup = {
  original: string;
  variants: string[];
};

function tokenGroups(query: string): TokenGroup[] {
  return tokenizeQuery(query).map((original) => {
    const variants: string[] = [];
    const seen = new Set<string>();
    const add = (token: string) => {
      if (token.length < 2 || STOPWORDS.has(token) || seen.has(token)) return;
      seen.add(token);
      variants.push(token);
    };
    add(original);
    for (const variant of stemVariants(original)) add(variant);
    for (const synonym of SYNONYMS[original] ?? []) add(synonym);
    return { original, variants };
  });
}

/** Query tokens plus stems and synonyms used for ranking and snippets. */
export function retrievalTokens(query: string): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const group of tokenGroups(query)) {
    for (const token of group.variants) {
      if (seen.has(token)) continue;
      seen.add(token);
      tokens.push(token);
    }
  }
  return tokens;
}

function stemVariants(token: string): string[] {
  if (token.length < 4) return [];
  const variants = new Set<string>();
  if (token.endsWith("ies") && token.length > 5) {
    variants.add(`${token.slice(0, -3)}y`);
  }
  if (token.endsWith("es") && token.length > 4) {
    variants.add(token.slice(0, -2));
  }
  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    variants.add(token.slice(0, -1));
  }
  if (token.endsWith("ing") && token.length > 5) {
    const base = token.slice(0, -3);
    variants.add(base);
    variants.add(`${base}e`);
  }
  if (token.endsWith("ed") && token.length > 4) {
    const base = token.slice(0, -2);
    variants.add(base);
    variants.add(`${base}e`);
  }
  return [...variants];
}

export function articleExcerpt(
  article: { excerpt?: string | null; body: string },
  max = SNIPPET_MAX,
  tokens: string[] = [],
): string {
  return articleSnippet(article, tokens, max);
}

/** Body-first snippet. SEO excerpts are a fallback, not the grounded text. */
export function articleSnippet(
  article: { excerpt?: string | null; body: string },
  tokens: string[] = [],
  max = SNIPPET_MAX,
): string {
  const body = normalizeSpace(article.body);
  const excerpt = normalizeSpace(article.excerpt ?? "");
  const text = body || excerpt;
  if (!text) return "";
  if (text.length <= max) return text;
  const windows = matchWindows(text, tokens);
  if (windows.length === 0) return clip(text, max);
  const merged: Array<{ start: number; end: number }> = [];
  for (const window of windows) {
    const last = merged[merged.length - 1];
    if (last && window.start <= last.end) {
      last.end = Math.max(last.end, window.end);
    } else {
      merged.push({ ...window });
    }
  }
  const snippet = merged
    .map((window) => text.slice(window.start, window.end).trim())
    .filter(Boolean)
    .join(" … ");
  return snippet.length <= max ? snippet : clip(snippet, max);
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function matchWindows(
  text: string,
  tokens: string[],
): Array<{ start: number; end: number }> {
  const windows: Array<{ start: number; end: number }> = [];
  const lower = text.toLowerCase();
  for (const token of tokens) {
    const needle = token.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx < 0) break;
      if (isTokenIndex(text, idx, token.length)) {
        windows.push({
          start: Math.max(0, idx - SNIPPET_WINDOW),
          end: Math.min(text.length, idx + token.length + SNIPPET_WINDOW),
        });
      }
      from = idx + Math.max(1, token.length);
    }
  }
  windows.sort((a, b) => a.start - b.start || a.end - b.end);
  return windows;
}

function isTokenIndex(text: string, idx: number, length: number): boolean {
  const prev = idx === 0 ? "" : text[idx - 1] ?? "";
  const at = text[idx] ?? "";
  const boundary = idx === 0 || /[^a-z0-9]/i.test(prev);
  if (length < 4) {
    const next = text[idx + length] ?? "";
    return boundary && (next === "" || /[^a-z0-9]/i.test(next));
  }
  const camel =
    idx > 0 && /[a-z]/.test(prev) && /[A-Z]/.test(at);
  return boundary || camel;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `token` starts a word in `text` ("refund" matches "Refunds"). */
export function containsToken(text: string, token: string): boolean {
  if (token.length < 4) {
    return new RegExp(
      `(?:^|[^a-z0-9])${escapeRegExp(token)}(?:[^a-z0-9]|$)`,
      "i",
    ).test(text);
  }
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(token)}`, "i").test(text);
}

function splitIdentifiers(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
}

function extractAcronyms(text: string): string {
  const acronyms: string[] = [];
  const words = text.split(/[^A-Za-z0-9]+/);
  let run: string[] = [];
  const flush = () => {
    if (run.length >= 3) {
      acronyms.push(run.map((word) => word[0]).join(""));
    }
    run = [];
  };
  for (const word of words) {
    if (/^[A-Z][a-zA-Z0-9]*$/.test(word) && /[a-z]/.test(word)) {
      run.push(word);
    } else {
      flush();
    }
  }
  flush();
  return acronyms.join(" ");
}

function searchableText(text: string): string {
  return `${text} ${splitIdentifiers(text)} ${extractAcronyms(text)}`;
}

function compact(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function tokenHitScore(
  title: string,
  body: string,
  compactTitle: string,
  compactBody: string,
  token: string,
  original: boolean,
): number {
  const titlePts = original ? 4 : 2;
  const bodyPts = original ? 2 : 1;
  const compactHit = token.length >= COMPACT_TOKEN_MIN;
  if (
    containsToken(title, token) ||
    (compactHit && compactTitle.includes(token))
  ) {
    return titlePts;
  }
  if (
    containsToken(body, token) ||
    (compactHit && compactBody.includes(token))
  ) {
    return bodyPts;
  }
  return 0;
}

export function scoreArticle(
  article: Pick<RetrievableArticle, "title" | "body" | "excerpt">,
  tokens: string[],
  query?: string,
): number {
  const groups = query ? tokenGroups(query) : tokens.map((token) => ({
    original: token,
    variants: [token],
  }));
  if (groups.length === 0) return 0;
  const title = searchableText(article.title);
  const body = searchableText(`${article.excerpt ?? ""} ${article.body}`);
  const compactTitle = compact(article.title);
  const compactBody = compact(
    `${article.title} ${article.excerpt ?? ""} ${article.body}`,
  );
  let score = 0;
  for (const group of groups) {
    let best = 0;
    for (const token of group.variants) {
      const pts = tokenHitScore(
        title,
        body,
        compactTitle,
        compactBody,
        token,
        token === group.original,
      );
      if (pts > best) best = pts;
    }
    score += best;
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
  const tokens = retrievalTokens(query);
  return articles
    .filter((article) => article.isPublished)
    .map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: articleSnippet(article, tokens),
      slug: article.slug,
      collectionSlug: article.collectionSlug,
      score: scoreArticle(article, tokens, query),
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
  return `${base}${articlePublicPath(workspaceSlug, article.collectionSlug, article.slug)}`;
}
