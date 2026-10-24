/**
 * Email channel provider.
 *
 * handleInbound: creates/appends conversation from incoming customer emails
 * sendOutbound: sends agent replies via Resend with proper threading headers
 */

import type { ConversationChannel, Message } from "@prisma/client";
import type {
  ChannelProvider,
  InboundPayload,
  InboundResult,
  OutboundContext,
} from "../types";
import { prisma } from "@/lib/db";
import { cleanDisplayName, emailFrom } from "@/lib/email/from";
import { deliveryFailure, type OutboundDelivery } from "@/lib/email/delivery-notice";
import { sendEmail } from "@/lib/email/send";
import { safeTrigger, safeTriggerBatch } from "@/lib/pusher-server";
import { dispatchWebhooks } from "@/lib/webhooks";
import { computeSlaDeadlines } from "@/lib/sla/compute";
import { generateMessageId, buildReplyHeaders } from "./threading";
import { renderOutboundEmail } from "./templates";
import { fireAutomations } from "@/lib/automations/dispatch";
import { conversationCreatedEvents, messageReceivedEvent, origin } from "@/lib/automations/events";

export class EmailChannelProvider implements ChannelProvider {
  channel: ConversationChannel = "EMAIL";

  /**
   * Handle an inbound email from a customer.
   *
   * If threadId (conversationId) is provided and valid, appends to existing
   * conversation. Otherwise creates a new EMAIL conversation.
   */
  async handleInbound(payload: InboundPayload): Promise<InboundResult> {
    const {
      workspaceId,
      from,
      fromName,
      subject,
      body,
      threadId,
    } = payload;

    // Try to find existing conversation if threadId is provided
    if (threadId) {
      const existing = await prisma.conversation.findFirst({
        where: { id: threadId, workspaceId, channel: "EMAIL" },
        select: { id: true, visitorId: true, status: true },
      });

      if (existing) {
        return this.appendToConversation(existing, workspaceId, from, fromName, body);
      }
    }

    // Create new conversation with EMAIL channel
    return this.createNewConversation(workspaceId, from, fromName, subject, body);
  }

  /**
   * Send an outbound email when an agent replies to an email conversation.
   */
  async sendOutbound(context: OutboundContext, message: Message): Promise<OutboundDelivery> {
    if (!context.visitorEmail) {
      console.warn(
        `Cannot send outbound email for conversation ${context.conversationId}: no visitor email`,
      );
      return { status: "skipped" };
    }

    // Load email channel config for this workspace
    const config = await prisma.emailChannelConfig.findUnique({
      where: { workspaceId: context.workspaceId },
    });

    if (!config?.isEnabled) return { status: "skipped" };

    // Build threading headers
    const replyHeaders = await buildReplyHeaders(context.conversationId);
    const messageId = generateMessageId(context.conversationId, message.id);

    // Store the email Message-ID on the message record
    await prisma.message.update({
      where: { id: message.id },
      data: { emailMessageId: messageId },
    });

    const fromName = config.fromName ?? "Support";
    // The workspace's own verified address, else the instance sender (RESEND_FROM).
    const from = config.fromAddress
      ? `${cleanDisplayName(fromName) || "Support"} <${config.fromAddress}>`
      : emailFrom(fromName);
    const replyTo = `reply+${context.conversationId}@mail.guddesk.com`;

    const subjectLine = context.subject
      ? (context.subject.startsWith("Re:") ? context.subject : `Re: ${context.subject}`)
      : "Re: Your conversation";

    const html = renderOutboundEmail({
      body: message.body,
      senderName: message.senderName ?? fromName,
      signature: config.signature ?? undefined,
    });

    // A failed send is logged, redacted, inside sendEmail. The outcome goes
    // back to the agent's reply box.
    const sent = await sendEmail("email-channel-reply", {
      from,
      to: context.visitorEmail,
      subject: subjectLine,
      replyTo,
      html,
      headers: {
        "Message-ID": messageId,
        ...(replyHeaders.inReplyTo && {
          "In-Reply-To": replyHeaders.inReplyTo,
        }),
        ...(replyHeaders.references && {
          References: replyHeaders.references,
        }),
      },
    }, { sender: "workspace", idempotencyKey: `email-channel-reply/${message.id}` });
    return sent.status === "failed" ? deliveryFailure(sent.error) : { status: "sent" };
  }

  // ── Private helpers ──────────────────────────────────────────────

