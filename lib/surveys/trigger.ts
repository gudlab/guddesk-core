/**
 * Survey trigger logic.
 *
 * Creates a SYSTEM message with a JSON body that the widget/inbox
 * renders as an interactive survey component.
 */

import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";

export interface CsatDeps {
  getConversation(conversationId: string): Promise<{ workspaceId: string } | null>;
  getCsatConfig(
    workspaceId: string,
  ): Promise<{ isEnabled: boolean; questionText: string; thankYouText: string } | null>;
  hasSurveyMessage(conversationId: string): Promise<boolean>;
  hasCsatResponse(conversationId: string): Promise<boolean>;
  createSystemMessage(conversationId: string, body: string): Promise<{ id: string; body: string; createdAt: Date }>;
  triggerBatch(events: { channel: string; name: string; data: unknown }[], label: string): Promise<unknown>;
}

const prismaCsatDeps: CsatDeps = {
  getConversation: (conversationId) =>
    prisma.conversation.findUnique({ where: { id: conversationId }, select: { workspaceId: true } }),
  getCsatConfig: (workspaceId) =>
    prisma.surveyConfig.findUnique({
      where: { workspaceId_type: { workspaceId, type: "CSAT" } },
      select: { isEnabled: true, questionText: true, thankYouText: true },
    }),
  async hasSurveyMessage(conversationId) {
    const existing = await prisma.message.findFirst({
      where: { conversationId, type: "SYSTEM", body: { contains: '"type":"csat_survey"' } },
      select: { id: true },
    });
    return existing !== null;
  },
  async hasCsatResponse(conversationId) {
    const existing = await prisma.surveyResponse.findFirst({
      where: { conversationId, type: "CSAT" },
      select: { id: true },
    });
    return existing !== null;
  },
  createSystemMessage: (conversationId, body) =>
    prisma.message.create({
      data: { conversationId, type: "SYSTEM", body },
      select: { id: true, body: true, createdAt: true },
    }),
  triggerBatch: safeTriggerBatch,
};

/**
 * Trigger a CSAT survey for a conversation.
 *
 * Creates a special SYSTEM message whose body is a JSON payload:
 * { "type": "csat_survey", "question": "...", "conversationId": "..." }
 *
 * The widget and inbox detect this and render a star rating UI.
 * Idempotent: won't send if a survey was already sent for this conversation.
 */
export function triggerCsatSurvey(conversationId: string): Promise<boolean> {
  return sendCsatSurvey(conversationId, prismaCsatDeps);
}

/** triggerCsatSurvey with its reads and writes passed in (for tests). */
export async function sendCsatSurvey(conversationId: string, deps: CsatDeps): Promise<boolean> {
  const conversation = await deps.getConversation(conversationId);
  if (!conversation) return false;

  // Check if CSAT is enabled for this workspace
  const config = await deps.getCsatConfig(conversation.workspaceId);
  if (!config?.isEnabled) return false;

  // Check if a survey was already sent, or answered, for this conversation
  if (await deps.hasSurveyMessage(conversationId)) return false;
  if (await deps.hasCsatResponse(conversationId)) return false;

  // Create the survey message
  const surveyPayload = JSON.stringify({
    type: "csat_survey",
    question: config.questionText,
    thankYouText: config.thankYouText,
    conversationId,
  });

  const message = await deps.createSystemMessage(conversationId, surveyPayload);

  // Broadcast via Pusher
  const messagePayload = {
    id: message.id,
    type: "SYSTEM",
    body: message.body,
    createdAt: message.createdAt,
  };
  await deps.triggerBatch(
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
