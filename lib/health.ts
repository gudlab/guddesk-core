/**
 * Public liveness payload for GET /api/health.
 * Process-only: no auth, no DB, no env dump.
 */
export const HEALTH_OK = { ok: true, status: "ok" } as const;

export const HEALTH_HEADERS = {
  "Cache-Control": "no-store",
} as const;
