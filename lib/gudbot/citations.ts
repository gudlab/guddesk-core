import type { RankedArticle } from "./retrieve";

export interface Citation {
  type: "article";
  id: string;
  title: string;
  url: string | null;
  score: number;
}

export function sanitizeCitationIds(
  citedIds: string[],
  retrievedIds: string[],
): string[] {
  const allowed = new Set(retrievedIds);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const id of citedIds) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function citationsFromRetrieved(
  citedIds: string[],
  retrieved: RankedArticle[],
  urls: Map<string, string | null> = new Map(),
): Citation[] {
  const allowed = sanitizeCitationIds(
    citedIds,
    retrieved.map((article) => article.id),
  );
  const byId = new Map(retrieved.map((article) => [article.id, article]));
  return allowed.flatMap((id) => {
    const article = byId.get(id);
    if (!article) return [];
    return [
      {
        type: "article" as const,
        id: article.id,
        title: article.title,
        url: urls.get(article.id) ?? null,
        score: article.score,
      },
    ];
  });
}

export function formatBotBody(text: string, citations: Citation[]): string {
  const trimmed = text.trim();
  if (citations.length === 0) return trimmed;
  const lines = citations.map((citation) => {
    if (citation.url) return `- ${citation.title}\n  ${citation.url}`;
    return `- ${citation.title}`;
  });
  return `${trimmed}\n\nSources:\n${lines.join("\n")}`;
}
