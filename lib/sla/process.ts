import { prisma } from "@/lib/db";
import { sendSlaBreachNotification } from "@/lib/email-notifications";
import { checkSlaBreaches, markAsBreached } from "@/lib/sla/check";

/**
 * Handle SLA breaches for one workspace, or all of them when no id is
 * given. For each breached conversation: add a SYSTEM message, email the
 * assignee, and mark it breached so it is not handled twice. Used by the
 * sla-check cron route and the opportunistic per-workspace run.
 */
export async function processSlaBreaches(
  workspaceId?: string,
): Promise<{ breachesFound: number; processed: number }> {
  const breaches = await checkSlaBreaches(workspaceId);

  let processed = 0;
  for (const breach of breaches) {
    try {
      const breachLabel =
        breach.breachType === "first_response"
          ? "First response SLA breached"
          : "Resolution SLA breached";

      await prisma.message.create({
        data: {
          conversationId: breach.conversationId,
          type: "SYSTEM",
          body: `${breachLabel}. The deadline was ${breach.dueAt.toISOString()}`,
        },
      });

      await sendSlaBreachNotification(breach.conversationId, breach.breachType);
      await markAsBreached(breach.conversationId);
      processed++;
    } catch (error) {
      console.error(`SLA breach processing error for ${breach.conversationId}:`, error);
    }
  }

  return { breachesFound: breaches.length, processed };
}
