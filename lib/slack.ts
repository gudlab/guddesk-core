import { prisma } from "@/lib/db";

export const SLACK_TIMEOUT_MS = 5000;

/** Posts to a Slack incoming webhook. Throws on a network error, timeout or non-2xx. */
export async function postSlackWebhook(
  webhookUrl: string,
  text: string,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!res.ok) throw new Error(`Slack responded with HTTP ${res.status}`);
}

export async function sendSlackNotification(
  workspaceId: string,
  event: "new_conversation" | "conversation_closed" | "conversation_assigned",
  details: {
    conversationId: string;
    visitorName?: string | null;
    visitorEmail?: string | null;
    assigneeName?: string | null;
    subject?: string | null;
    preview?: string | null;
  },
) {
  const slack = await prisma.slackIntegration.findUnique({
    where: { workspaceId },
  });

  if (!slack?.webhookUrl) return;

  // Check notification preferences
  if (event === "new_conversation" && !slack.notifyOnNew) return;
  if (event === "conversation_closed" && !slack.notifyOnClose) return;
  if (event === "conversation_assigned" && !slack.notifyOnAssign) return;

  const visitorLabel =
    details.visitorName ?? details.visitorEmail ?? "A visitor";

  let text: string;
  switch (event) {
    case "new_conversation":
      text = `New conversation from ${visitorLabel}${details.preview ? `: "${details.preview}"` : ""}`;
      break;
    case "conversation_closed":
      text = `Conversation with ${visitorLabel} was closed`;
      break;
    case "conversation_assigned":
      text = `Conversation with ${visitorLabel} assigned to ${details.assigneeName ?? "someone"}`;
      break;
  }

  try {
    await postSlackWebhook(slack.webhookUrl, text, AbortSignal.timeout(SLACK_TIMEOUT_MS));
  } catch (error) {
    console.error("Slack notification error:", error);
  }
}
