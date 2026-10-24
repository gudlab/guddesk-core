"use client";

import { toast } from "sonner";

import { sendMessage } from "@/actions/send-message";
import { publishLocalMessage } from "@/lib/local-messages";
import { browserKeyStorage, forgetReplyKey, replyKeyFor } from "@/lib/reply-key-store";

export interface ReplyToSend {
  conversationId: string;
  body: string;
  type: "AGENT" | "NOTE";
  mentions?: string[];
}

/** What the composer should do with its text. */
export type DeliverOutcome = "posted" | "kept";

export const CONNECTION_LOST =
  "Your reply wasn't confirmed because the connection dropped. Send it again to retry. It won't be posted twice.";

/**
 * Send one reply with its idempotency key (reused from sessionStorage when
 * the same reply was sent before), show the result, and say whether the
 * composer may clear its text. A reply whose email failed for a reason a
 * retry may fix gets a Retry email button that sends it again with the
 * same key, which only retries the email.
 */
export async function deliverReply(reply: ReplyToSend): Promise<DeliverOutcome> {
  const storage = browserKeyStorage();
  const idempotencyKey = replyKeyFor(storage, reply);

  let result: Awaited<ReturnType<typeof sendMessage>>;
  try {
    result = await sendMessage(reply.conversationId, {
      body: reply.body,
      type: reply.type,
      mentions: reply.mentions,
      idempotencyKey,
    });
  } catch {
    // The request failed or the answer never arrived. The key stays, so
    // sending the same text again finishes this reply instead of adding one.
    toast.error(CONNECTION_LOST, { duration: 10000 });
    return "kept";
  }

  if (result.status === "sending") {
    toast.message(result.message ?? "Your reply is still sending.");
    return "kept";
  }

  if (result.status === "error") {
    if (!("retryable" in result && result.retryable)) forgetReplyKey(storage, reply);
    toast.error(result.message || "Failed to send message");
    return "kept";
  }

  // Show the reply in the thread now. With Pusher on, the matching
  // message:created event is merged by id and doesn't add a second copy.
  if ("sentMessage" in result && result.sentMessage) {
    publishLocalMessage(reply.conversationId, result.sentMessage);
  }

  const retryable = "emailRetryable" in result && result.emailRetryable === true;
  if (!retryable) forgetReplyKey(storage, reply);

  // Saved, but the email to the customer didn't go out.
  if ("emailError" in result && result.emailError) {
    toast.error(result.emailError, {
      duration: retryable ? 30000 : 10000,
      ...(retryable && {
        action: {
          label: "Retry email",
          onClick: () => {
            void deliverReply(reply);
          },
        },
      }),
    });
  }
  return "posted";
}
