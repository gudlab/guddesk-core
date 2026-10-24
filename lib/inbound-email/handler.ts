/**
 * POST /api/email/inbound, without the Next.js wrapper so it can be tested.
 *
 * Order: verify the Svix signature on the raw body (401 on any failure),
 * claim the svix-id (a finished id is a 200 no-op, one still running gets
 * a 409 so Svix retries later; a database error on the claim is a 500),
 * then parse and route.
 *
 * Two modes, by recipient:
 * 1. reply+{conversationId}@...  The Reply-To on agent notifications and
 *    on agent emails to customers, so both agents and customers write to
 *    it. The conversation is looked up before the email is fetched from
 *    Resend: no conversation with that id is a 200 { ignored:
 *    unknown_conversation }, since a retry can't make one appear. Then:
 *    - The sender (bare address, display name dropped) is a member of the
 *      conversation's workspace: an agent reply, only if the email
 *      authenticates (DMARC pass, or DMARC gray and DKIM pass). Otherwise
 *      it isn't posted. The agents get a note on the conversation and the
 *      member gets a short email at their account address saying the reply
 *      wasn't posted (no body), at most once per member per conversation
 *      per hour. Never filed as a customer message. A banned member is
 *      ignored without a notice.
 *    - Anyone else: a customer message in that conversation, through the
 *      email channel's own path (handleCustomerInbound with the thread),
 *      so it fires message.created, respects autoReopen and runs what that
 *      path runs. The conversation's visitor is never changed to the sender
 *      (keepVisitor): it may be someone the customer forwarded to, and
 *      agent replies keep going to the original customer. When the sender
 *      isn't the visitor, the message's senderName is "Name (address)" so
 *      agents can see who wrote. It needs an email-channel conversation with the channel
 *      on. A customer reply is never dropped silently: when it can't be
 *      filed (not an email conversation, channel off) the answer is a 422
 *      with a reason code, and a fetch or database failure is a 500. Both
 *      free the svix-id, so Svix retries.
 * 2. support+{appId}@...  A customer emailing support.
 *
 * Other verified requests that can't be used (a spoofed member address, a
 * banned member, an unknown conversation, other event types) get a 200
 * with { ignored }: there is nothing to file, and a retry would be ignored
 * the same way.
 * Logs carry a reason code and never the body, addresses or the secret.
 */
import type { InboundPayload, InboundResult } from "@/lib/channels/types";
import type { prisma } from "@/lib/db";
import type { safeTriggerBatch } from "@/lib/pusher-server";

import { claimBounceSlot, releaseBounceSlot, unverifiedReplyNotice } from "./bounce";
import { fromReceivedEmail, parseInboundPayload, type InboundEmail } from "./payload";
import { forwardedSenderName } from "./sender-name";
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
  /**
   * Emails a member whose own reply failed DMARC/DKIM that it wasn't
   * posted, from the verified sender. Resolves false if it wasn't sent.
   * Never given the email's body.
   */
  sendUnverifiedReplyBounce(bounce: UnverifiedReplyBounce): Promise<boolean>;
  broadcast: typeof safeTriggerBatch;
  now?: () => Date;
  log?: (line: string) => void;
  /** For tests. Defaults to FETCH_TIMEOUT_MS. */
  fetchTimeoutMs?: number;
}

export interface UnverifiedReplyBounce {
  /** The member's account address (from the database, not the From header). */
  to: string;
  memberName: string;
  conversationId: string;
  workspaceId: string;
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
  | "unknown_conversation"
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
export type UnfiledReason = "not_email_conversation" | "channel_disabled";

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

  let claim: Awaited<ReturnType<typeof claimWebhookId>>;
  try {
    claim = await claimWebhookId(deps.db, verified.id, now);
  } catch (error) {
    // Nothing was claimed, so there is nothing to release; Svix retries the 500.
    const name = error instanceof Error ? error.name : "error";
    log(`[inbound-email] failed reason=claim_error error=${name} svix_id=${id}`);
    return { status: 500, body: { error: "Failed to process inbound email" } };
  }
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

  // reply+: find the conversation before fetching from Resend. If there is
  // none, a retry won't help, so stop here (200) instead of ~27h of retries.
  const replyId = replyConversationId(parsed.kind === "received" ? parsed.recipients : parsed.email.recipients);
  let conversation: ReplyConversation | null = null;
  if (replyId) {
    conversation = await findReplyConversation(deps.db, replyId);
    if (!conversation) return ignored("unknown_conversation", log, id);
  }

