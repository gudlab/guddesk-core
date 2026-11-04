/**
 * What the agent sees when an email-channel reply was saved but its
 * email to the customer did not go out.
 */

export type OutboundDelivery =
  | { status: "sent" }
  | { status: "skipped" }
  | { status: "failed"; reason: "sender_rejected" | "recipient_rejected" | "send_failed" | "timeout" };

/** How long the reply action waits for the email before answering the agent. */
export const OUTBOUND_SEND_TIMEOUT_MS = 8_000;

/**
 * Resend answers an unverified sender domain with a validation_error
 * (403, or 422 for a malformed from). A 422 about the `to` field is the
 * customer's address, not ours. Key problems have their own names and
 * are not the workspace's address.
 */
export function deliveryFailure(error: { name: string; statusCode: number | null; message?: string }): OutboundDelivery {
  // Replies are sent with an idempotency key per message. Resend answers a
  // reused key with a different payload (the thread's References grew in
  // between) with this 409: the email for this message already went out.
  if (error.name === "invalid_idempotent_request") return { status: "sent" };
  if (error.name !== "validation_error") return { status: "failed", reason: "send_failed" };
  const message = (error.message ?? "").toLowerCase();
  if (/`to`|\bto\b field|recipient/.test(message)) return { status: "failed", reason: "recipient_rejected" };
  if (error.statusCode === 403) return { status: "failed", reason: "sender_rejected" };
  if (error.statusCode === 422 && /`from`|\bfrom\b|domain|sender/.test(message)) {
    return { status: "failed", reason: "sender_rejected" };
  }
  return { status: "failed", reason: "send_failed" };
}

/**
 * Resend refused the sender or the recipient: sending again gives the same
 * answer. Anything else (an error, a timeout) may work on a retry.
 */
export function isPermanentFailure(delivery: OutboundDelivery | void | undefined): boolean {
  return (
    !!delivery &&
    delivery.status === "failed" &&
    (delivery.reason === "sender_rejected" || delivery.reason === "recipient_rejected")
  );
}

/** A permanent failure: sending again would not help. */
const SAVED = "Your reply is saved in the conversation, so don't send it again.";
/** A failure a retry may fix. The retry reuses the reply's key, so it is not posted twice. */
const RETRY = "Your reply is saved in the conversation. Press Retry email to try again. The reply won't be posted twice.";

export function deliveryNotice(delivery: OutboundDelivery | void | undefined): string | null {
  if (!delivery || delivery.status !== "failed") return null;
  const SAVED_NOTE = isPermanentFailure(delivery) ? SAVED : RETRY;
  switch (delivery.reason) {
    case "sender_rejected":
      return `The email to the customer was not sent: Resend rejected the from address. Verify its domain in Resend, or change the from address in Email channel settings. ${SAVED}`;
    case "recipient_rejected":
      return `The email to the customer was not sent: Resend rejected the customer's email address. ${SAVED}`;
    case "timeout":
      return `The email to the customer was not confirmed: the email service didn't answer in time, so the customer may not get it. ${SAVED_NOTE}`;
    default:
      return `The email to the customer could not be sent. ${SAVED_NOTE}`;
  }
}

/** Waits for the send up to the timeout; a slower send counts as not emailed. */
export async function withSendTimeout(
  send: Promise<OutboundDelivery | void>,
  timeoutMs: number = OUTBOUND_SEND_TIMEOUT_MS,
): Promise<OutboundDelivery | void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<OutboundDelivery>((resolve) => {
    timer = setTimeout(() => resolve({ status: "failed", reason: "timeout" }), timeoutMs);
  });
  try {
    return await Promise.race([send, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
