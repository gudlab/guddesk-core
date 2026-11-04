/**
 * Survey trigger logic.
 *
 * Creates a SYSTEM message with a JSON body that the widget/inbox
 * renders as an interactive survey component.
 */

import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";

/**
 * Trigger a CSAT survey for a conversation.
 *
 * Creates a special SYSTEM message whose body is a JSON payload:
 * { "type": "csat_survey", "question": "...", "conversationId": "..." }
 *
 * The widget and inbox detect this and render a star rating UI.
 * Idempotent: won't send if a survey was already sent for this conversation.
 */
export async function triggerCsatSurvey(conversationId: string): Promise<boolean> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { workspaceId: true, visitorId: true },
  });

  if (!conversation) return false;

  // Check if CSAT is enabled for this workspace
  const config = await prisma.surveyConfig.findUnique({
    where: {
      workspaceId_type: {
        workspaceId: conversation.workspaceId,
        type: "CSAT",
      },
    },
  });

  if (!config?.isEnabled) return false;

  // Check if a survey was already sent for this conversation (idempotent)
  const existingSurvey = await prisma.message.findFirst({
    where: {
      conversationId,
      type: "SYSTEM",
      body: { contains: '"type":"csat_survey"' },
    },
  });

  if (existingSurvey) return false;

  // Check if a response already exists
  const existingResponse = await prisma.surveyResponse.findFirst({
    where: { conversationId, type: "CSAT" },
  });

  if (existingResponse) return false;

  // Create the survey message
  const surveyPayload = JSON.stringify({
    type: "csat_survey",
    question: config.questionText,
    thankYouText: config.thankYouText,
    conversationId,
  });

  const message = await prisma.message.create({
    data: {
      conversationId,
      type: "SYSTEM",
      body: surveyPayload,
    },
  });

  // Broadcast via Pusher
  const messagePayload = {
    id: message.id,
    type: "SYSTEM",
    body: message.body,
    createdAt: message.createdAt,
  };
  await safeTriggerBatch(
    [
      {
        channel: `private-conversation-${conversationId}`,
        name: "message:created",
        data: messagePayload,
      },
      {
        channel: `private-visitor-${conversationId}`,
        name: "message:created",
        data: messagePayload,
      },
    ],
    "triggerCsatSurvey",
  );

  return true;
}
