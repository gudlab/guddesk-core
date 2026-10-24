import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { generateDailySnapshot } from "@/lib/analytics";

// GET or POST /api/cron/analytics
// Called daily by a cron job (e.g. Vercel Cron) to generate analytics snapshots
async function run() {
  try {
    const workspaces = await prisma.workspace.findMany({
      select: { id: true },
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const results = await Promise.allSettled(
      workspaces.map((workspace) => generateDailySnapshot(workspace.id, yesterday)),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      processed: workspaces.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("Analytics cron error:", error);
    return NextResponse.json(
      { error: "Failed to generate snapshots" },
      { status: 500 },
    );
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
