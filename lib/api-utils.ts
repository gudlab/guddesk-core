import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  type AuthenticatedApiContext,
  authenticateApiKey,
  hasPermission,
  resolveWorkspace,
} from "@/lib/api-auth";
import type { ApiKeyPermission } from "@prisma/client";
import { scheduleOpportunisticJobs } from "@/lib/scheduled";

// ─── Standardized Response Helpers ────────────────────────────────────────

/**
 * Return a JSON success response.
 * Wraps the payload in `{ data, meta? }` format.
 */
export function apiOk<T>(data: T, meta?: PaginationMeta, status = 200) {
  const body: Record<string, unknown> = { data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

/**
 * Return a JSON error response.
 */
export function apiError(message: string, status: number, code?: string) {
  return NextResponse.json(
    {
      error: {
        code: code ?? httpCodeToString(status),
        message,
        status,
      },
    },
    { status },
  );
}

function httpCodeToString(status: number): string {
  const map: Record<number, string> = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    429: "rate_limited",
    500: "internal_error",
  };
  return map[status] ?? "error";
}

// ─── Cursor-Based Pagination ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  nextCursor: string | null;
}

export interface PaginationParams {
  limit: number;
  cursor: string | null;
}

/**
 * Parse pagination query params from the request URL.
 * - `limit` defaults to 25, max 100
 * - `cursor` is an opaque string (the id of the last item)
 */
export function parsePagination(req: NextRequest): PaginationParams {
  const params = req.nextUrl.searchParams;
  let limit = parseInt(params.get("limit") ?? "25", 10);
  if (isNaN(limit) || limit < 1) limit = 25;
  if (limit > 100) limit = 100;
  const cursor = params.get("cursor") || null;
  return { limit, cursor };
}

/**
 * Build a Prisma `findMany` pagination clause from our params.
 * Uses cursor-based pagination via the `id` field.
 */
export function prismaPagination(params: PaginationParams) {
  const clause: Record<string, unknown> = {
    take: params.limit + 1, // Fetch one extra to detect if there's a next page
  };
  if (params.cursor) {
    clause.cursor = { id: params.cursor };
    clause.skip = 1; // Skip the cursor itself
  }
  return clause;
}

/**
 * Build the pagination meta from the result set.
 * Pass the raw results (which may have limit+1 items) to get trimmed data + meta.
 */
export function buildPaginationResult<T extends { id: string }>(
  items: T[],
  params: PaginationParams,
  total: number,
): { items: T[]; meta: PaginationMeta } {
  const hasNext = items.length > params.limit;
  const trimmed = hasNext ? items.slice(0, params.limit) : items;
  const nextCursor = hasNext ? trimmed[trimmed.length - 1].id : null;

  return {
    items: trimmed,
    meta: {
      page: params.cursor ? -1 : 1, // -1 indicates cursor-based (not page-based)
      perPage: params.limit,
      total,
      nextCursor,
    },
  };
}

// ─── Rate Limiting ────────────────────────────────────────────────────────

// Simple in-memory rate limiter using a sliding window.
// In production, this should be replaced with Redis or similar.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS = {
  FREE: 60,
  PRO: 600,
} as const;

const WINDOW_MS = 60_000; // 1 minute

/**
 * Check rate limit for the given API key.
 * Returns headers to set on the response, or an error response if rate-limited.
 */
export async function checkRateLimit(
  apiKeyId: string,
  userId: string,
): Promise<
  | { allowed: true; headers: Record<string, string> }
  | { allowed: false; response: NextResponse }
> {
  // Determine the user's best plan for rate limit
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspace: { select: { plan: true } } },
  });
  const hasPro = memberships.some((m) => m.workspace.plan === "PRO");
  const limit = hasPro ? RATE_LIMITS.PRO : RATE_LIMITS.FREE;

  const now = Date.now();
  const key = apiKeyId;
  let entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, limit - entry.count);
  const resetEpoch = Math.ceil(entry.resetAt / 1000);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetEpoch),
  };

  if (entry.count > limit) {
    const res = apiError(
      "Rate limit exceeded. Please try again later.",
      429,
      "rate_limited",
    );
    for (const [k, v] of Object.entries(headers)) {
      res.headers.set(k, v);
    }
    return { allowed: false, response: res };
  }

  return { allowed: true, headers };
}

// Clean up stale rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60_000);
}

// ─── Auth + Workspace + Rate Limit Combo ──────────────────────────────────

export interface ApiRequestContext {
  auth: AuthenticatedApiContext;
  workspaceId: string;
}

/**
 * All-in-one auth guard for v1 API routes.
 * Authenticates the API key, checks permission, resolves workspace,
 * and checks rate limit. Returns either the context or an error response.
 */
export async function withApiAuth(
  req: NextRequest,
  options: {
    permission: ApiKeyPermission;
    /** If provided, use this instead of query/body workspaceId */
    workspaceId?: string;
  },
): Promise<
  | { ok: true; ctx: ApiRequestContext; rateLimitHeaders: Record<string, string> }
  | { ok: false; response: NextResponse }
> {
  const authContext = await authenticateApiKey(req);
  if (!authContext) {
    return {
      ok: false,
      response: apiError(
        "Invalid API key. Pass it as Authorization: Bearer <key> or x-api-key header.",
        401,
      ),
    };
  }

  if (!hasPermission(authContext, options.permission)) {
    return {
      ok: false,
      response: apiError(
        `This API key requires at least ${options.permission.replace("_", " ").toLowerCase()} permission`,
        403,
      ),
    };
  }

  // Rate limit check
  const rateResult = await checkRateLimit(authContext.apiKeyId, authContext.userId);
  if (!rateResult.allowed) {
    return { ok: false, response: rateResult.response };
  }

  // Resolve workspace
  const requestedWsId =
    options.workspaceId ??
    req.nextUrl.searchParams.get("workspaceId") ??
    undefined;

  const wsResult = await resolveWorkspace(authContext, requestedWsId);
  if ("error" in wsResult) {
    return {
      ok: false,
      response: apiError(wsResult.error, wsResult.status),
    };
  }

  // Runs the SLA check for this workspace at most every 5 minutes, after
  // the response.
  scheduleOpportunisticJobs(wsResult.workspaceId);

  return {
    ok: true,
    ctx: { auth: authContext, workspaceId: wsResult.workspaceId },
    rateLimitHeaders: rateResult.headers,
  };
}

/**
 * Attach rate limit headers to a response.
 */
export function withHeaders(
  response: NextResponse,
  headers: Record<string, string>,
): NextResponse {
  for (const [k, v] of Object.entries(headers)) {
    response.headers.set(k, v);
  }
  return response;
}
