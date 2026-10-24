import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { processSlaBreaches } from "@/lib/sla/process";

/**
 * GET or POST /api/cron/sla-check
 *
 * Detects SLA breaches in every workspace. Self-hosters call it every 5
 * minutes from system cron (see the self-hosting docs). Inbox and API
 * requests also run it per workspace at most every 5 minutes
 * (lib/scheduled), which is the main path on GudDesk Cloud; Cloud also
 * calls this route hourly from .github/workflows/cron.yml (Vercel Hobby
 * crons are daily only).
 * For each breached conversation:
 *   1. Creates a SYSTEM message
 *   2. Sends notification email to assignee
 *   3. Marks conversation as breached (prevents re-notification)
 *
 * Protected by CRON_SECRET.
 */
async function run() {
  try {
    const result = await processSlaBreaches();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("SLA check cron error:", error);
    return NextResponse.json({ error: "SLA check failed" }, { status: 500 });
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
