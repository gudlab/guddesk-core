/**
 * URL-safe slugs for public help center articles and collections.
 *
 * Mirror to gudlab/guddesk-core as lib/help-center/slug.ts
 */

export const HELP_SLUG_MAX = {
  article: 200,
  collection: 100,
  generated: 80,
} as const;

/** Shadows the /help/[workspaceSlug]/search route. */
export const RESERVED_COLLECTION_SLUGS = new Set(["search"]);

/** Public URL segment when an article has no collection. */
export const FALLBACK_COLLECTION_SLUG = "uncategorized";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(
  value: string,
  maxLength: number = HELP_SLUG_MAX.generated,
): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug;
}

export function isUrlSafeSlug(value: string): boolean {
  return value.length > 0 && SAFE_SLUG.test(value);
}

export function isReservedCollectionSlug(slug: string): boolean {
  return RESERVED_COLLECTION_SLUGS.has(slug);
}

export function slugify(
  value: string,
  fallback: string,
  maxLength: number = HELP_SLUG_MAX.generated,
): string {
  return normalizeSlug(value, maxLength) || fallback;
}

export function generateArticleSlug(title: string): string {
  return slugify(title, "article", HELP_SLUG_MAX.article);
}

export function generateCollectionSlug(name: string): string {
  const slug = slugify(name, "collection", HELP_SLUG_MAX.collection);
  return isReservedCollectionSlug(slug) ? `${slug}-collection` : slug;
}

export async function uniqueSlug(
  base: string,
  taken: (slug: string) => Promise<boolean>,
  reserved: ReadonlySet<string> = new Set(),
): Promise<string> {
  const isTaken = async (slug: string) =>
    reserved.has(slug) || (await taken(slug));
  if (!(await isTaken(base))) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`.slice(0, 100);
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Slugs to try when resolving a public URL. Exact stored slugs stay first
 * so older published URLs keep working after tighter normalization.
 */
export function slugLookupCandidates(
  requested: string,
  maxLength: number = HELP_SLUG_MAX.article,
): string[] {
  const lower = requested.toLowerCase();
  const normalized = normalizeSlug(requested, maxLength);
  const out: string[] = [];
  for (const candidate of [requested, lower, normalized]) {
    if (candidate && !out.includes(candidate)) out.push(candidate);
  }
  return out;
}

/** Keep a stored slug when the editor resubmits it unchanged. */
export function nextStoredSlug(
  incoming: string,
  existing: string | undefined,
  maxLength: number,
): string {
  if (existing !== undefined && incoming === existing) return existing;
  return normalizeSlug(incoming, maxLength);
}

/** Prefer the exact requested slug over a normalized neighbor. */
export function pickBySlugPreference<T extends { slug: string }>(
  rows: T[],
  candidates: string[],
): T | null {
  for (const candidate of candidates) {
    const match = rows.find((row) => row.slug === candidate);
    if (match) return match;
  }
  return null;
}
