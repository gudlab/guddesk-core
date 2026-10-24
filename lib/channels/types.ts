/**
 * Channel provider abstraction.
 *
 * Each channel (widget, email, future: WhatsApp, SMS) implements
 * this interface. The registry maps channel types to providers.
 */

import type { ConversationChannel, Message } from "@prisma/client";

import type { OutboundDelivery } from "@/lib/email/delivery-notice";

export interface InboundPayload {
  workspaceId: string;
  from: string; // sender identifier (email address, phone number, etc.)
  fromName?: string;
  subject?: string;
  body: string;
  rawPayload?: unknown;
  threadId?: string; // for email: In-Reply-To header, existing conversationId
  attachments?: Array<{ name: string; url: string; type: string }>;
}

export interface InboundResult {
  conversationId: string;
  messageId: string;
  visitorId: string;
  isNew: boolean; // was a new conversation created?
}

export interface OutboundContext {
  conversationId: string;
  workspaceId: string;
  visitorEmail: string | null;
  visitorName: string | null;
  subject: string | null;
}

export interface ChannelProvider {
  channel: ConversationChannel;

  /**
   * Handle an inbound event from this channel.
   * Creates or appends to a conversation.
   */
  handleInbound(payload: InboundPayload): Promise<InboundResult>;

  /**
   * Send a reply to the external channel when an agent responds.
   * For widget: no-op (widget uses Pusher).
   * For email: sends an email to the customer and says whether it went out.
   */
  sendOutbound(context: OutboundContext, message: Message): Promise<OutboundDelivery | void>;
}
