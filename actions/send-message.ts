"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { requireWorkspaceMember } from "@/lib/workspace";
import { getChannelProvider } from "@/lib/channels/registry";
import { deliveryNotice, withSendTimeout } from "@/lib/email/delivery-notice";
import { revalidatePath } from "next/cache";

export async function sendMessage(
  conversationId: string,
  data: { body: string; type?: "AGENT" | "NOTE"; mentions?: string[] },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const { body, type = "AGENT", mentions = [] } = data;

    if (!body || body.trim().length === 0) {
      return { status: "error", message: "Message cannot be empty" };
    }

    // Verify conversation exists and user is a workspace member
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        workspaceId: true,
        visitorId: true,
        firstResponseAt: true,
        channel: true,
        subject: true,
        visitor: { select: { email: true, name: true } },
      },
    });

    if (!conversation) {
      return { status: "error", message: "Conversation not found" };
    }

    await requireWorkspaceMember(conversation.workspaceId, session.user.id);

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        type,
        body,
        senderId: session.user.id,
        senderName: session.user.name ?? "Agent",
        mentions,
      },
    });

    // Update conversation metadata + track first response for SLA
    const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;
    const conversationUpdate: Record<string, unknown> = {
      lastMessageAt: new Date(),
      lastMessagePreview: type === "NOTE" ? `[Note] ${preview}` : preview,
    };

    // Track first agent/bot response for SLA
    if (type === "AGENT" && !conversation.firstResponseAt) {
      conversationUpdate.firstResponseAt = new Date();
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: conversationUpdate,
    });

    // Trigger real-time events — batched into a single HTTPS round-trip
    // so we don't serialize 3-6 sequential ~100ms calls on the reply path.
    const messagePayload = {
      id: message.id,
      type: message.type,
      body: message.body,
      senderId: message.senderId,
      senderName: message.senderName,
      createdAt: message.createdAt,
    };

    const events: Array<{ channel: string; name: string; data: unknown }> = [
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
    ];

    if (type === "AGENT") {
      events.push(
        {
          channel: `private-visitor-${conversationId}`,
          name: "typing:stop",
          data: {},
        },
        {
          channel: `private-visitor-${conversationId}`,
          name: "message:created",
          data: messagePayload,
        },
      );
    }

    if (type === "NOTE" && mentions.length > 0) {
      const mentionPreview = body.length > 80 ? body.slice(0, 80) + "..." : body;
      for (const mentionedUserId of mentions) {
        events.push({
          channel: `private-workspace-${conversation.workspaceId}`,
          name: "mention:created",
          data: {
            conversationId,
            messageId: message.id,
            mentionedUserId,
            senderName: session.user.name ?? "Agent",
            preview: mentionPreview,
          },
        });
      }
    }

    await safeTriggerBatch(events, "sendMessage");

    // Dispatch webhooks (awaited — required for Vercel serverless)
    if (type !== "NOTE") {
      await dispatchWebhooks(conversation.workspaceId, "message.created", {
        conversationId,
        messageId: message.id,
        type: message.type,
        body: message.body,
        senderName: message.senderName,
        workspaceId: conversation.workspaceId,
      });
    }

    // Email the reply for email-channel conversations. Awaited so the agent
    // learns when it did not go out (for example Resend rejecting an
    // unverified from address). The message is saved either way.
    let emailError: string | null = null;
    if (type === "AGENT" && conversation.channel === "EMAIL") {
      const provider = getChannelProvider("EMAIL");
      if (provider) {
        const fullMessage = await prisma.message.findUnique({
          where: { id: message.id },
        });
        if (fullMessage) {
          try {
            // At most ~8s: the reply is already saved, and a slow send
            // becomes a "not confirmed" notice instead of a hung box.
            const delivery = await withSendTimeout(
              provider.sendOutbound(
                {
                  conversationId,
                  workspaceId: conversation.workspaceId,
                  visitorEmail: conversation.visitor?.email ?? null,
                  visitorName: conversation.visitor?.name ?? null,
                  subject: conversation.subject ?? null,
                },
                fullMessage,
              ),
            );
            emailError = deliveryNotice(delivery);
          } catch (err) {
            console.error("Outbound email error:", err instanceof Error ? err.name : "error");
            emailError = deliveryNotice({ status: "failed", reason: "send_failed" });
          }
        }
      }
    }

    revalidatePath(`/workspace`);
    return {
      status: "success",
      messageId: message.id,
      emailError,
      // Same shape as GET /api/inbox/conversations/[id]/messages, so the
      // thread can render it before any refetch.
      sentMessage: {
        id: message.id,
        type: message.type,
        body: message.body,
        senderId: message.senderId,
        senderName: message.senderName,
        createdAt: message.createdAt.toISOString(),
        sender: {
          name: session.user.name ?? null,
          image: session.user.image ?? null,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to send message" };
  }
}
