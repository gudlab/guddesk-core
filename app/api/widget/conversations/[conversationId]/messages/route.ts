import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { cursorPageArgs } from "@/lib/pagination";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { verifyVisitorToken } from "@/lib/visitor-auth";
import { fireAutomations } from "@/lib/automations/dispatch";
import { messageReceivedEvent, origin } from "@/lib/automations/events";
import { visitorFacingSenderName } from "@/lib/inbound-email/sender-name";

// GET /api/widget/conversations/[conversationId]/messages
// Returns messages for a conversation (visitor authenticated via token)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const visitorToken = req.headers.get("x-visitor-token");

  if (!visitorToken) {
    return NextResponse.json(
      { error: "Visitor token required" },
      { status: 401 },
    );
  }

  const payload = verifyVisitorToken(visitorToken);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid visitor token" },
      { status: 401 },
    );
  }

  // Verify conversation belongs to this visitor
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { visitorId: true, workspaceId: true },
  });

  if (
    !conversation ||
    conversation.visitorId !== payload.visitorId ||
    conversation.workspaceId !== payload.workspaceId
  ) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = 50;

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      // Don't show internal notes to visitors
      type: { not: "NOTE" },
    },
    orderBy: { createdAt: "asc" },
    ...cursorPageArgs(cursor, limit),
    select: {
      id: true,
      type: true,
      body: true,
      senderName: true,
      createdAt: true,
    },
  });

  // A customer reply from a forwarded sender is stored as "Name (address)"
  // for agents; the visitor sees just the name.
  return NextResponse.json({
    messages: messages.map((m) =>
      m.type === "VISITOR" ? { ...m, senderName: visitorFacingSenderName(m.senderName) } : m,
    ),
  });
}

// POST /api/widget/conversations/[conversationId]/messages
// Visitor sends a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const visitorToken = req.headers.get("x-visitor-token");
    const body = await req.json();
    const { message } = body;

    if (!visitorToken) {
      return NextResponse.json(
        { error: "Visitor token required" },
        { status: 401 },
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const payload = verifyVisitorToken(visitorToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid visitor token" },
        { status: 401 },
      );
    }

    // Verify conversation belongs to this visitor
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { visitorId: true, workspaceId: true, assigneeId: true },
    });

    if (
      !conversation ||
      conversation.visitorId !== payload.visitorId ||
      conversation.workspaceId !== payload.workspaceId
    ) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        type: "VISITOR",
        body: message,
      },
    });

    // Update conversation metadata
    const preview =
      message.length > 100 ? message.slice(0, 100) + "..." : message;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        status: "OPEN", // Re-open if it was snoozed
      },
    });

    // Trigger real-time events — batched + safe so a Pusher failure
    // doesn't 500 a successful DB write.
    const messagePayload = {
      id: newMessage.id,
      type: newMessage.type,
      body: newMessage.body,
      senderName: newMessage.senderName,
      createdAt: newMessage.createdAt,
    };
    await safeTriggerBatch(
      [
        {
          channel: `private-conversation-${conversationId}`,
          name: "message:created",
          data: messagePayload,
        },
        {
          channel: `private-workspace-${conversation.workspaceId}`,
          name: "conversation:new-message",
          data: {
            conversationId,
            lastMessageAt: new Date(),
            lastMessagePreview: preview,
          },
        },
      ],
      "POST /api/widget/conversations/[id]/messages",
    );

    // Dispatch webhooks (awaited — required for Vercel serverless)
    await dispatchWebhooks(conversation.workspaceId, "message.created", {
      conversationId,
      messageId: newMessage.id,
      type: "VISITOR",
      body: message,
      workspaceId: conversation.workspaceId,
      assigneeId: conversation.assigneeId ?? null,
    });

    // Automation rules run after the response.
    fireAutomations(
      messageReceivedEvent({
        workspaceId: conversation.workspaceId,
        conversationId,
        messageId: newMessage.id,
        body: message,
        origin: origin("visitor"),
      }),
    );

    return NextResponse.json({
      id: newMessage.id,
      type: newMessage.type,
      body: newMessage.body,
      senderName: newMessage.senderName,
      createdAt: newMessage.createdAt,
    });
  } catch (error) {
    console.error("Widget message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
