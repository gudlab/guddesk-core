import { after } from "next/server";

import { callClaudeWithTools } from "@/lib/ai/client";
import { prisma } from "@/lib/db";
import { safeTriggerBatch, type RealtimeEvent } from "@/lib/pusher-server";

import { formatBotBody } from "./citations";
import { deferGudBot } from "./defer";
import { skipReason } from "./gate";
import { formatHandoffNote } from "./handoff";
import { helpCenterArticleUrl, rankPublishedArticles } from "./retrieve";
import { runGudBotLoop, type HistoryMessage } from "./loop";
import { resolveGudBotSettings } from "./settings";

const BOT_SENDER_NAME = "GudBot";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function shouldRunGudBot(
  workspaceId: string,
  conversationId: string,
): Promise<boolean> {
  const [row, conversation] = await Promise.all([
    prisma.gudBotSettings.findUnique({ where: { workspaceId } }),
    prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        workspaceId: true,
        status: true,
        channel: true,
        assigneeId: true,
        aiHandoffAt: true,
        aiResolutionMethod: true,
        tags: true,
      },
    }),
  ]);
  if (!conversation || conversation.workspaceId !== workspaceId) return false;
  return skipReason(resolveGudBotSettings(row), conversation) === null;
}

function previewOf(body: string): string {
  return body.length > 100 ? `${body.slice(0, 100)}...` : body;
}

function messagePayload(message: {
  id: string;
  type: string;
  body: string;
  senderName: string | null;
  createdAt: Date;
}) {
  return {
    id: message.id,
    type: message.type,
    body: message.body,
    senderId: null,
    senderName: message.senderName,
    createdAt: message.createdAt,
  };
}

export function scheduleGudBotTurn(input: {
  workspaceId: string;
  conversationId: string;
  visitorMessage: string;
}): void {
  deferGudBot(after, () => runGudBotTurn(input));
}

export async function runGudBotTurn(input: {
  workspaceId: string;
  conversationId: string;
  visitorMessage: string;
}): Promise<void> {
  const enabled = await shouldRunGudBot(input.workspaceId, input.conversationId);
  if (!enabled) return;

  await safeTriggerBatch(
    [
      {
        channel: `private-visitor-${input.conversationId}`,
        name: "typing:start",
        data: { senderName: BOT_SENDER_NAME },
      },
    ],
    "gudbot.typing",
  );

  const outcome = await runGudBotLoop(
    {
      loadSettings: async (workspaceId) => {
        const row = await prisma.gudBotSettings.findUnique({
          where: { workspaceId },
        });
        return resolveGudBotSettings(row);
      },
      loadConversation: async (conversationId) => {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: {
            workspaceId: true,
            status: true,
            channel: true,
            assigneeId: true,
            aiHandoffAt: true,
            aiResolutionMethod: true,
            tags: true,
          },
        });
        return conversation;
      },
      countTurns: (conversationId) =>
        prisma.aiTurn.count({ where: { conversationId } }),
      loadHistory: async (conversationId) => {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
            type: { in: ["VISITOR", "BOT", "AGENT", "SYSTEM"] },
          },
          orderBy: { createdAt: "asc" },
          take: 20,
          select: { type: true, body: true },
        });
        return messages.flatMap((message): HistoryMessage[] => {
          if (message.type === "VISITOR") {
            return [{ role: "visitor", body: message.body }];
          }
          if (message.type === "BOT") {
            return [{ role: "bot", body: message.body }];
          }
          if (message.type === "AGENT") {
            return [{ role: "agent", body: message.body }];
          }
          return [{ role: "system", body: message.body }];
        });
      },
      retrieve: async ({ workspaceId, query }) => {
        const articles = await prisma.article.findMany({
          where: { workspaceId, isPublished: true },
          select: {
            id: true,
            title: true,
            body: true,
            excerpt: true,
            slug: true,
            isPublished: true,
            collection: { select: { slug: true } },
          },
          take: 100,
        });
        return rankPublishedArticles(
          articles.map((article) => ({
            id: article.id,
            title: article.title,
            body: article.body,
            excerpt: article.excerpt,
            slug: article.slug,
            isPublished: article.isPublished,
            collectionSlug: article.collection?.slug ?? null,
          })),
          query,
        );
      },
      complete: async (request) => {
        return callClaudeWithTools({
          workspaceId: input.workspaceId,
          feature: "gudbot",
          system: request.system,
          messages: [{ role: "user", content: request.user }],
          tools: request.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.input_schema as Record<string, unknown>,
          })),
          conversationId: input.conversationId,
          maxTokens: 1024,
        });
      },
    },
    input,
  );

  if (outcome.action === "skip") {
    await safeTriggerBatch(
      [
        {
          channel: `private-visitor-${input.conversationId}`,
          name: "typing:stop",
          data: {},
        },
      ],
      "gudbot.typing-stop",
    );
    return;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    select: {
      workspaceId: true,
      workspace: { select: { slug: true } },
    },
  });
  if (!conversation || conversation.workspaceId !== input.workspaceId) return;

  const settingsRow = await prisma.gudBotSettings.findUnique({
    where: { workspaceId: input.workspaceId },
  });
  const settings = resolveGudBotSettings(settingsRow);
  const appUrl = getAppUrl();
  const withUrls = await attachCitationUrls(
    outcome.citations,
    conversation.workspace.slug,
    appUrl,
  );

  if (outcome.action === "handoff") {
    await persistHandoff({
      conversationId: input.conversationId,
      workspaceId: input.workspaceId,
      visitorMessage: settings.handoffMessage,
      note: formatHandoffNote({
        reason: outcome.reason,
        confidence: outcome.confidence,
        citations: withUrls,
        suggestedReply: outcome.suggestedReply,
      }),
      reason: outcome.reason,
      confidence: outcome.confidence ?? null,
      citations: withUrls,
    });
    return;
  }

  const body = formatBotBody(outcome.text, withUrls);
  await persistAnswer({
    conversationId: input.conversationId,
    workspaceId: input.workspaceId,
    body,
    modelSelf: outcome.confidence,
    evidenceScore: outcome.evidenceScore,
    effective: outcome.effective,
    citations: withUrls,
  });
}

