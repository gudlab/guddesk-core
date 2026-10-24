/**
 * Cursor pagination helpers shared by the inbox conversation list, the
 * widget message history and the MCP list tools.
 *
 * Prisma 7.4.0 and 7.4.1 returned an empty page for a cursor query in some
 * cases (prisma/prisma#29176, fixed in 7.4.1; prisma/prisma#29254, a query
 * plan cache bug that broke the second and later cursor pages, fixed in
 * 7.4.2). That is an engine bug and the fix is the version bump; these
 * helpers only keep the page arguments in one place so they can be tested.
 */

export interface CursorPageArgs {
  take: number;
  cursor?: { id: string };
  skip?: number;
}

/**
 * findMany pagination arguments: `take` rows (plus one extra when
 * `lookahead` is set, to tell whether there is a next page), starting after
 * the row with id `cursor`.
 */
export function cursorPageArgs(
  cursor: string | null | undefined,
  limit: number,
  options: { lookahead?: boolean } = {},
): CursorPageArgs {
  const take = options.lookahead ? limit + 1 : limit;
  return cursor ? { take, cursor: { id: cursor }, skip: 1 } : { take };
}

/** Splits a lookahead result into the page, hasMore and the next cursor. */
export function splitCursorPage<T extends { id: string }>(
  rows: T[],
  limit: number,
): { items: T[]; hasMore: boolean; nextCursor: string | null } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items,
    hasMore,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}