  let email: InboundEmail | null;
  if (parsed.kind === "received") {
    const received = await withTimeout(deps.fetchReceivedEmail(parsed.emailId), deps.fetchTimeoutMs ?? FETCH_TIMEOUT_MS);
    email = fromReceivedEmail(received, parsed.recipients);
  } else {
    email = parsed.email;
  }
  if (!email) return ignored("empty_email", log, id);

  if (conversation) return await handleReplyAddress(conversation, email, deps, log, id);

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
  visitor: { email: string | null } | null;
};

/** The conversation id in the first reply+{id}@ recipient, if any. */
export function replyConversationId(recipients: string[]): string | undefined {
  return recipients.map((r) => /reply\+([a-z0-9]+)@/.exec(r.toLowerCase())?.[1]).find(Boolean);
}

function findReplyConversation(db: InboundDb, conversationId: string): Promise<ReplyConversation | null> {
  return db.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      workspaceId: true,
      status: true,
      channel: true,
      firstResponseAt: true,
      visitor: { select: { email: true } },
    },
  });
}

async function handleReplyAddress(
  conversation: ReplyConversation,
  email: InboundEmail,
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  const { db } = deps;
  const user = await db.user.findFirst({
    where: { email: { equals: email.from, mode: "insensitive" } },
    select: { id: true, name: true, email: true, isBanned: true },
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
    if (user.isBanned) return ignored("sender_banned", log, id);
    // A member's address that doesn't authenticate: maybe a spoof, maybe
    // the member's own mail setup. Neither an agent reply nor a customer
    // message; tell the agents and the member instead.
    if (!senderAuthenticated(email)) {
      return await unverifiedMemberReply(conversation, { ...user, email: user.email ?? null }, deps, log, id);
    }
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

  // The email channel's own customer path, threaded onto this conversation:
  // message.created webhook, autoReopen and the rest, same as support+.
  // Someone other than the visitor: "Name (address)" as the senderName
  // (keepVisitor means fromName only names the message). The visitor's own
  // reply keeps its usual name.
  const forwarded = forwardedSenderName(email, conversation.visitor?.email);
  const result = await deps.handleCustomerInbound({
    workspaceId: conversation.workspaceId,
    from: email.from,
    fromName: forwarded ?? email.fromName,
    subject: email.subject,
    body: email.text.trim(),
    threadId: conversation.id,
    keepVisitor: true,
  });
  return {
    status: 200,
    body: { success: true, conversationId: result.conversationId, messageId: result.messageId, isNew: result.isNew },
  };
}

/**
 * A member's own reply that failed DMARC/DKIM: not posted. At most once per
 * member per conversation per hour, an agent-only note on the conversation
 * and a short email to the member's account address. One warn line with a
 * reason code; a 200, since a retry would end the same way.
 */
async function unverifiedMemberReply(
  conversation: ReplyConversation,
  member: { id: string; name: string | null; email: string | null },
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  const { db } = deps;
  const at = deps.now?.() ?? new Date();
  const memberName = member.name ?? "a teammate";

  if (!(await claimBounceSlot(db, member.id, conversation.id, at))) {
    log(`[inbound-email] ignored reason=sender_not_authenticated notice=rate_limited svix_id=${id}`);
    return { status: 200, body: { ignored: "sender_not_authenticated" } };
  }

  let note;
  try {
    note = await db.message.create({
      data: {
        conversationId: conversation.id,
        type: "NOTE",
        body: unverifiedReplyNotice(memberName),
        senderId: null,
        senderName: "GudDesk",
      },
    });
  } catch (error) {
    // Give the slot back so Svix's retry (this throw becomes a 500) can post it.
    await releaseBounceSlot(db, member.id, conversation.id).catch(() => {});
    throw error;
  }

  await deps.broadcast(
    [
      {
        channel: `private-conversation-${conversation.id}`,
        name: "message:created",
        data: {
          id: note.id,
          conversationId: conversation.id,
          type: note.type,
          body: note.body,
          senderName: note.senderName,
          createdAt: note.createdAt,
        },
      },
    ],
    "email.inbound",
  );

  let bounce = "no_address";
  if (member.email) {
    const sent = await deps
      .sendUnverifiedReplyBounce({
        to: member.email,
        memberName,
        conversationId: conversation.id,
        workspaceId: conversation.workspaceId,
      })
      .catch(() => false);
    bounce = sent ? "sent" : "failed";
  }
  log(`[inbound-email] ignored reason=sender_not_authenticated notice=posted bounce=${bounce} svix_id=${id}`);
  return { status: 200, body: { ignored: "sender_not_authenticated" } };
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
