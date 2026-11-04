export type InviteEmailStatus = "sent" | "skipped" | "failed";

export type InviteNotice =
  | { kind: "sent"; message: string }
  | { kind: "unsent"; message: string }
  | { kind: "link"; message: string; inviteUrl: string };

export const INVITE_SENT_MESSAGE = "Invitation sent.";
export const INVITE_SKIPPED_MESSAGE =
  "Invitation created, but no email was sent. Email is turned off on this environment (a Preview or Development deployment). Copy the link below and send it yourself.";
export const INVITE_FAILED_MESSAGE =
  "Invitation created, but the email could not be sent. Copy the link below and send it yourself.";

export const INVITE_UNSENT_NO_LINK_MESSAGE =
  "Invitation created, but no email was sent and the invite link is not available here. Revoke it and invite again from an environment that sends email.";

/** What the invite form shows after a successful invite action. */
export function inviteNotice(result: {
  emailStatus?: InviteEmailStatus;
  inviteUrl?: string;
}): InviteNotice {
  const status = result.emailStatus ?? "sent";
  if (status === "sent") {
    return { kind: "sent", message: INVITE_SENT_MESSAGE };
  }
  // Never say "sent" for a skipped or failed email, even without a link.
  if (!result.inviteUrl) {
    return { kind: "unsent", message: INVITE_UNSENT_NO_LINK_MESSAGE };
  }
  return {
    kind: "link",
    message: status === "skipped" ? INVITE_SKIPPED_MESSAGE : INVITE_FAILED_MESSAGE,
    inviteUrl: result.inviteUrl,
  };
}
