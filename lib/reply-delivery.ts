/**
 * The composer's send flow, with its browser and server pieces passed in
 * so it can be tested (components/inbox/deliver-reply.ts wires the real
 * ones).
 *
 * - The reply's key comes from the shared key store (lib/reply-key-store.ts),
 *   so a repeat, a reload or a second tab reuses it.
 * - A temporary email failure shows a notice with Retry email. That button
 *   carries the exact key of the attempt that showed it and never makes a
 *   new one: if the key is no longer pending (the reply was finished by
 *   another send, another tab, or another Retry), the click does nothing.
 * - Once a reply is finished by any path, its Retry email notice is
 *   dismissed here and in the other tabs.
 * - A permanent email failure keeps the key for a short while, so the same
 *   text sent again returns the stored outcome instead of a 2nd message.
 */
import {
  acquireReplyKey,
  forgetReplyKey,
  holdFinalReplyKey,
  isPendingReplyKey,
  type KeyStorage,
} from "./reply-key-store";

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

/** The subset of sendMessage's answer this flow reads. */
export type SendResult =
  | { status: "sending"; message?: string }
  | { status: "error"; message?: string; retryable?: boolean }
  | {
      status: "success";
      emailError?: string | null;
      emailRetryable?: boolean;
      sentMessage?: unknown;
    };

export interface ToastApi {
  error(message: string, options?: {
    id?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
  }): unknown;
  message(message: string): unknown;
  dismiss(id: string): unknown;
}

export interface ReplyDeliveryDeps {
  send(
    conversationId: string,
    data: { body: string; type: "AGENT" | "NOTE"; mentions?: string[]; idempotencyKey: string },
  ): Promise<SendResult>;
  storage(): KeyStorage;
  toast: ToastApi;
  publish(conversationId: string, message: unknown): void;
  /** Tell the other tabs that a reply is finished. */
  broadcast?(toastId: string): void;
  acquireKey?: typeof acquireReplyKey;
  now?: () => number;
}

/** The id of a reply's Retry email notice; the same in every tab. */
export function retryToastId(key: string): string {
  return `reply-email:${key}`;
}

export function createReplyDelivery(deps: ReplyDeliveryDeps) {
  const now = deps.now ?? Date.now;
  const acquireKey = deps.acquireKey ?? acquireReplyKey;

  function finished(reply: ReplyToSend, key: string) {
    forgetReplyKey(deps.storage(), reply, key);
    const id = retryToastId(key);
    deps.toast.dismiss(id);
    deps.broadcast?.(id);
  }

  /**
   * The Retry email button: retry with this exact key, or do nothing when
   * the key is no longer pending.
   */
  async function retryEmail(reply: ReplyToSend, key: string): Promise<DeliverOutcome | "stale"> {
    if (!isPendingReplyKey(deps.storage(), reply, key, now())) {
      deps.toast.dismiss(retryToastId(key));
      return "stale";
    }
    return sendWithKey(reply, key);
  }

  async function sendWithKey(reply: ReplyToSend, key: string): Promise<DeliverOutcome> {
    let result: SendResult;
    try {
      result = await deps.send(reply.conversationId, {
        body: reply.body,
        type: reply.type,
        mentions: reply.mentions,
        idempotencyKey: key,
      });
    } catch {
      // The request failed or the answer never arrived. The key stays, so
      // sending the same text again finishes this reply instead of adding one.
      deps.toast.error(CONNECTION_LOST, { duration: 10000 });
      return "kept";
    }

    if (result.status === "sending") {
      deps.toast.message(result.message ?? "Your reply is still sending.");
      return "kept";
    }

    if (result.status === "error") {
      if (!result.retryable) finished(reply, key);
      deps.toast.error(result.message || "Failed to send message");
      return "kept";
    }

    // Show the reply in the thread now. With Pusher on, the matching
    // message:created event is merged by id and doesn't add a second copy.
    if (result.sentMessage) deps.publish(reply.conversationId, result.sentMessage);

    const retryable = result.emailRetryable === true;
    if (!result.emailError) {
      // Email sent or not needed: the reply is finished.
      finished(reply, key);
      return "posted";
    }

    if (retryable) {
      // Saved, but the email didn't go out. Retry email carries this key.
      deps.toast.error(result.emailError, {
        id: retryToastId(key),
        duration: 30000,
        action: {
          label: "Retry email",
          onClick: () => {
            void retryEmail(reply, key);
          },
        },
      });
    } else {
      // Refused for good. Keep the key a while so the same text repeats
      // this outcome instead of posting again; no Retry email.
      holdFinalReplyKey(deps.storage(), reply, key, now());
      deps.toast.dismiss(retryToastId(key));
      deps.broadcast?.(retryToastId(key));
      deps.toast.error(result.emailError, { duration: 10000 });
    }
    return "posted";
  }

  /**
   * Send one reply with its idempotency key (reused when the same reply was
   * sent before, in this tab or another), show the result, and say whether
   * the composer may clear its text.
   */
  async function deliverReply(reply: ReplyToSend): Promise<DeliverOutcome> {
    const key = await acquireKey(deps.storage(), reply, { now });
    return sendWithKey(reply, key);
  }

  return { deliverReply, retryEmail };
}
