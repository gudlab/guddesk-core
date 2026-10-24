import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { generateAgentSnapshots } from "@/lib/agent-analytics";

// GET or POST /api/cron/agent-performance
// Daily cron: generates per-agent performance snapshots for yesterday
async function run() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all workspaces
    const workspaces = await prisma.workspace.findMany({
      select: { id: true },
    });

    let processed = 0;
    for (const ws of workspaces) {
      try {
        await generateAgentSnapshots(ws.id, yesterday);
        processed++;
      } catch (error) {
        console.error(`Agent snapshot error for workspace ${ws.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      workspacesProcessed: processed,
    });
  } catch (error) {
    console.error("Agent performance cron error:", error);
    return NextResponse.json(
      { error: "Failed to generate snapshots" },
      { status: 500 },
    );
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
