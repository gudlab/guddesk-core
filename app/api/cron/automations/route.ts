import { NextResponse } from "next/server";

import { runUnassignedAutomations } from "@/lib/automations/dispatch";
import { withCronAuth } from "@/lib/cron-auth";

/**
 * GET or POST /api/cron/automations
 *
 * Runs "unassigned for N minutes" automation rules in every workspace.
 * Call it every 5 minutes, like the SLA check: GudDesk Cloud uses
 * .github/workflows/cron.yml and self-hosters use system cron. Inbox and
 * API requests also run it per workspace at most every 5 minutes
 * (lib/scheduled).
 *
 * Protected by CRON_SECRET.
 */
async function run() {
  try {
    const result = await runUnassignedAutomations();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Automations cron error:", error);
    return NextResponse.json({ error: "Automations run failed" }, { status: 500 });
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
