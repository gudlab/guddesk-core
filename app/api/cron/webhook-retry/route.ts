import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { retryDelivery } from "@/lib/webhooks";

/**
 * GET or POST /api/cron/webhook-retry
 *
 * Cron job that retries failed webhook deliveries. vercel.json runs it once a day (Hobby plan).
 * Picks up to 50 PENDING deliveries whose nextRetryAt has passed,
 * then calls retryDelivery() for each.
 *
 * Protected by CRON_SECRET.
 */
async function run() {
  try {
    const now = new Date();

    const deliveries = await prisma.webhookDelivery.findMany({
      where: {
        status: "PENDING",
        nextRetryAt: { lte: now },
      },
      select: { id: true },
      take: 50,
      orderBy: { nextRetryAt: "asc" },
    });

    let retried = 0;
    for (const delivery of deliveries) {
      try {
        await retryDelivery(delivery.id);
        retried++;
      } catch (error) {
        console.error(`Webhook retry failed for delivery ${delivery.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      found: deliveries.length,
      retried,
    });
  } catch (error) {
    console.error("Webhook retry cron error:", error);
    return NextResponse.json({ error: "Retry cron failed" }, { status: 500 });
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
