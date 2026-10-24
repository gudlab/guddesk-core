import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { cursorPageArgs, splitCursorPage, type CursorPageArgs } from "./pagination";

/**
 * What these tests prove, and what they don't.
 *
 * The empty "Load more" page came from a Prisma engine bug (7.4.0 and
 * 7.4.1, prisma/prisma#29176 and #29254). A unit test can't run the Prisma
 * query engine, so it can't reproduce that bug. These tests check two
 * things instead:
 * 1. The installed Prisma packages are a fixed release (7.4.2 or later),
 *    read from package.json and pnpm-lock.yaml.
 * 2. The cursor arguments our routes build walk every row exactly once,
 *    page 2 included, when the database applies them the way Postgres and
 *    a working Prisma do (in-memory reference below).
 */

const MIN_FIXED = [7, 4, 2] as const;

function atLeast(version: string, min: readonly number[]) {
  const parts = version.split(".").map((p) => parseInt(p, 10));
  for (let i = 0; i < min.length; i++) {
    if ((parts[i] ?? 0) > min[i]) return true;
    if ((parts[i] ?? 0) < min[i]) return false;
  }
  return true;
}

describe("Prisma version", () => {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  const lock = readFileSync(join(process.cwd(), "pnpm-lock.yaml"), "utf8");
  const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;

  for (const name of ["prisma", "@prisma/client", "@prisma/adapter-pg"]) {
    it(`${name} is pinned to a release with the cursor fixes`, () => {
      const spec = deps[name];
      assert.ok(spec, `${name} is a dependency`);
      assert.ok(atLeast(spec.replace(/^[\^~]/, ""), MIN_FIXED), `${name}@${spec}`);
    });

    it(`the lockfile resolves ${name} to 7.4.2 or later, and never 7.4.0 or 7.4.1`, () => {
      const escaped = name.replace(/[/@]/g, (c) => `\\${c}`);
      const resolved = [...lock.matchAll(new RegExp(`^  '?${escaped}@(\\d+\\.\\d+\\.\\d+)`, "gm"))].map(
        (m) => m[1],
      );
      assert.ok(resolved.length > 0, `${name} is in the lockfile`);
      for (const version of resolved) assert.ok(atLeast(version, MIN_FIXED), `${name}@${version}`);
    });
  }
});

type Row = { id: string; lastMessageAt: number | null };

/**
 * Reference cursor semantics: order the rows, start at the cursor row,
 * skip, take. This is what a working Prisma returns for these arguments.
 */
function referenceFindMany(rows: Row[], args: CursorPageArgs, order: (a: Row, b: Row) => number) {
  const sorted = [...rows].sort(order);
  let start = 0;
  if (args.cursor) {
    start = sorted.findIndex((r) => r.id === args.cursor!.id);
    if (start === -1) return [];
  }
  start += args.skip ?? 0;
  return sorted.slice(start, start + args.take);
}

// Inbox order: lastMessageAt desc, nulls last, then id desc as a tie-break.
const inboxOrder = (a: Row, b: Row) => {
  if (a.lastMessageAt === null && b.lastMessageAt !== null) return 1;
  if (b.lastMessageAt === null && a.lastMessageAt !== null) return -1;
  const diff = (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0);
  return diff !== 0 ? diff : a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
};

function walk(rows: Row[], limit: number) {
  const seen: string[] = [];
  const pages: number[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 100; i++) {
    const found = referenceFindMany(rows, cursorPageArgs(cursor, limit, { lookahead: true }), inboxOrder);
    const page = splitCursorPage(found, limit);
    pages.push(page.items.length);
    seen.push(...page.items.map((r) => r.id));
    if (!page.hasMore) break;
    cursor = page.nextCursor;
  }
  return { seen, pages };
}

describe("inbox conversation list pages", () => {
  // 60 conversations: some share a lastMessageAt, some have none (nullable
  // sort field, the case in prisma/prisma#29254).
  const rows: Row[] = Array.from({ length: 60 }, (_, n) => ({
    id: `conv_${String(n).padStart(2, "0")}`,
    lastMessageAt: n % 7 === 0 ? null : 1_000 + Math.floor(n / 3),
  }));

  it("page 2 is not empty and continues where page 1 stopped", () => {
    const page1 = splitCursorPage(referenceFindMany(rows, cursorPageArgs(null, 25, { lookahead: true }), inboxOrder), 25);
    assert.equal(page1.items.length, 25);
    assert.equal(page1.hasMore, true);
    const page2 = splitCursorPage(
      referenceFindMany(rows, cursorPageArgs(page1.nextCursor, 25, { lookahead: true }), inboxOrder),
      25,
    );
    assert.equal(page2.items.length, 25);
    assert.equal(page2.items.some((r) => page1.items.includes(r)), false);
  });

  it("walks every conversation exactly once", () => {
    const { seen, pages } = walk(rows, 25);
    assert.deepEqual(pages, [25, 25, 10]);
    assert.equal(seen.length, 60);
    assert.equal(new Set(seen).size, 60);
  });

  it("builds the arguments the route sends", () => {
    assert.deepEqual(cursorPageArgs(null, 25, { lookahead: true }), { take: 26 });
    assert.deepEqual(cursorPageArgs("conv_24", 25, { lookahead: true }), {
      take: 26,
      cursor: { id: "conv_24" },
      skip: 1,
    });
    assert.deepEqual(splitCursorPage([{ id: "a" }, { id: "b" }], 2), {
      items: [{ id: "a" }, { id: "b" }],
      hasMore: false,
      nextCursor: null,
    });
  });
});

describe("widget message history and MCP list_messages pages", () => {
  const messages: Row[] = Array.from({ length: 120 }, (_, n) => ({
    id: `msg_${String(n).padStart(3, "0")}`,
    lastMessageAt: n,
  }));
  const oldestFirst = (a: Row, b: Row) => (a.lastMessageAt ?? 0) - (b.lastMessageAt ?? 0);

  it("widget: page 2 starts right after the cursor message (take 50, no lookahead)", () => {
    const page1 = referenceFindMany(messages, cursorPageArgs(null, 50), oldestFirst);
    const page2 = referenceFindMany(messages, cursorPageArgs(page1.at(-1)!.id, 50), oldestFirst);
    assert.equal(page1.length, 50);
    assert.equal(page2.length, 50);
    assert.equal(page2[0].id, "msg_050");
  });

  it("MCP list_messages: nextCursor walks all 120 messages", () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const page = splitCursorPage(
        referenceFindMany(messages, cursorPageArgs(cursor, 50, { lookahead: true }), oldestFirst),
        50,
      );
      seen.push(...page.items.map((r) => r.id));
      cursor = page.nextCursor;
    } while (cursor);
    assert.equal(seen.length, 120);
    assert.equal(new Set(seen).size, 120);
  });
});
