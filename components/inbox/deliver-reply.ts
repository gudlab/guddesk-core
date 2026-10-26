"use client";

import { toast } from "sonner";

import { sendMessage } from "@/actions/send-message";
import { publishLocalMessage, type LocalMessage } from "@/lib/local-messages";
import { createReplyDelivery, type ReplyToSend, type SendResult } from "@/lib/reply-delivery";
import { browserKeyStorage } from "@/lib/reply-key-store";

export { CONNECTION_LOST, type DeliverOutcome, type ReplyToSend } from "@/lib/reply-delivery";

const CHANNEL = "guddesk:reply-keys";

/** A finished reply closes its Retry email notice in the other tabs too. */
let channel: BroadcastChannel | null = null;
function replyChannel(): BroadcastChannel | null {
  if (channel || typeof BroadcastChannel === "undefined") return channel;
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (event: MessageEvent) => {
      const data = event.data as { dismiss?: unknown } | null;
      if (data && typeof data.dismiss === "string") toast.dismiss(data.dismiss);
    };
  } catch {
    channel = null;
  }
  return channel;
}

const delivery = createReplyDelivery({
  send: (conversationId, data) => sendMessage(conversationId, data) as unknown as Promise<SendResult>,
  storage: browserKeyStorage,
  toast,
  publish: (conversationId, message) => publishLocalMessage(conversationId, message as LocalMessage),
  broadcast: (toastId) => replyChannel()?.postMessage({ dismiss: toastId }),
});

/**
 * Send one reply with its idempotency key (shared with the other tabs
 * through localStorage), show the result, and say whether the composer may
 * clear its text. See lib/reply-delivery.ts.
 */
export function deliverReply(reply: ReplyToSend) {
  replyChannel();
  return delivery.deliverReply(reply);
}
