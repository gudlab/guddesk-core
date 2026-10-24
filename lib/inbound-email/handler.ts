/**
 * POST /api/email/inbound, without the Next.js wrapper so it can be tested.
 *
 * Order: verify the Svix signature on the raw body (401 on any failure),
 * claim the svix-id (a finished id is a 200 no-op, one still running gets
 * a 409 so Svix retries later), then parse and route.
 *
 * Two modes, by recipient:
 * 1. reply+{conversationId}@...  The Reply-To on agent notifications and
 *    on agent emails to customers, so both agents and customers write to
 *    it. Needs an existing conversation. Then:
 *    - The sender is a member of the conversation's workspace: an agent
 *      reply, only if the email authenticates (DMARC pass, or DMARC gray
 *      and DKIM pass). Otherwise it is a spoof of that member and is
 *      ignored, never filed as a customer message.
 *    - Anyone else: a customer message in that conversation, never an
 *      agent message. It needs an email-channel conversation with the
 *      channel on.
 *    A customer reply is never dropped silently. When it can't be filed
 *    (no such conversation, not an email conversation, channel off) the
 *    answer is a 422 with a reason code, and a fetch or database failure
 *    is a 500. Both free the svix-id, so Svix retries.
 * 2. support+{appId}@...  A customer emailing support.
 *
 * Other verified requests that can't be used (a spoofed member address, a
 * banned member, other event types) get a 200 with { ignored }: there is
 * nothing to file, and a retry would be ignored the same way.
 * Logs carry a reason code and never the body, addresses or the secret.
 */
import type { InboundPayload, InboundResult } from "@/lib/channels/types";
import type { prisma } from "@/lib/db";
import type { safeTriggerBatch } from "@/lib/pusher-server";

import { fromReceivedEmail, parseInboundPayload, type InboundEmail } from "./payload";
import { claimWebhookId, finishWebhookId, releaseWebhookId } from "./replay";
import { verifySvixSignature } from "./signature";

/** resend.emails.receiving.get gets this long before the attempt fails (500, retried). */
export const FETCH_TIMEOUT_MS = 10_000;

export type InboundDb = Pick<
  typeof prisma,
  | "conversation"
  | "emailChannelConfig"
  | "message"
  | "user"
  | "verificationToken"
  | "workspace"
  | "workspaceMember"
>;

export interface InboundDeps {
  db: InboundDb;
  secret: string | undefined;
  /** resend.emails.receiving.get. Throws when Resend can't return it yet. */
  fetchReceivedEmail(emailId: string): Promise<Record<string, unknown>>;
  handleCustomerInbound(payload: InboundPayload): Promise<InboundResult>;
  broadcast: typeof safeTriggerBatch;
  now?: () => Date;
  log?: (line: string) => void;
  /** For tests. Defaults to FETCH_TIMEOUT_MS. */
  fetchTimeoutMs?: number;
}

export interface InboundRequest {
  headers: { get(name: string): string | null };
  rawBody: string;
}

export interface InboundResponse {
  status: number;
  body: Record<string, unknown>;
}

export type IgnoreReason =
  | "replayed_id"
  | "event_type"
  | "empty_email"
  | "unknown_recipient"
  | "sender_not_authenticated"
  | "sender_banned"

  | "unknown_app"
  | "channel_disabled";

