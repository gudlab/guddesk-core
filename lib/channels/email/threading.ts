/**
 * Email threading utilities.
 *
 * Generates Message-ID headers and builds In-Reply-To / References
 * headers for proper email threading in mail clients.
 */

import { prisma } from "@/lib/db";

const DOMAIN = "mail.guddesk.com";

/**
 * Generate an RFC 2822 Message-ID for a new outbound email.
 */
export function generateMessageId(
  conversationId: string,
  messageId: string,
): string {
  return `<msg-${messageId}@${DOMAIN}>`;
}

/**
 * Generate the initial Message-ID for a conversation thread.
 * Used as the root of the email thread.
 */
export function generateThreadId(conversationId: string): string {
  return `<thread-${conversationId}@${DOMAIN}>`;
}

/** The part of the Prisma client buildReplyHeaders reads. */
export interface ThreadingDb {
  message: {
    findMany(args: {
      where: {
        conversationId: string;
        emailMessageId: { not: null };
        id?: { not: string };
        createdAt?: { lt: Date };
      };
      select: { emailMessageId: true };
      orderBy: { createdAt: "asc" };
      take: number;
    }): Promise<Array<{ emailMessageId: string | null }>>;
  };
}

/**
 * Build In-Reply-To and References headers for an outbound email.
 *
 * Queries earlier messages in the conversation that have emailMessageId
 * set, and builds the appropriate headers for email threading.
 *
 * Pass the message being emailed as `current`: only messages created
 * before it count, and never the message itself. Its own Message-ID is
 * stored before the send, so without this a retried send would reply to
 * itself, and every retry would send a different payload than the first
 * (which defeats Resend's idempotency key).
 */
export async function buildReplyHeaders(
  conversationId: string,
  current?: { id: string; createdAt: Date },
  db: ThreadingDb = prisma as unknown as ThreadingDb,
): Promise<{
  inReplyTo: string | undefined;
  references: string | undefined;
}> {
  // Get earlier messages with email IDs, ordered chronologically
  const previousMessages = await db.message.findMany({
    where: {
      conversationId,
      emailMessageId: { not: null },
      ...(current && { id: { not: current.id }, createdAt: { lt: current.createdAt } }),
    },
    select: { emailMessageId: true },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  if (previousMessages.length === 0) {
    // First email in thread — use the thread ID as reference
    const threadId = generateThreadId(conversationId);
    return {
      inReplyTo: threadId,
      references: threadId,
    };
  }

  const messageIds = previousMessages
    .map((m) => m.emailMessageId!)
    .filter(Boolean);

  // In-Reply-To: the most recent message
  const inReplyTo = messageIds[messageIds.length - 1];

  // References: thread root + all previous (up to a reasonable limit)
  const threadId = generateThreadId(conversationId);
  const references = [threadId, ...messageIds.slice(-10)].join(" ");

  return { inReplyTo, references };
}
