/**
 * The one place app email is sent through Resend. It never throws: a
 * thrown error and an error Resend returns (Resend returns most errors
 * instead of throwing) both come back as { status: "failed" } and are
 * logged with the recipient masked, the key removed and no body.
 */
import { Resend } from "resend";

type ResendSendArgs = Parameters<Resend["emails"]["send"]>;
export type OutboundEmail = ResendSendArgs[0];
type ResendResult = Awaited<ReturnType<Resend["emails"]["send"]>>;

export type EmailTemplate =
  | "magic-link"
  | "password-reset"
  | "workspace-invitation"
  | "inbox-notification"
  | "sla-breach"
  | "email-channel-reply";

export type SendOutcome =
  | { status: "sent"; id: string | null }
  | { status: "failed"; error: { name: string; statusCode: number | null } };

/** "jane@example.com" becomes "j***@example.com". Display names are dropped. */
export function redactEmail(address: string): string {
  const bare = (/<([^>]+)>/.exec(address)?.[1] ?? address).trim();
  const at = bare.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${bare[0]}***${bare.slice(at)}`;
}

/** Error text for logs: addresses masked, anything like a Resend key removed, one short line. */
export function redactErrorText(text: string): string {
  return text
    .replace(/re_[A-Za-z0-9_-]+/g, "re_***")
    .replace(/[^\s<>"'(),;:]+@[^\s<>"'(),;:]+/g, (address) =>
      redactEmail(address),
    )
    .slice(0, 300);
}

const KEY_ERRORS = new Set([
  "missing_api_key",
  "invalid_api_key",
  "restricted_api_key",
]);
let keyWarningShown = false;

/** For tests: lets the once-per-process key warning fire again. */
export function resetEmailKeyWarning() {
  keyWarningShown = false;
}

/**
 * One health warning per process, on the first send Resend refuses with a
 * 401 or 403. The key is never logged.
 *
 * A missing key can't normally get here: env.mjs requires RESEND_API_KEY,
 * so a deploy without one fails at boot, naming the variable. That is on
 * purpose (a running app that silently drops every invite and reset is
 * worse). The "missing" case stays for code that runs without env.mjs.
 */
export function warnAboutResendKeyOnce(
  problem: "missing" | { statusCode: number | null; name: string },
  warn: (line: string) => void = console.warn,
) {
  if (keyWarningShown) return;
  keyWarningShown = true;
  if (problem === "missing") {
    warn(
      "[email] RESEND_API_KEY is not set, so no email can be sent. Set it to a Resend API key.",
    );
  } else if (KEY_ERRORS.has(problem.name) || problem.statusCode === 401) {
    warn(
      `[email] Resend rejected the API key (${problem.statusCode ?? "no status"} ${problem.name}). Emails are not being sent. Check RESEND_API_KEY.`,
    );
  } else {
    warn(
      `[email] Resend refused the send (${problem.statusCode ?? "no status"} ${problem.name}). Emails are not being sent. Check that the RESEND_FROM domain is verified in Resend and that RESEND_API_KEY may send from it.`,
    );
  }
}

export function isKeyProblem(statusCode: number | null, name: string): boolean {
  return statusCode === 401 || statusCode === 403 || KEY_ERRORS.has(name);
}

export function logFailedEmail(
  meta: { template: EmailTemplate; to: unknown },
  failure: { name: string; statusCode: number | null; message: string },
  error: (line: string) => void = console.error,
) {
  const to = (Array.isArray(meta.to) ? meta.to : meta.to ? [meta.to] : []).map(
    (t) => redactEmail(String(t)),
  );
  error(
    `[email] send failed: template=${meta.template} to=${to.join(",")} error=${failure.name}${
      failure.statusCode ? ` (${failure.statusCode})` : ""
    }: ${redactErrorText(failure.message)}`,
  );
}

let client: { emails: Pick<Resend["emails"], "send"> } | null = null;

function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export interface SendEmailOptions {
  /** For tests. Defaults to a Resend client using RESEND_API_KEY. */
  client?: { emails: Pick<Resend["emails"], "send"> };
  /** For tests. Defaults to process.env.RESEND_API_KEY being set. */
  hasApiKey?: boolean;
  warn?: (line: string) => void;
  error?: (line: string) => void;
}

export async function sendEmail(
  template: EmailTemplate,
  email: OutboundEmail,
  options: SendEmailOptions = {},
): Promise<SendOutcome> {
  const hasApiKey = options.hasApiKey ?? Boolean(process.env.RESEND_API_KEY);
  if (!options.client && !hasApiKey) {
    warnAboutResendKeyOnce("missing", options.warn);
    logFailedEmail(
      { template, to: email.to },
      {
        name: "missing_api_key",
        statusCode: null,
        message: "RESEND_API_KEY is not set",
      },
      options.error,
    );
    return {
      status: "failed",
      error: { name: "missing_api_key", statusCode: null },
    };
  }
  try {
    const response: ResendResult = await (
      options.client ?? getClient()
    ).emails.send(email);
    if (response.error) {
      const raw = response.error as {
        name?: string;
        statusCode?: number | null;
        message?: string;
      };
      const failure = {
        name: raw.name ?? "error",
        statusCode: raw.statusCode ?? null,
        message: raw.message ?? "",
      };
      if (isKeyProblem(failure.statusCode, failure.name)) {
        warnAboutResendKeyOnce(
          { statusCode: failure.statusCode, name: failure.name },
          options.warn,
        );
      }
      logFailedEmail({ template, to: email.to }, failure, options.error);
      return {
        status: "failed",
        error: { name: failure.name, statusCode: failure.statusCode },
      };
    }
    return { status: "sent", id: response.data?.id ?? null };
  } catch (thrown) {
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    logFailedEmail(
      { template, to: email.to },
      { name: "exception", statusCode: null, message },
      options.error,
    );
    return { status: "failed", error: { name: "exception", statusCode: null } };
  }
}

/** Thrown when Resend did not accept the sign-in email. The details are logged, redacted. */
export class MagicLinkSendFailedError extends Error {
  constructor() {
    super("Sign-in email could not be sent");
    this.name = "MagicLinkSendFailedError";
  }
}

/**
 * Auth.js's Resend provider throws "Resend error: {json}", which can
 * include addresses. Log it redacted, warn once about a rejected key, and
 * rethrow without the details (Auth.js logs the message).
 */
export async function sendMagicLinkSafely(
  identifier: string,
  send: () => void | PromiseLike<void>,
  options: Pick<SendEmailOptions, "warn" | "error"> = {},
): Promise<void> {
  try {
    await send();
  } catch (thrown) {
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    const statusCode =
      Number(/"statusCode":\s*(\d{3})/.exec(message)?.[1]) || null;
    const name = /"name":\s*"([a-z_]+)"/.exec(message)?.[1] ?? "exception";
    if (isKeyProblem(statusCode, name))
      warnAboutResendKeyOnce({ statusCode, name }, options.warn);
    logFailedEmail(
      { template: "magic-link", to: identifier },
      { name, statusCode, message },
      options.error,
    );
    throw new MagicLinkSendFailedError();
  }
}