/** svix-id is client-supplied; keep only id-like characters for logs. */
function logId(id: string | null): string {
  return (id ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "none";
}

const ignored = (reason: IgnoreReason, log: (line: string) => void, id: string): InboundResponse => {
  log(`[inbound-email] ignored reason=${reason} svix_id=${id}`);
  return { status: 200, body: { ignored: reason } };
};

/** Why a customer reply to a reply+ address couldn't be filed (yet). */
export type UnfiledReason = "unknown_conversation" | "not_email_conversation" | "channel_disabled";

/** Not a 2xx, so Svix retries; the caller frees the svix-id. */
const unfiled = (reason: UnfiledReason, log: (line: string) => void, id: string): InboundResponse => {
  log(`[inbound-email] unfiled reason=${reason} svix_id=${id}`);
  return { status: 422, body: { error: "Customer reply not filed", reason } };
};

export async function handleInboundEmail(
  req: InboundRequest,
  deps: InboundDeps,
): Promise<InboundResponse> {
  const log = deps.log ?? console.warn;
  const now = deps.now?.() ?? new Date();
  const headers = {
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
  };

  const verified = verifySvixSignature(deps.secret, headers, req.rawBody, now);
  if (!verified.ok) {
    log(`[inbound-email] rejected reason=${verified.reason} svix_id=${logId(headers.id)}`);
    return { status: 401, body: { error: "Invalid webhook signature" } };
  }
  const id = logId(verified.id);

  const claim = await claimWebhookId(deps.db, verified.id, now);
  // Finished before: 200 so Svix stops retrying it.
  if (claim === "done") return ignored("replayed_id", log, id);
  // The first attempt is still running and may yet fail: not a 2xx, so
  // Svix tries again later.
  if (claim === "in_flight") {
    log(`[inbound-email] deferred reason=in_flight svix_id=${id}`);
    return { status: 409, body: { error: "Already processing this delivery" } };
  }

  try {
    const response = await processVerified(req.rawBody, deps, log, id);
    if (response.status >= 200 && response.status < 300) {
      await finishWebhookId(deps.db, verified.id, deps.now?.() ?? new Date());
    } else {
      // Not handled: let Svix's retry (same svix-id) through.
      await releaseWebhookId(deps.db, verified.id);
    }
    return response;
  } catch (error) {
    // Let Svix's retry (same svix-id) through.
    await releaseWebhookId(deps.db, verified.id).catch(() => {});
    const name = error instanceof Error ? error.name : "error";
    log(`[inbound-email] failed reason=processing_error error=${name} svix_id=${id}`);
    return { status: 500, body: { error: "Failed to process inbound email" } };
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`Timed out after ${ms} ms`);
      error.name = "timeout";
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function processVerified(
  rawBody: string,
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    log(`[inbound-email] rejected reason=invalid_json svix_id=${id}`);
    return { status: 400, body: { error: "Invalid payload" } };
  }

  const parsed = parseInboundPayload(json);
  if (parsed.kind === "invalid") {
    log(`[inbound-email] rejected reason=invalid_payload svix_id=${id}`);
    return { status: 400, body: { error: "Invalid payload" } };
  }
  if (parsed.kind === "ignored_event") return ignored("event_type", log, id);

  let email: InboundEmail | null;
  if (parsed.kind === "received") {
    const received = await withTimeout(deps.fetchReceivedEmail(parsed.emailId), deps.fetchTimeoutMs ?? FETCH_TIMEOUT_MS);
    email = fromReceivedEmail(received, parsed.recipients);
  } else {
    email = parsed.email;
  }
  if (!email) return ignored("empty_email", log, id);

  const recipients = email.recipients.map((r) => r.toLowerCase());
  const reply = recipients.map((r) => /reply\+([a-z0-9]+)@/.exec(r)?.[1]).find(Boolean);
  if (reply) return await handleReplyAddress(reply, email, deps, log, id);

  const appId = email.recipients.map((r) => /support\+([a-z0-9]+)@/i.exec(r)?.[1]).find(Boolean);
  if (appId) return await handleCustomerEmail(appId, email, deps, log, id);

  return ignored("unknown_recipient", log, id);
}

// ── Mode 1: reply+{conversationId} ─────────────────────────────

/**
 * DMARC pass, or DMARC gray (anything but pass or fail, e.g. none) with
 * DKIM pass. Without results (the legacy payload) the sender is not
 * authenticated.
 */
export function senderAuthenticated(email: Pick<InboundEmail, "dmarc" | "dkim">): boolean {
  if (email.dmarc === "pass") return true;
  if (email.dmarc === "fail") return false;
  return email.dkim === "pass";
}

type ReplyConversation = {
  id: string;
  workspaceId: string;
  status: string;
  channel: string;
  firstResponseAt: Date | null;
};

async function handleReplyAddress(
  conversationId: string,
  email: InboundEmail,
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  const { db } = deps;
  const conversation: ReplyConversation | null = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, workspaceId: true, status: true, channel: true, firstResponseAt: true },
  });
  // There's no workspace to check the sender against, so this can't be
  // told apart from a customer reply: don't drop it.
  if (!conversation) return unfiled("unknown_conversation", log, id);

  const user = await db.user.findFirst({
    where: { email: { equals: email.from, mode: "insensitive" } },
    select: { id: true, name: true, isBanned: true },
  });
  // Membership in the conversation's own workspace. Removed members have
  // no row, so they count as anyone else.
  const membership = user
    ? await db.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: conversation.workspaceId, userId: user.id } },
        select: { id: true },
      })
    : null;

  if (user && membership) {
    // A member's address that doesn't authenticate is a spoof of that
    // member: neither an agent reply nor a customer message.
    if (!senderAuthenticated(email)) return ignored("sender_not_authenticated", log, id);
    if (user.isBanned) return ignored("sender_banned", log, id);
    return postReply(conversation, email, deps, {
      type: "AGENT",
      senderId: user.id,
      senderName: user.name ?? "Agent",
    });
  }

  // Anyone else is the customer side of the thread (the customer answering
  // an agent's email, or someone they forwarded it to). Only on an email
  // conversation whose workspace still has the email channel on.
  if (conversation.channel !== "EMAIL") return unfiled("not_email_conversation", log, id);
  const config = await db.emailChannelConfig.findUnique({
    where: { workspaceId: conversation.workspaceId },
    select: { isEnabled: true },
  });
  if (!config?.isEnabled) return unfiled("channel_disabled", log, id);

  return postReply(conversation, email, deps, {
    type: "VISITOR",
    senderId: null,
    senderName: email.fromName ?? email.from,
  });
}

