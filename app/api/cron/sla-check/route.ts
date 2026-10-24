import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { sweepExpiredWebhookIds } from "@/lib/inbound-email/replay";
import { processSlaBreaches } from "@/lib/sla/process";

/**
 * GET or POST /api/cron/sla-check
 *
 * Detects SLA breaches in every workspace. Call it every 5 minutes: GudDesk
 * Cloud uses .github/workflows/cron.yml (Vercel Hobby crons are daily only),
 * and self-hosters use system cron (see the self-hosting docs). Inbox and
 * API requests also run it per workspace at most every 5 minutes
 * (lib/scheduled).
 * For each breached conversation:
 *   1. Creates a SYSTEM message
 *   2. Sends notification email to assignee
 *   3. Marks conversation as breached (prevents re-notification)
 *
 * It also deletes expired inbound-email svix-id records (lib/inbound-email/replay.ts).
 *
 * Protected by CRON_SECRET.
 */
async function sweepInboundIds(): Promise<number | null> {
  try {
    return await sweepExpiredWebhookIds(prisma);
  } catch (error) {
    console.error("Inbound id sweep error:", error instanceof Error ? error.name : "error");
    return null;
  }
}

async function run() {
  // Independent of the SLA run, so one failing doesn't skip the other.
  const inboundIdsSwept = await sweepInboundIds();
  try {
    const result = await processSlaBreaches();
    return NextResponse.json({ success: true, ...result, inboundIdsSwept });
  } catch (error) {
    console.error("SLA check cron error:", error);
    return NextResponse.json({ error: "SLA check failed" }, { status: 500 });
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
