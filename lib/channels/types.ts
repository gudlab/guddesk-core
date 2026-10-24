/**
 * Channel provider abstraction.
 *
 * Each channel (widget, email, future: WhatsApp, SMS) implements
 * this interface. The registry maps channel types to providers.
 */

import type { ConversationChannel, Message } from "@prisma/client";

export interface InboundPayload {
  workspaceId: string;
  from: string; // sender identifier (email address, phone number, etc.)
  fromName?: string;
  subject?: string;
  body: string;
  rawPayload?: unknown;
  threadId?: string; // for email: In-Reply-To header, existing conversationId
  /**
   * Email reply+ only: leave the conversation's visitor as it is. The sender
   * may be someone the customer forwarded to, so their address must not
   * replace the customer's (agent replies keep going to the customer).
   */
  keepVisitor?: boolean;
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
   * For email: sends an email to the customer.
   */
  sendOutbound(context: OutboundContext, message: Message): Promise<void>;
}
