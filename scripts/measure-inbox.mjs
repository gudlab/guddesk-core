#!/usr/bin/env node
/**
 * Time the agent inbox list path. Prints min / p50 / p95 / max for this run.
 * Does not claim a hosted or production p95.
 *
 * HTTP (default): GET /api/inbox/conversations with a session cookie.
 *   INBOX_MEASURE_BASE=http://localhost:3000 \
 *   INBOX_MEASURE_WORKSPACE_ID=... \
 *   INBOX_MEASURE_COOKIE='authjs.session-token=...' \
 *   node scripts/measure-inbox.mjs
 *
 * Query: same Prisma findMany + count the route uses (needs DATABASE_URL).
 *   DATABASE_URL=... INBOX_MEASURE_WORKSPACE_ID=... \
 *   node scripts/measure-inbox.mjs --query
 *
 * Options: --runs=N  --no-fail  --status=OPEN
 */
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

export const INBOX_LIST_P95_BUDGET_MS = 300;

/** Inclusive rank percentile. values must be a non-empty number[]. */
export function percentile(values, p) {
  if (values.length === 0) {
    throw new Error("percentile() needs at least one sample");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  const t = rank - low;
  return sorted[low] * (1 - t) + sorted[high] * t;
}

function parseArgs(argv) {
  const opts = {
    query: false,
    fail: true,
    runs: 20,
    status: "OPEN",
    workspaceId: process.env.INBOX_MEASURE_WORKSPACE_ID ?? "",
  };
  for (const arg of argv) {
    if (arg === "--query") opts.query = true;
    else if (arg === "--no-fail") opts.fail = false;
    else if (arg === "--http") opts.query = false;
    else if (arg.startsWith("--runs=")) {
      const n = Number(arg.slice("--runs=".length));
      if (Number.isFinite(n) && n >= 1) opts.runs = Math.min(200, Math.floor(n));
    } else if (arg.startsWith("--status=")) {
      opts.status = arg.slice("--status=".length);
    } else if (arg.startsWith("--workspace=")) {
      opts.workspaceId = arg.slice("--workspace=".length);
    }
  }
  return opts;
}

function summarize(samples) {
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  return {
    n: samples.length,
    min,
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    max,
  };
}

function printSummary(label, stats) {
  const fmt = (n) => `${n.toFixed(1)}ms`;
  console.log(
    `${label}: n=${stats.n} min=${fmt(stats.min)} p50=${fmt(stats.p50)} p95=${fmt(stats.p95)} max=${fmt(stats.max)}`,
  );
}

async function timeOnce(fn) {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

async function measureHttp(opts) {
  const base = (process.env.INBOX_MEASURE_BASE ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const cookie = process.env.INBOX_MEASURE_COOKIE ?? "";
  if (!opts.workspaceId) {
    throw new Error("Set INBOX_MEASURE_WORKSPACE_ID or --workspace=");
  }
  if (!cookie) {
    throw new Error(
      "Set INBOX_MEASURE_COOKIE to a signed-in session cookie. A 401 is not an inbox measurement.",
    );
  }
  const params = new URLSearchParams({
    workspaceId: opts.workspaceId,
    status: opts.status,
    limit: "25",
  });
  const url = `${base}/api/inbox/conversations?${params}`;
  const headers = { cookie, accept: "application/json" };

  const hit = async () => {
    const res = await fetch(url, { headers, cache: "no-store" });
    if (res.status === 401) {
      throw new Error("401 Unauthorized. Refresh INBOX_MEASURE_COOKIE.");
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    await res.json();
  };

  await hit(); // warmup
  const samples = [];
  for (let i = 0; i < opts.runs; i++) {
    samples.push(await timeOnce(hit));
  }
  return { label: `GET ${url}`, samples };
}

async function measureQuery(opts) {
  if (!opts.workspaceId) {
    throw new Error("Set INBOX_MEASURE_WORKSPACE_ID or --workspace=");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL for --query");
  }

  const [{ PrismaPg }, { PrismaClient }, inbox] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("@prisma/client"),
    import("../lib/inbox-conversations.ts"),
  ]);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const where = inbox.inboxConversationListWhere(
    opts.workspaceId,
    opts.status,
    null,
  );

  const hit = async () => {
    await Promise.all([
      prisma.conversation.findMany({
        where,
        select: inbox.inboxConversationListSelect,
        orderBy: [
          { lastMessageAt: { sort: "desc", nulls: "last" } },
          { id: "desc" },
        ],
        take: inbox.INBOX_LIST_DEFAULT_LIMIT + 1,
      }),
      prisma.conversation.count({ where }),
    ]);
  };

  try {
    await hit();
    const samples = [];
    for (let i = 0; i < opts.runs; i++) {
      samples.push(await timeOnce(hit));
    }
    return { label: "prisma inbox list findMany+count", samples };
  } finally {
    await prisma.$disconnect();
  }
}

async function main(argv) {
  const opts = parseArgs(argv);
  const { label, samples } = opts.query
    ? await measureQuery(opts)
    : await measureHttp(opts);
  const stats = summarize(samples);
  printSummary(label, stats);
  console.log(
    `Budget: p95 < ${INBOX_LIST_P95_BUDGET_MS}ms. This is this run only.`,
  );
  if (opts.fail && stats.p95 >= INBOX_LIST_P95_BUDGET_MS) {
    console.error(
      `FAIL: p95 ${stats.p95.toFixed(1)}ms is at or over ${INBOX_LIST_P95_BUDGET_MS}ms.`,
    );
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
