import { AuthError } from "next-auth";

import {
  emailBlockReason,
  guardEmailSend,
  isResendHealthProblem,
  logFailedEmail,
  logSkippedEmail,
  warnAboutResendKeyOnce,
  type GuardOptions,
} from "@/lib/outbound-email";

/** Options for sendMagicLink. warn and error are for tests. */
export interface MagicLinkOptions extends GuardOptions {
  warn?: (line: string) => void;
  error?: (line: string) => void;
}

/**
 * Thrown when the email gate skips a magic link, so Auth.js does not
 * show its "check your email" page. Its kind is "signIn", so Auth.js
 * redirects to the sign-in page (/login) with an error param instead.
 */
export class MagicLinkNotSentError extends AuthError {
  static type = "EmailSignInError" as const;
  static kind = "signIn" as const;
}

/** Thrown when Resend did not accept the sign-in email. The details are logged, redacted. */
export class MagicLinkSendFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MagicLinkSendFailedError";
  }
}

/** Send the sign-in link through the gate. Throws if the gate skipped it or the send failed. */
export async function sendMagicLink(
  identifier: string,
  send: () => void | PromiseLike<void>,
  options: MagicLinkOptions = {},
): Promise<void> {
  const result = await guardEmailSend(
    { to: identifier, subject: "Sign in link", template: "magic-link" },
    async () => {
      try {
        await send();
      } catch (thrown) {
        // Auth.js's Resend send throws "Resend error: {json}", which can
        // include addresses. Log it redacted, warn once about a rejected
        // key, and rethrow without the details (Auth.js logs the message).
        const message = thrown instanceof Error ? thrown.message : String(thrown);
        const statusCode = Number(/"statusCode":\s*(\d{3})/.exec(message)?.[1]) || null;
        const name = /"name":\s*"([a-z_]+)"/.exec(message)?.[1] ?? "exception";
        if (isResendHealthProblem(statusCode, name)) {
          warnAboutResendKeyOnce({ statusCode, name }, options.warn);
        }
        logFailedEmail({ template: "magic-link", to: identifier }, { name, statusCode, message }, options.error);
        throw new MagicLinkSendFailedError("Sign-in email could not be sent");
      }
      return { sent: true as const };
    },
    options,
  );
  if ("skipped" in result) {
    throw new MagicLinkNotSentError("Sign-in email not sent on this environment");
  }
}

/** /login error code for a magic link that the gate stopped before Auth.js ran. */
export const MAGIC_LINK_BLOCKED_ERROR = "EmailBlocked";
export const MAGIC_LINK_BLOCKED_REDIRECT = `/login?error=${MAGIC_LINK_BLOCKED_ERROR}`;

/**
 * For the Auth.js signIn callback. Auth.js calls it with
 * `email.verificationRequest` before it creates a verification token or
 * sends anything. Where email is blocked this returns a redirect to /login,
 * so no token row is written and nothing is thrown (a throw from
 * sendVerificationRequest shows up as an unhandled rejection in the logs).
 * Everything else is allowed through.
 */
export function magicLinkSignInGate(
  params: { email?: { verificationRequest?: boolean }; user?: { email?: string | null } },
  options: GuardOptions = {},
): true | string {
  if (!params.email?.verificationRequest) return true;
  const reason = emailBlockReason(options.env ?? process.env);
  if (!reason) return true;
  logSkippedEmail(
    {
      to: params.user?.email ? [params.user.email] : [],
      subject: "Sign in link",
      template: "magic-link",
      reason,
    },
    options.log,
  );
  return MAGIC_LINK_BLOCKED_REDIRECT;
}

export const MAGIC_LINK_BLOCKED_MESSAGE =
  "Sign-in links are not emailed on this environment (a Preview or Development deployment). Sign in with your password or Google instead.";

/**
 * Message for /login?error=... after a failed sign-in. The signIn gate
 * sends "EmailBlocked". If the send-time fallback throws instead, Auth.js
 * reports it as "Configuration", so where email is blocked that code gets
 * the same message. The environment notice only shows where the gate is
 * actually on; anywhere else (an old or hand-typed link) gets the generic
 * message.
 */
export function loginErrorMessage(error: string | undefined, emailAllowed: boolean): string | null {
  if (!error) return null;
  if ((error === MAGIC_LINK_BLOCKED_ERROR || error === "Configuration") && !emailAllowed) {
    return MAGIC_LINK_BLOCKED_MESSAGE;
  }
  if (error === "Verification") return "That sign-in link has expired or was already used. Request a new one.";
  return "Sign-in failed. Please try again.";
}
