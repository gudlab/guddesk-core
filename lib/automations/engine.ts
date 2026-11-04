import { AutomationAction, AutomationTrigger } from "@prisma/client";

import { prisma } from "@/lib/db";
import { safeTrigger } from "@/lib/pusher-server";

type TriggerContext = {
  workspaceId: string;
  conversationId: string;
  visitorEmail?: string | null;
  messageBody?: string | null;
  tags?: string[];
  addedTag?: string;
};

export async function runAutomations(
  trigger: AutomationTrigger,
  context: TriggerContext,
) {
  const rules = await prisma.automationRule.findMany({
    where: {
      workspaceId: context.workspaceId,
      isEnabled: true,
      trigger,
    },
    orderBy: { order: "asc" },
  });

  for (const rule of rules) {
    const conditions = rule.conditions as Record<string, string> | null;
    if (conditions && !matchesConditions(conditions, context)) {
      continue;
    }

    await executeAction(rule.action, rule.actionConfig as Record<string, string>, context);

    await prisma.automationRule.update({
      where: { id: rule.id },
      data: {
        lastTriggeredAt: new Date(),
        triggerCount: { increment: 1 },
      },
    });
  }
}

function matchesConditions(
  conditions: Record<string, string>,
  context: TriggerContext,
): boolean {
  if (conditions.tags_contain && context.tags) {
    if (!context.tags.includes(conditions.tags_contain)) return false;
  }

  if (conditions.tags_not_contain && context.tags) {
    if (context.tags.includes(conditions.tags_not_contain)) return false;
  }

  if (conditions.visitor_email_contains && context.visitorEmail) {
    if (
      !context.visitorEmail
        .toLowerCase()
        .includes(conditions.visitor_email_contains.toLowerCase())
    ) {
      return false;
    }
  }

  if (conditions.message_contains && context.messageBody) {
    if (
      !context.messageBody
        .toLowerCase()
        .includes(conditions.message_contains.toLowerCase())
    ) {
      return false;
    }
  }

  return true;
}

async function executeAction(
  action: AutomationAction,
  config: Record<string, string>,
  context: TriggerContext,
) {
  switch (action) {
    case "ASSIGN_TO": {
      if (!config.assigneeId) break;
      await prisma.conversation.update({
        where: { id: context.conversationId },
        data: { assigneeId: config.assigneeId },
      });
      await createSystemMessage(
        context.conversationId,
        "Auto-assigned by automation rule",
      );
      await safeTrigger(
        `private-workspace-${context.workspaceId}`,
        "conversation:updated",
        { conversationId: context.conversationId },
        "automation.ASSIGN_TO",
      );
      break;
    }

    case "ADD_TAG": {
      if (!config.tag) break;
      const convo = await prisma.conversation.findUnique({
        where: { id: context.conversationId },
        select: { tags: true },
      });
      if (convo && !convo.tags.includes(config.tag)) {
        await prisma.conversation.update({
          where: { id: context.conversationId },
          data: { tags: { push: config.tag } },
        });
      }
      break;
    }

    case "REMOVE_TAG": {
      if (!config.tag) break;
      const convoForRemove = await prisma.conversation.findUnique({
        where: { id: context.conversationId },
        select: { tags: true },
      });
      if (convoForRemove) {
        await prisma.conversation.update({
          where: { id: context.conversationId },
          data: { tags: convoForRemove.tags.filter((t) => t !== config.tag) },
        });
      }
      break;
    }

    case "CHANGE_STATUS": {
      if (!config.status) break;
      const statusValue = config.status as "OPEN" | "SNOOZED" | "CLOSED";
      await prisma.conversation.update({
        where: { id: context.conversationId },
        data: {
          status: statusValue,
          closedAt: statusValue === "CLOSED" ? new Date() : null,
        },
      });
      await createSystemMessage(
        context.conversationId,
        `Status changed to ${statusValue} by automation`,
      );
      await safeTrigger(
        `private-workspace-${context.workspaceId}`,
        "conversation:updated",
        { conversationId: context.conversationId },
        "automation.CHANGE_STATUS",
      );
      break;
    }

    case "SEND_MESSAGE": {
      if (!config.message) break;
      await prisma.message.create({
        data: {
          conversationId: context.conversationId,
          type: "BOT",
          body: config.message,
          senderName: "GudDesk Bot",
        },
      });
      await safeTrigger(
        `private-conversation-${context.conversationId}`,
        "message:created",
        { conversationId: context.conversationId },
        "automation.SEND_MESSAGE",
      );
      break;
    }

    case "NOTIFY_SLACK": {
      const slack = await prisma.slackIntegration.findUnique({
        where: { workspaceId: context.workspaceId },
      });
      if (slack?.webhookUrl) {
        const convoForSlack = await prisma.conversation.findUnique({
          where: { id: context.conversationId },
          include: { visitor: { select: { name: true, email: true } } },
        });
        try {
          await fetch(slack.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `Automation triggered: ${config.message ?? "New activity"} from ${convoForSlack?.visitor?.name ?? convoForSlack?.visitor?.email ?? "a visitor"}`,
            }),
          });
        } catch {
          console.error("Failed to send Slack notification");
        }
      }
      break;
    }
  }
}

async function createSystemMessage(conversationId: string, body: string) {
  await prisma.message.create({
    data: {
      conversationId,
      type: "SYSTEM",
      body,
    },
  });
}
