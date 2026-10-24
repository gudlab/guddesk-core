/**
 * POST /api/email/inbound, without the Next.js wrapper so it can be tested.
 *
 * Order: verify the Svix signature on the raw body (401 on any failure),
 * drop a repeated svix-id (200, nothing done), then parse and route.
 *
 * Two modes, by recipient:
 * 1. reply+{conversationId}@...  An agent replying by email to a
 *    notification. Posted as that agent only when the conversation exists
 *    and the sender is an active member of the conversation's workspace
 *    (and DMARC passed, when Resend reports it). Anything else is ignored,
 *    never posted as a customer message: the reply+ address only goes to
 *    agents, so another sender there is a forward or a spoof.
 * 2. support+{appId}@...  A customer emailing support.
 *
 * Verified requests that can't be used get a 200 with { ignored }, because
 * Svix retries every non-2xx and a retry would be ignored the same way.
 * Logs carry a reason code and never the body, addresses or the secret.
 */
import type { InboundPayload, InboundResult } from "@/lib/channels/types";
import type { prisma } from "@/lib/db";
import type { safeTriggerBatch } from "@/lib/pusher-server";

import { fromReceivedEmail, parseInboundPayload, type InboundEmail } from "./payload";
import { claimWebhookId, releaseWebhookId } from "./replay";
import { SIGNATURE_TOLERANCE_MS, verifySvixSignature } from "./signature";

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
  | "unknown_conversation"
  | "sender_not_authenticated"
  | "sender_not_member"
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

  // A repeat of a delivery already accepted. 200 so Svix stops retrying it.
  if (!(await claimWebhookId(deps.db, verified.id, SIGNATURE_TOLERANCE_MS, now))) {
    return ignored("replayed_id", log, id);
  }

  try {
    let json: unknown;
    try {
      json = JSON.parse(req.rawBody);
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
      email = fromReceivedEmail(await deps.fetchReceivedEmail(parsed.emailId), parsed.recipients);
    } else {
      email = parsed.email;
    }
    if (!email) return ignored("empty_email", log, id);

    const recipients = email.recipients.map((r) => r.toLowerCase());
    const reply = recipients.map((r) => /reply\+([a-z0-9]+)@/.exec(r)?.[1]).find(Boolean);
    if (reply) return await handleAgentReply(reply, email, deps, log, id);

    const appId = email.recipients.map((r) => /support\+([a-z0-9]+)@/i.exec(r)?.[1]).find(Boolean);
    if (appId) return await handleCustomerEmail(appId, email, deps, log, id);

    return ignored("unknown_recipient", log, id);
  } catch (error) {
    // Let Svix's retry (same svix-id) through.
    await releaseWebhookId(deps.db, verified.id).catch(() => {});
    const name = error instanceof Error ? error.name : "error";
    log(`[inbound-email] failed reason=processing_error error=${name} svix_id=${id}`);
    return { status: 500, body: { error: "Failed to process inbound email" } };
  }
}

// ── Mode 1: agent replying to a notification email ─────────────

async function handleAgentReply(
  conversationId: string,
  email: InboundEmail,
  deps: InboundDeps,
  log: (line: string) => void,
  id: string,
): Promise<InboundResponse> {
  const { db } = deps;
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, workspaceId: true, status: true, firstResponseAt: true },
  });
  if (!conversation) return ignored("unknown_conversation", log, id);

  // Resend reports SPF/DKIM/DMARC for received mail. A From an agent's
  // domain doesn't vouch for is not that agent.
  if (email.dmarc !== undefined && email.dmarc !== "pass") {
    return ignored("sender_not_authenticated", log, id);
  }

  const user = await db.user.findFirst({
    where: { email: { equals: email.from, mode: "insensitive" } },
    select: { id: true, name: true, isBanned: true },
  });
  if (!user || user.isBanned) return ignored("sender_not_member", log, id);

  // Membership in the conversation's own workspace. Removed members have
  // no row, so they can't post.
  const membership = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: conversation.workspaceId, userId: user.id } },
    select: { id: true },
  });
  if (!membership) return ignored("sender_not_member", log, id);

  const text = email.text.trim();
  const message = await db.message.create({
    data: {
      conversationId,
      type: "AGENT",
      body: text,
      senderId: user.id,
      senderName: user.name ?? "Agent",
    },
  });

  const preview = text.slice(0, 200);
  const at = deps.now?.() ?? new Date();
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: at,
      lastMessagePreview: preview,
      ...(conversation.firstResponseAt ? {} : { firstResponseAt: at }),
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
