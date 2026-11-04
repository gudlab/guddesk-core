/**
 * The one place outbound email is sent from.
 *
 * Vercel Preview and Development share production's Resend key, and the
 * Preview database is a copy of production (same users and conversation
 * IDs). The rule fails safe:
 *
 * - On Vercel (VERCEL=1), email is sent only when VERCEL_ENV is
 *   "production". A missing or empty VERCEL_ENV blocks.
 * - Outside Vercel (self-host), email is sent, except under
 *   NODE_ENV=development unless EMAIL_SEND_IN_DEV=1 is set.
 *
 * A blocked send is logged instead: redacted recipient, subject and
 * template only, never the body.
 */
import { Resend } from "resend";

type ResendSendArgs = Parameters<Resend["emails"]["send"]>;
export type OutboundEmail = ResendSendArgs[0];

export type EmailTemplate =
  | "magic-link"
  | "password-reset"
  | "workspace-invitation"
  | "inbox-notification"
  | "sla-breach"
  | "email-channel-reply"
  | "unverified-reply-bounce";

/** The env vars the gate reads. Defaults to process.env. */
export interface EmailEnv {
  VERCEL?: string;
  VERCEL_ENV?: string;
  NODE_ENV?: string;
  EMAIL_SEND_IN_DEV?: string;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Why email is blocked here, or null when it may be sent.
 * For example "VERCEL_ENV=preview" or "VERCEL_ENV missing".
 */
export function emailBlockReason(env: EmailEnv = process.env): string | null {
  if (clean(env.VERCEL) === "1") {
    const vercelEnv = clean(env.VERCEL_ENV);
    if (vercelEnv === "production") return null;
    return vercelEnv ? `VERCEL_ENV=${vercelEnv}` : "VERCEL_ENV missing";
  }
  if (clean(env.NODE_ENV) === "development" && clean(env.EMAIL_SEND_IN_DEV) !== "1") {
    return "NODE_ENV=development";
  }
  return null;
}

export function isEmailSendingAllowed(env: EmailEnv = process.env): boolean {
  return emailBlockReason(env) === null;
}

/**
 * reply+{conversationId}@mail.guddesk.com, or undefined where email is
 * blocked. Preview reuses production conversation IDs, so the address is
 * never built there.
 */
export function buildConversationReplyTo(
  conversationId: string,
  env: EmailEnv = process.env,
): string | undefined {
  if (!isEmailSendingAllowed(env)) return undefined;
  return `reply+${conversationId}@mail.guddesk.com`;
}

/** "jane@example.com" becomes "j***@example.com". Display names are dropped. */
export function redactEmail(address: string): string {
  const bare = (/<([^>]+)>/.exec(address)?.[1] ?? address).trim();
  const at = bare.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${bare[0]}***${bare.slice(at)}`;
}

export interface SkippedEmail {
  to: string[];
  subject: string;
  template: EmailTemplate;
  reason: string;
}

function recipients(to: unknown): string[] {
  if (Array.isArray(to)) return to.map(String);
  return to ? [String(to)] : [];
}

export function logSkippedEmail(entry: SkippedEmail, log: (line: string) => void = console.info) {
  log(
    `[email] not sent (${entry.reason}): template=${entry.template} to=${entry.to.map(redactEmail).join(",")} subject=${JSON.stringify(entry.subject)}`,
  );
}

export interface GuardOptions {
  /** For tests. Defaults to process.env. */
  env?: EmailEnv;
  log?: (line: string) => void;
}

/**
 * Run `send` only where email is allowed. Every send path goes through
 * this, including the Auth.js magic link.
 */
export async function guardEmailSend<T>(
  meta: { to: unknown; subject: string; template: EmailTemplate },
  send: () => Promise<T>,
  options: GuardOptions = {},
): Promise<T | { skipped: true }> {
  const reason = emailBlockReason(options.env ?? process.env);
  if (reason) {
    logSkippedEmail(
      { to: recipients(meta.to), subject: meta.subject, template: meta.template, reason },
      options.log,
    );
    return { skipped: true };
  }
  return send();
}

let client: Pick<Resend, "emails"> | null = null;

function getClient(): Pick<Resend, "emails"> {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export interface SendEmailOptions extends GuardOptions {
  /** For tests. Defaults to a Resend client using RESEND_API_KEY. */
  client?: { emails: Pick<Resend["emails"], "send"> };
  /** For tests. Defaults to process.env.RESEND_API_KEY being set. */
  hasApiKey?: boolean;
  /** For tests. Defaults to console.warn / console.error. */
  warn?: (line: string) => void;
  error?: (line: string) => void;
  /**
   * "workspace" when `from` is a workspace's own address (email-channel
   * replies). Resend refusing that address is the workspace's setup, not
   * RESEND_FROM, so it doesn't fire the RESEND_FROM warning. Key problems
   * still warn.
   */
  sender?: "app" | "workspace";
  /**
   * Sent as Resend's Idempotency-Key, so a retry of the same email (for
   * example after a timeout that did go through) is not delivered twice.
   * Resend keeps keys for 24 hours.
   */
  idempotencyKey?: string;
}

/** What happened to one email. Resend returns its errors instead of throwing, so both count as failed. */
export type SendOutcome =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; skipped: true }
  | {
      status: "failed";
      /** message is Resend's error text, redacted and cut short. */
      error: { name: string; statusCode: number | null; message: string };
    };

/**
 * Error text for logs: email addresses masked, anything that looks like a
 * Resend key removed, and cut to a short line.
 */
export function redactErrorText(text: string): string {
  return text
    .replace(/re_[A-Za-z0-9_-]+/g, "re_***")
    .replace(/[^\s<>"'(),;:]+@[^\s<>"'(),;:]+/g, (address) => redactEmail(address))
    .slice(0, 300);
}

const KEY_ERRORS = new Set(["missing_api_key", "invalid_api_key", "restricted_api_key"]);
// Separate once-flags, so a sender problem can't use up the key warning
// (or the other way round).
let keyWarningShown = false;
let senderWarningShown = false;

/** For tests: lets the once-per-process warnings fire again. */
export function resetEmailKeyWarning() {
  keyWarningShown = false;
  senderWarningShown = false;
}

/** A rejected or missing key, as opposed to a refused sender address. */
function isKeyRejection(problem: { statusCode: number | null; name: string }): boolean {
  return KEY_ERRORS.has(problem.name) || problem.statusCode === 401;
}

/**
 * One health warning per process, on the first send Resend refuses with a
 * 401 or 403. The key itself is never logged.
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
  if (problem !== "missing" && !isKeyRejection(problem)) {
    if (senderWarningShown) return;
    senderWarningShown = true;
  } else {
    if (keyWarningShown) return;
    keyWarningShown = true;
  }
  if (problem === "missing") {
    warn("[email] RESEND_API_KEY is not set, so no email can be sent. Set it to a Resend API key.");
  } else if (isKeyRejection(problem)) {
    warn(
      `[email] Resend rejected the API key (${problem.statusCode ?? "no status"} ${problem.name}). Emails are not being sent. Check RESEND_API_KEY.`,
    );
  } else {
    warn(
      `[email] Resend refused the send (${problem.statusCode ?? "no status"} ${problem.name}). Emails are not being sent. Check that the RESEND_FROM domain is verified in Resend and that RESEND_API_KEY may send from it.`,
    );
  }
}

/** A refusal worth the health warning: 401/403, or a key error name. */
export function isResendHealthProblem(statusCode: number | null, name: string): boolean {
  return statusCode === 401 || statusCode === 403 || KEY_ERRORS.has(name);
}

/** Log a failed send without the body, the key or the full recipient. */
export function logFailedEmail(
  meta: { template: EmailTemplate; to: unknown },
  failure: { name: string; statusCode: number | null; message: string },
  error: (line: string) => void = console.error,
) {
  const to = (Array.isArray(meta.to) ? meta.to : meta.to ? [meta.to] : []).map((t) => redactEmail(String(t)));
  error(
    `[email] send failed: template=${meta.template} to=${to.join(",")} error=${failure.name}${
      failure.statusCode ? ` (${failure.statusCode})` : ""
    }: ${redactErrorText(failure.message)}`,
  );
}

/**
 * Send through Resend, or log and skip where the gate blocks email. Never
 * throws: a thrown error and a returned Resend error both come back as
 * { status: "failed" } and are logged (redacted).
 */
export async function sendEmail(
  template: EmailTemplate,
  email: OutboundEmail,
  options: SendEmailOptions = {},
): Promise<SendOutcome> {
  const hasApiKey = options.hasApiKey ?? Boolean(process.env.RESEND_API_KEY);
  const result = await guardEmailSend(
    { to: email.to, subject: email.subject ?? "", template },
    async (): Promise<SendOutcome> => {
      if (!options.client && !hasApiKey) {
        warnAboutResendKeyOnce("missing", options.warn);
        logFailedEmail(
          { template, to: email.to },
          { name: "missing_api_key", statusCode: null, message: "RESEND_API_KEY is not set" },
          options.error,
        );
        return {
          status: "failed",
          error: { name: "missing_api_key", statusCode: null, message: "RESEND_API_KEY is not set" },
        };
      }
      try {
        const response = await (options.client ?? getClient()).emails.send(
          email,
          options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
        );
        if (response.error) {
          const raw = response.error as { name?: string; statusCode?: number | null; message?: string };
          const failure = {
            name: raw.name ?? "error",
            statusCode: raw.statusCode ?? null,
            message: raw.message ?? "",
          };
          const forWorkspace = options.sender === "workspace" && !isKeyRejection(failure);
          if (isResendHealthProblem(failure.statusCode, failure.name) && !forWorkspace) {
            warnAboutResendKeyOnce({ statusCode: failure.statusCode, name: failure.name }, options.warn);
          }
          logFailedEmail({ template, to: email.to }, failure, options.error);
          return {
            status: "failed",
            error: { name: failure.name, statusCode: failure.statusCode, message: redactErrorText(failure.message) },
          };
        }
        return { status: "sent", id: response.data?.id ?? null };
      } catch (thrown) {
        const message = thrown instanceof Error ? thrown.message : String(thrown);
        logFailedEmail({ template, to: email.to }, { name: "exception", statusCode: null, message }, options.error);
        return { status: "failed", error: { name: "exception", statusCode: null, message: redactErrorText(message) } };
      }
    },
    options,
  );
  return "skipped" in result ? { status: "skipped", skipped: true } : result;
}

/**
 * Fetch a received email (body, headers, SPF/DKIM/DMARC) for the inbound
 * webhook, which only carries its id. A read, so the send gate doesn't
 * apply. Throws when Resend doesn't return it, so the webhook answers 500
 * and Svix retries.
 */
export async function fetchReceivedEmail(emailId: string): Promise<Record<string, unknown>> {
  const { data, error } = await getClient().emails.receiving.get(emailId);
  if (error || !data) {
    const failure = new Error("Received email not available");
    failure.name = error?.name ?? "not_found";
    throw failure;
  }
  return data as unknown as Record<string, unknown>;
}