async function postReply(
  conversation: ReplyConversation,
  email: InboundEmail,
  deps: InboundDeps,
  sender: { type: "AGENT" | "VISITOR"; senderId: string | null; senderName: string },
): Promise<InboundResponse> {
  const { db } = deps;
  const conversationId = conversation.id;
  const text = email.text.trim();
  const message = await db.message.create({
    data: {
      conversationId,
      type: sender.type,
      body: text,
      senderId: sender.senderId,
      senderName: sender.senderName,
    },
  });

  const at = deps.now?.() ?? new Date();
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: at,
      lastMessagePreview: text.slice(0, 200),
      ...(sender.type === "AGENT" && !conversation.firstResponseAt ? { firstResponseAt: at } : {}),
      ...(conversation.status === "CLOSED" ? { status: "OPEN" as const, closedAt: null } : {}),
    },
  });

  await deps.broadcast(
    [
      {
        channel: `private-conversation-${conversationId}`,
        name: "message:created",
        data: {
          id: message.id,
          conversationId,
          type: message.type,
          body: message.body,
          senderName: message.senderName,
          createdAt: message.createdAt,
        },
      },
      {
        channel: `private-workspace-${conversation.workspaceId}`,
        name: "conversation:updated",
        data: { conversationId },
      },
    ],
    "email.inbound",
  );

  return { status: 200, body: { success: true, messageId: message.id } };
}

// ── Mode 2: customer emailing support ──────────────────────────

async function handleCustomerEmail(
  appId: string,
  email: InboundEmail,
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  const { db } = deps;
  const workspace = await db.workspace.findUnique({ where: { appId }, select: { id: true } });
  if (!workspace) return ignored("unknown_app", log, id);

  const config = await db.emailChannelConfig.findUnique({
    where: { workspaceId: workspace.id },
    select: { isEnabled: true },
  });
  if (!config?.isEnabled) return ignored("channel_disabled", log, id);

  // Thread onto an earlier conversation only within this workspace.
  let threadId: string | undefined;
  const inReplyTo = email.headers["in-reply-to"];
  if (inReplyTo) {
    const referenced = await db.message.findFirst({
      where: { emailMessageId: inReplyTo, conversation: { workspaceId: workspace.id } },
      select: { conversationId: true },
    });
    threadId = referenced?.conversationId;
  }

  const references = email.headers["references"];
  if (!threadId && references) {
    const refIds = references.split(/\s+/).filter(Boolean);
    for (const ref of refIds) {
      const threadMatch = /thread-([a-z0-9]+)@/i.exec(ref);
      if (!threadMatch) continue;
      const exists = await db.conversation.findFirst({
        where: { id: threadMatch[1], workspaceId: workspace.id },
        select: { id: true },
      });
      if (exists) {
        threadId = exists.id;
        break;
      }
    }
    if (!threadId) {
      for (const ref of refIds) {
        const msg = await db.message.findFirst({
          where: { emailMessageId: ref, conversation: { workspaceId: workspace.id } },
          select: { conversationId: true },
        });
        if (msg) {
          threadId = msg.conversationId;
          break;
        }
      }
    }
  }

  const result = await deps.handleCustomerInbound({
    workspaceId: workspace.id,
    from: email.from,
    fromName: email.fromName,
    subject: email.subject,
    body: email.text.trim(),
    threadId,
  });

  return {
    status: 200,
    body: {
      success: true,
      conversationId: result.conversationId,
      messageId: result.messageId,
      isNew: result.isNew,
    },
  };
}
