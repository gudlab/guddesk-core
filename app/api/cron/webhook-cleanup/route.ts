import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";

/**
 * GET or POST /api/cron/webhook-cleanup
 *
 * Daily cron that deletes webhook delivery records older than 30 days
 * to keep the database lean.
 *
 * Protected by CRON_SECRET.
 */
async function run() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.webhookDelivery.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Webhook cleanup cron error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
