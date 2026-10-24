import { NextResponse } from "next/server";

import { withCronAuth } from "@/lib/cron-auth";
import { prisma } from "@/lib/db";
import { triggerCsatSurvey } from "@/lib/surveys/trigger";

/**
 * GET or POST /api/cron/surveys
 *
 * Cron job for delayed CSAT surveys. vercel.json runs it once a day (Hobby plan).
 * Finds conversations closed X minutes ago where CSAT config has AFTER_DELAY
 * trigger and no survey has been sent yet.
 */
async function run() {
  try {
    // Find all workspaces with AFTER_DELAY CSAT configs
    const configs = await prisma.surveyConfig.findMany({
      where: {
        type: "CSAT",
        isEnabled: true,
        trigger: "AFTER_DELAY",
      },
      select: {
        workspaceId: true,
        delayMinutes: true,
      },
    });

    let triggered = 0;

    for (const config of configs) {
      // Find conversations closed after (now - delay) that don't have a survey yet
      const delayAgo = new Date(Date.now() - config.delayMinutes * 60 * 1000);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // don't go too far back

      const conversations = await prisma.conversation.findMany({
        where: {
          workspaceId: config.workspaceId,
          status: "CLOSED",
          closedAt: {
            gte: twoHoursAgo,
            lte: delayAgo,
          },
          // Exclude conversations that already have a survey message
          messages: {
            none: {
              type: "SYSTEM",
              body: { contains: '"type":"csat_survey"' },
            },
          },
        },
        select: { id: true },
        take: 50, // batch limit
      });

      for (const conv of conversations) {
        try {
          const sent = await triggerCsatSurvey(conv.id);
          if (sent) triggered++;
        } catch (error) {
          console.error(`Survey trigger error for ${conv.id}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, triggered });
  } catch (error) {
    console.error("Survey cron error:", error);
    return NextResponse.json(
      { error: "Survey cron failed" },
      { status: 500 },
    );
  }
}

export const GET = withCronAuth(run);
export const POST = withCronAuth(run);
