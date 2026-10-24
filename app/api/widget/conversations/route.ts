import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { safeTrigger } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { createVisitorToken, verifyVisitorToken } from "@/lib/visitor-auth";
import { computeSlaDeadlines } from "@/lib/sla/compute";
import { VISITOR_NOT_FOUND } from "@/lib/widget-visitor";

// POST /api/widget/conversations
// Creates a new conversation (or resumes existing) with the first message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId: rawAppId, message, visitorToken, visitorName, visitorEmail } = body;

    if (!rawAppId || !message) {
      return NextResponse.json(
        { error: "appId and message are required" },
        { status: 400 },
      );
    }

    // Strip cosmetic gd_pub_ prefix before DB lookup
    const appId = rawAppId.replace(/^gd_pub_/, "");

    // Validate App ID
    const workspace = await prisma.workspace.findUnique({
      where: { appId },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Invalid App ID" }, { status: 401 });
    }

    // Resolve or create visitor
    let visitorId: string;

    if (visitorToken) {
      const payload = verifyVisitorToken(visitorToken);
      if (payload && payload.workspaceId === workspace.id) {
        // The token can outlive its visitor. Tell the widget to drop it
        // (it retries once without a token) instead of failing on the
        // conversations_visitorId_fkey constraint with a 500.
        const exists = await prisma.visitor.findFirst({
          where: { id: payload.visitorId, workspaceId: workspace.id },
          select: { id: true },
        });
        if (!exists) {
          return NextResponse.json(
            { error: "Visitor not found", code: VISITOR_NOT_FOUND },
            { status: 401 },
          );
        }
        visitorId = payload.visitorId;

        // Update visitor info if provided
        if (visitorName || visitorEmail) {
          await prisma.visitor.update({
            where: { id: visitorId },
            data: {
              ...(visitorName && { name: visitorName }),
              ...(visitorEmail && { email: visitorEmail }),
              lastSeenAt: new Date(),
            },
          });
        }
      } else {
        // Invalid token, create new visitor
        const visitor = await prisma.visitor.create({
          data: {
            workspaceId: workspace.id,
            name: visitorName ?? null,
            email: visitorEmail ?? null,
            lastSeenAt: new Date(),
          },
        });
        visitorId = visitor.id;
      }
    } else {
      // No token, create new visitor
      const visitor = await prisma.visitor.create({
        data: {
          workspaceId: workspace.id,
          name: visitorName ?? null,
          email: visitorEmail ?? null,
          lastSeenAt: new Date(),
        },
      });
      visitorId = visitor.id;
    }

    // Create conversation + first message
    const conversation = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        visitorId,
        channel: "WIDGET",
        status: "OPEN",
        lastMessageAt: new Date(),
        lastMessagePreview:
          message.length > 100 ? message.slice(0, 100) + "..." : message,
        messages: {
          create: {
            type: "VISITOR",
            body: message,
            senderName: visitorName ?? null,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Compute SLA deadlines (fire-and-forget)
    computeSlaDeadlines(workspace.id, conversation.priority, conversation.createdAt)
      .then((sla) => {
        if (sla) {
          return prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              slaPolicyId: sla.slaPolicyId,
              firstResponseDueAt: sla.firstResponseDueAt,
              resolutionDueAt: sla.resolutionDueAt,
            },
          });
        }
      })
      .catch((err) => console.error("SLA compute error:", err));

    // Trigger real-time event for workspace inbox
    await safeTrigger(
      `private-workspace-${workspace.id}`,
      "conversation:created",
      {
        id: conversation.id,
        visitorId,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: conversation.lastMessagePreview,
        createdAt: conversation.createdAt,
      },
      "POST /api/widget/conversations",
    );

    // Dispatch webhooks (awaited — required for Vercel serverless)
    const firstMessage = conversation.messages[0];
    await dispatchWebhooks(workspace.id, "conversation.created", {
      conversationId: conversation.id,
      visitorId,
      status: "OPEN",
      firstMessage: message,
      createdAt: conversation.createdAt,
    });
    if (firstMessage) {
      await dispatchWebhooks(workspace.id, "message.created", {
        conversationId: conversation.id,
        messageId: firstMessage.id,
        type: "VISITOR",
        body: message,
        workspaceId: workspace.id,
      });
    }

    // Generate visitor token for future requests
    const newToken = createVisitorToken(visitorId, workspace.id);

    return NextResponse.json({
      conversationId: conversation.id,
      visitorId,
      visitorToken: newToken,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        type: m.type,
        body: m.body,
        senderName: m.senderName,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Widget conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
