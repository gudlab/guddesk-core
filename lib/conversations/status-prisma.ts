/**
 * Real side effects for changeConversationStatus().
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import type { StatusChangeDeps } from "@/lib/conversations/status";
import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { triggerCsatSurvey } from "@/lib/surveys/trigger";
import { dispatchWebhooks } from "@/lib/webhooks";

export function prismaStatusDeps(): StatusChangeDeps {
  return {
    async closeIfNotClosed(conversationId, at) {
      const { count } = await prisma.conversation.updateMany({
        where: { id: conversationId, status: { not: "CLOSED" } },
        data: { status: "CLOSED", snoozedUntil: null, closedAt: at },
      });
      return count > 0;
    },
    async update(conversationId, data) {
      await prisma.conversation.update({ where: { id: conversationId }, data });
    },
    async addSystemMessage(conversationId, body, sender) {
      await prisma.message.create({
        data: {
          conversationId,
          type: "SYSTEM",
          body,
          ...(sender ? { senderId: sender.id, senderName: sender.name } : {}),
        },
      });
    },
    triggerBatch: safeTriggerBatch,
    triggerCsatSurvey,
    webhook: dispatchWebhooks,
  };
}
