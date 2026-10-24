/**
 * What the agent sees when an email-channel reply was saved but its
 * email to the customer did not go out.
 */

export type OutboundDelivery =
  | { status: "sent" }
  | { status: "skipped" }
  | { status: "failed"; reason: "sender_rejected" | "send_failed" };

/**
 * Resend answers an unverified sender domain with a validation_error
 * (403, sometimes 422). Key problems have their own names and are not
 * the workspace's address.
 */
export function deliveryFailure(error: { name: string; statusCode: number | null }): OutboundDelivery {
  const senderRejected =
    error.name === "validation_error" && (error.statusCode === 403 || error.statusCode === 422);
  return { status: "failed", reason: senderRejected ? "sender_rejected" : "send_failed" };
}

export function deliveryNotice(delivery: OutboundDelivery | void | undefined): string | null {
  if (!delivery || delivery.status !== "failed") return null;
  if (delivery.reason === "sender_rejected") {
    return "Reply saved, but the email to the customer was not sent: Resend rejected the from address. Verify its domain in Resend, or change the from address in Email channel settings.";
  }
  return "Reply saved, but the email to the customer could not be sent.";
}
