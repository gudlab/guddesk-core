import { NextResponse } from "next/server";

import { HEALTH_HEADERS, HEALTH_OK } from "@/lib/health";

export const dynamic = "force-dynamic";

// GET /api/health - public liveness for self-host and Cloud probes.
export function GET() {
  return NextResponse.json(HEALTH_OK, {
    status: 200,
    headers: HEALTH_HEADERS,
  });
}