async function attachCitationUrls(
  citations: Array<{
    type: "article";
    id: string;
    title: string;
    url: string | null;
    score: number;
  }>,
  workspaceSlug: string,
  appUrl: string,
) {
  if (citations.length === 0) return citations;
  const articles = await prisma.article.findMany({
    where: { id: { in: citations.map((citation) => citation.id) } },
    select: {
      id: true,
      slug: true,
      collection: { select: { slug: true } },
    },
  });
  const urls = new Map(
    articles.map((article) => [
      article.id,
      helpCenterArticleUrl(appUrl, workspaceSlug, {
        slug: article.slug,
        collectionSlug: article.collection?.slug ?? null,
      }),
    ]),
  );
  return citations.map((citation) => ({
    ...citation,
    url: citation.url ?? urls.get(citation.id) ?? null,
  }));
}

async function persistAnswer(input: {
  conversationId: string;
  workspaceId: string;
  body: string;
  modelSelf: number;
  evidenceScore: number;
  effective: number;
  citations: Array<{
    type: "article";
    id: string;
    title: string;
    url: string | null;
    score: number;
  }>;
}) {
  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      type: "BOT",
      body: input.body,
      senderName: BOT_SENDER_NAME,
      attachments: { citations: input.citations },
    },
  });

  await prisma.aiTurn.create({
    data: {
      conversationId: input.conversationId,
      workspaceId: input.workspaceId,
      messageId: message.id,
      modelSelf: input.modelSelf,
      evidenceScore: input.evidenceScore,
      effective: input.effective,
      citationsJson: input.citations,
    },
  });

  const preview = previewOf(input.body);
  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
      aiFinalConfidence: input.effective,
    },
  });

  const payload = messagePayload(message);
  await safeTriggerBatch(
    [
      {
        channel: `private-visitor-${input.conversationId}`,
        name: "typing:stop",
        data: {},
      },
      {
        channel: `private-visitor-${input.conversationId}`,
        name: "message:created",
        data: payload,
      },
      {
        channel: `private-conversation-${input.conversationId}`,
        name: "message:created",
        data: payload,
      },
      {
        channel: `private-workspace-${input.workspaceId}`,
        name: "conversation:new-message",
        data: {
          conversationId: input.conversationId,
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        },
      },
    ],
    "gudbot.answer",
  );
}

async function persistHandoff(input: {
  conversationId: string;
  workspaceId: string;
  visitorMessage: string;
  note: string;
  reason: string;
  confidence: number | null;
  citations: Array<{
    type: "article";
    id: string;
    title: string;
    url: string | null;
    score: number;
  }>;
}) {
  const now = new Date();
  const systemMessage = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      type: "SYSTEM",
      body: input.visitorMessage,
    },
  });
  const noteMessage = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      type: "NOTE",
      body: input.note,
      senderName: BOT_SENDER_NAME,
    },
  });

  await prisma.aiTurn.create({
    data: {
      conversationId: input.conversationId,
      workspaceId: input.workspaceId,
      messageId: noteMessage.id,
      modelSelf: input.confidence ?? 0,
      evidenceScore: 1,
      effective: input.confidence ?? 0,
      citationsJson: input.citations,
    },
  });

  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: {
      assigneeId: null,
      assignedAt: now,
      aiResolved: false,
      aiResolutionMethod: "HANDED_OFF",
      aiHandoffReason: input.reason,
      aiHandoffAt: now,
      aiFinalConfidence: input.confidence,
      lastMessageAt: now,
      lastMessagePreview: previewOf(input.visitorMessage),
    },
  });

  const systemPayload = messagePayload(systemMessage);
  const notePayload = {
    ...messagePayload(noteMessage),
    senderName: BOT_SENDER_NAME,
  };
  const events: RealtimeEvent[] = [
    {
      channel: `private-visitor-${input.conversationId}`,
      name: "typing:stop",
      data: {},
    },
    {
      channel: `private-visitor-${input.conversationId}`,
      name: "message:created",
      data: systemPayload,
    },
    {
      channel: `private-conversation-${input.conversationId}`,
      name: "message:created",
      data: systemPayload,
    },
    {
      channel: `private-conversation-${input.conversationId}`,
      name: "message:created",
      data: notePayload,
    },
    {
      channel: `private-workspace-${input.workspaceId}`,
      name: "conversation:updated",
      data: {
        conversationId: input.conversationId,
        assigneeId: null,
        assignedAt: now,
      },
    },
    {
      channel: `private-workspace-${input.workspaceId}`,
      name: "conversation:new-message",
      data: {
        conversationId: input.conversationId,
        lastMessageAt: now,
        lastMessagePreview: previewOf(input.visitorMessage),
      },
    },
  ];
  await safeTriggerBatch(events, "gudbot.handoff");
}