  private async appendToConversation(
    conversation: { id: string; visitorId: string; status: string },
    workspaceId: string,
    fromEmail: string,
    fromName: string | undefined,
    body: string,
  ): Promise<InboundResult> {
    // Update visitor email/name if changed
    await prisma.visitor.update({
      where: { id: conversation.visitorId },
      data: {
        ...(fromEmail && { email: fromEmail }),
        ...(fromName && { name: fromName }),
        lastSeenAt: new Date(),
      },
    });

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        type: "VISITOR",
        body,
        senderName: fromName ?? fromEmail,
      },
    });

    // Load config for autoReopen
    const config = await prisma.emailChannelConfig.findUnique({
      where: { workspaceId },
      select: { autoReopen: true },
    });

    const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;

    // Reopen if closed and autoReopen enabled
    if (conversation.status === "CLOSED" && config?.autoReopen !== false) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: "OPEN",
          closedAt: null,
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        },
      });
    }

    // Broadcast via Pusher
    await this.broadcastMessage(workspaceId, conversation.id, message);

    // Dispatch webhook
    await dispatchWebhooks(workspaceId, "message.created", {
      conversationId: conversation.id,
      messageId: message.id,
      type: "VISITOR",
      body,
      channel: "EMAIL",
      workspaceId,
    });

    fireAutomations(
      messageReceivedEvent({
        workspaceId,
        conversationId: conversation.id,
        messageId: message.id,
        body,
        origin: origin("visitor"),
      }),
    );

    return {
      conversationId: conversation.id,
      messageId: message.id,
      visitorId: conversation.visitorId,
      isNew: false,
    };
  }

  private async createNewConversation(
    workspaceId: string,
    fromEmail: string,
    fromName: string | undefined,
    subject: string | undefined,
    body: string,
  ): Promise<InboundResult> {
    // Find or create visitor by email
    let visitor = await prisma.visitor.findFirst({
      where: { workspaceId, email: fromEmail },
    });

    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: {
          workspaceId,
          email: fromEmail,
          name: fromName ?? null,
          lastSeenAt: new Date(),
        },
      });
    } else {
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          ...(fromName && { name: fromName }),
          lastSeenAt: new Date(),
        },
      });
    }

    const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;

    // Create conversation + first message
    const conversation = await prisma.conversation.create({
      data: {
        workspaceId,
        visitorId: visitor.id,
        channel: "EMAIL",
        status: "OPEN",
        // Created unassigned: the "unassigned for" automation counts from here.
        unassignedAt: new Date(),
        subject: subject ?? null,
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        messages: {
          create: {
            type: "VISITOR",
            body,
            senderName: fromName ?? fromEmail,
          },
        },
      },
      include: { messages: true },
    });

    // Compute SLA deadlines (fire-and-forget)
    computeSlaDeadlines(workspaceId, conversation.priority, conversation.createdAt)
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

    const firstMessage = conversation.messages[0];

    // Broadcast
    await safeTrigger(
      `private-workspace-${workspaceId}`,
      "conversation:created",
      {
        id: conversation.id,
        visitorId: visitor.id,
        channel: "EMAIL",
        status: "OPEN",
        subject,
        lastMessageAt: conversation.lastMessageAt,
        lastMessagePreview: preview,
        createdAt: conversation.createdAt,
      },
      "email.handleInbound",
    );

    // Dispatch webhooks
    await dispatchWebhooks(workspaceId, "conversation.created", {
      conversationId: conversation.id,
      visitorId: visitor.id,
      channel: "EMAIL",
      status: "OPEN",
      subject,
      firstMessage: body,
      createdAt: conversation.createdAt,
    });

    if (firstMessage) {
      await dispatchWebhooks(workspaceId, "message.created", {
        conversationId: conversation.id,
        messageId: firstMessage.id,
        type: "VISITOR",
        body,
        channel: "EMAIL",
        workspaceId,
      });
    }

    fireAutomations(
      conversationCreatedEvents({
        workspaceId,
        conversationId: conversation.id,
        firstMessage: firstMessage ? { id: firstMessage.id, body } : null,
        origin: origin("visitor"),
      }),
    );

    return {
      conversationId: conversation.id,
      messageId: firstMessage.id,
      visitorId: visitor.id,
      isNew: true,
    };
  }

  private async broadcastMessage(
    workspaceId: string,
    conversationId: string,
    message: { id: string; type: string; body: string; senderName: string | null; createdAt: Date },
  ) {
    await safeTriggerBatch(
      [
        {
          channel: `private-conversation-${conversationId}`,
          name: "message:created",
          data: {
            id: message.id,
            conversationId,
            type: message.type,
            body: message.body,
            senderName: message.senderName,
            createdAt: message.createdAt,
          },
        },
        {
          channel: `private-workspace-${workspaceId}`,
          name: "conversation:new-message",
          data: {
            conversationId,
            lastMessageAt: new Date(),
            lastMessagePreview:
              message.body.length > 100
                ? message.body.slice(0, 100) + "..."
                : message.body,
          },
        },
      ],
      "email.broadcastMessage",
    );
  }
}
