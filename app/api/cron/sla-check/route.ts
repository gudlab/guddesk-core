import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { checkSlaBreaches, markAsBreached } from "@/lib/sla/check";
import { sendSlaBreachNotification } from "@/lib/email-notifications";

/**
 * GET or POST /api/cron/sla-check
 *
 * Cron job that detects SLA breaches. vercel.json runs it once a day,
 * because the Vercel Hobby plan only allows daily cron jobs.
 * For each breached conversation:
 *   1. Creates a SYSTEM message
 *   2. Sends notification email to assignee
 *   3. Marks conversation as breached (prevents re-notification)
 *
 * Protected by CRON_SECRET.
 */
async function run() {
  try {
    const breaches = await checkSlaBreaches();

    let processed = 0;
    for (const breach of breaches) {
      try {
        // Create SYSTEM message on the conversation
        const breachLabel =
          breach.breachType === "first_response"
            ? "First response SLA breached"
            : "Resolution SLA breached";

        await prisma.message.create({
          data: {
            conversationId: breach.conversationId,
            type: "SYSTEM",
            body: `${breachLabel} — deadline was ${breach.dueAt.toISOString()}`,
          },
        });

        // Send notification email
        await sendSlaBreachNotification(
          breach.conversationId,
          breach.breachType,
        );

        // Mark as breached
        await markAsBreached(breach.conversationId);

        processed++;
      } catch (error) {
        console.error(
          `SLA breach processing error for ${breach.conversationId}:`,
          error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      breachesFound: breaches.length,
      processed,
    });
  } catch (error) {
    console.error("SLA check cron error:", error);
    return NextResponse.json(
      { error: "SLA check failed" },
      { status: 500 },
    );
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
