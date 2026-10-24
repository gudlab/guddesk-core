"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { safeTriggerBatch } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { requireWorkspaceMember } from "@/lib/workspace";
import { getChannelProvider } from "@/lib/channels/registry";
import {
  deliveryNotice,
  isPermanentFailure,
  withSendTimeout,
  type OutboundDelivery,
} from "@/lib/email/delivery-notice";
import { revalidatePath } from "next/cache";
import { normalizeIdempotencyKey, runReplyOnce, type EmailResult } from "@/lib/reply-idempotency";
import type { Message } from "@prisma/client";

export async function sendMessage(
  conversationId: string,
  data: { body: string; type?: "AGENT" | "NOTE"; mentions?: string[]; idempotencyKey?: string },
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

    const senderName = session.user.name ?? "Agent";
    const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;

    const realtimeEvents = (message: Message) => {
      // Batched into a single HTTPS round-trip so we don't serialize 3-6
      // sequential ~100ms calls on the reply path.
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
      if (message.type === "AGENT") {
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
      if (message.type === "NOTE" && mentions.length > 0) {
        const mentionPreview = body.length > 80 ? body.slice(0, 80) + "..." : body;
        for (const mentionedUserId of mentions) {
          events.push({
            channel: `private-workspace-${conversation.workspaceId}`,
            name: "mention:created",
            data: {
              conversationId,
              messageId: message.id,
              mentionedUserId,
              senderName,
              preview: mentionPreview,
            },
          });
        }
      }
      return events;
    };

    // Create the message at most once per composed reply, then run the
    // steps after it. The composer's key is claimed first
    // (lib/reply-idempotency.ts): a double send waits for the first, and a
    // retry runs only the steps that didn't finish (for example the email)
    // on the message that already exists.
    const run = await runReplyOnce<Message>(
      prisma,
      { conversationId, userId: session.user.id, key: normalizeIdempotencyKey(data.idempotencyKey) },
      {
        create: () =>
          prisma.message.create({
            data: {
              conversationId,
              type,
              body,
              senderId: session.user.id,
              senderName,
              mentions,
            },
          }),
        load: (messageId) => prisma.message.findFirst({ where: { id: messageId, conversationId } }),
        notify: async (message) => {
          // Update conversation metadata + track first response for SLA
          const conversationUpdate: Record<string, unknown> = {
            lastMessageAt: new Date(),
            lastMessagePreview: type === "NOTE" ? `[Note] ${preview}` : preview,
          };
          if (message.type === "AGENT" && !conversation.firstResponseAt) {
            conversationUpdate.firstResponseAt = new Date();
          }
          await prisma.conversation.update({
            where: { id: conversationId },
            data: conversationUpdate,
          });
          await safeTriggerBatch(realtimeEvents(message), "sendMessage");
        },
        webhooks: async (message) => {
          // Awaited (required for Vercel serverless)
          if (message.type === "NOTE") return;
          await dispatchWebhooks(conversation.workspaceId, "message.created", {
            conversationId,
            messageId: message.id,
            type: message.type,
            body: message.body,
            senderName: message.senderName,
            workspaceId: conversation.workspaceId,
          });
        },
        email: async (message) => {
          // Email the reply for email-channel conversations. Awaited so the
          // agent learns when it did not go out.
          if (message.type !== "AGENT" || conversation.channel !== "EMAIL") return { status: "skipped" };
          const provider = getChannelProvider("EMAIL");
          if (!provider) return { status: "skipped" };
          let delivery: OutboundDelivery | void;
          try {
            // At most ~8s: the reply is already saved, and a slow send
            // becomes a "not confirmed" notice instead of a hung box.
            delivery = await withSendTimeout(
              provider.sendOutbound(
                {
                  conversationId,
                  workspaceId: conversation.workspaceId,
                  visitorEmail: conversation.visitor?.email ?? null,
                  visitorName: conversation.visitor?.name ?? null,
                  subject: conversation.subject ?? null,
                },
                message,
              ),
            );
          } catch (err) {
            console.error("Outbound email error:", err instanceof Error ? err.name : "error");
            delivery = { status: "failed", reason: "send_failed" };
          }
          return toEmailResult(delivery);
        },
      },
    );

    if (run.kind === "busy") {
      return {
        status: "sending",
        message: "Your reply is still sending. Wait a moment, then send it again if it doesn't appear.",
      };
    }
    if (run.kind === "gone") {
      return { status: "error", retryable: false, message: "This reply was deleted, so it wasn't sent again." };
    }
    if (run.kind === "incomplete" && run.failedStep !== "email") {
      // Saved, but the conversation or webhooks didn't update. The same key
      // finishes it on the next send without a second copy.
      return {
        status: "error",
        retryable: true,
        message: "Your reply was saved but not fully sent. Send it again to finish. It won't be posted twice.",
      };
    }

    const message = run.message;
    const email = run.email;
    const emailError =
      email?.status === "failed" ? deliveryNotice({ status: "failed", reason: email.reason as FailedReason }) : null;

    revalidatePath(`/workspace`);
    return {
      status: "success",
      messageId: message.id,
      deduped: run.kind === "delivered" && run.repeat,
      emailError,
      // True when the email failed for a reason a retry may fix. Sending
      // again with the same key retries only the email.
      emailRetryable: run.kind === "incomplete",
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
    // Sending again with the same key is safe: it never adds a second copy.
    if (error instanceof Error) {
      return { status: "error", retryable: true, message: error.message };
    }
    return { status: "error", retryable: true, message: "Failed to send message" };
  }
}

type FailedReason = Extract<OutboundDelivery, { status: "failed" }>["reason"];

/** The email step's outcome for the reply runner. */
function toEmailResult(delivery: OutboundDelivery | void): EmailResult {
  if (!delivery || delivery.status === "sent") return { status: "sent" };
  if (delivery.status === "skipped") return { status: "skipped" };
  return { status: "failed", reason: delivery.reason, permanent: isPermanentFailure(delivery) };
}
