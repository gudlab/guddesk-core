import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

/**
 * Vercel cron calls each path in vercel.json with GET and, when the
 * project has a CRON_SECRET env var, sends `Authorization: Bearer <secret>`.
 * Manual or external triggers may use POST with the same header.
 *
 * A missing or empty CRON_SECRET rejects every request, so an unset secret
 * can never be matched by a literal "Bearer undefined" header.
 */
export function isAuthorizedCronRequest(
  authorization: string | null | undefined,
  secret: string | undefined = process.env.CRON_SECRET,
): boolean {
  if (!secret || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorization);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

type CronHandler = (req: NextRequest) => Promise<Response>;

/** Wraps a cron job so GET and POST share one handler and one secret check. */
export function withCronAuth(handler: CronHandler): CronHandler {
  return async (req) => {
    if (!isAuthorizedCronRequest(req.headers.get("authorization"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req);
  };
}
