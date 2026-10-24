import { Resend } from "resend";

import { prisma } from "@/lib/db";
import { bounceFrom } from "@/lib/email/bounce-from";
import { unverifiedReplyEmail } from "@/lib/inbound-email/bounce";
import type { UnverifiedReplyBounce } from "@/lib/inbound-email/handler";

const resend = new Resend(process.env.RESEND_API_KEY);
const brandColor = "#3ECF8E";

export async function sendAgentNotificationEmail(
  conversationId: string,
  visitorMessage: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      workspace: { select: { name: true, slug: true } },
      visitor: { select: { name: true, email: true } },
      assignee: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!conversation?.assignee?.user.email) return;

  const visitorLabel =
    conversation.visitor.name ??
    conversation.visitor.email ??
    "A visitor";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inboxUrl = `${appUrl}/workspace/${conversation.workspace.slug}/inbox?c=${conversationId}`;

  try {
    await resend.emails.send({
      from: `${conversation.workspace.name} <notifications@guddesk.com>`,
      to: conversation.assignee.user.email,
      subject: `New message from ${visitorLabel}`,
      replyTo: `reply+${conversationId}@mail.guddesk.com`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
          <div style="background-color: ${brandColor}; border-radius: 8px 8px 0 0; padding: 20px 24px; text-align: center;">
            <span style="color: white; font-size: 18px; font-weight: 700;">GudDesk</span>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: white; padding: 24px;">
            <p style="color: #1f2937; font-size: 14px; margin: 0 0 4px;">
              <strong>${visitorLabel}</strong> sent a new message:
            </p>
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #374151; line-height: 1.5;">
              ${visitorMessage.replace(/\n/g, "<br />")}
            </div>
            <div style="text-align: center; margin: 24px 0 8px;">
              <a href="${inboxUrl}" style="display: inline-block; background-color: ${brandColor}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                View in Inbox
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; line-height: 1.5;">
              You can also reply directly to this email to respond to the visitor.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
            ${conversation.workspace.name} via GudDesk
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send agent notification email:", error);
  }
}

/**
 * Send an SLA breach notification email to the assigned agent.
 */
export async function sendSlaBreachNotification(
  conversationId: string,
  breachType: "first_response" | "resolution",
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      workspace: { select: { name: true, slug: true } },
      visitor: { select: { name: true, email: true } },
      assignee: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!conversation?.assignee?.user.email) return;

  const visitorLabel =
    conversation.visitor.name ??
    conversation.visitor.email ??
    "A visitor";

  const breachLabel =
    breachType === "first_response"
      ? "First Response SLA Breached"
      : "Resolution SLA Breached";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inboxUrl = `${appUrl}/workspace/${conversation.workspace.slug}/inbox?c=${conversationId}`;

  try {
    await resend.emails.send({
      from: `${conversation.workspace.name} <notifications@guddesk.com>`,
      to: conversation.assignee.user.email,
      subject: `[SLA Breach] ${breachLabel} — ${visitorLabel}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
          <div style="background-color: #ef4444; border-radius: 8px 8px 0 0; padding: 20px 24px; text-align: center;">
            <span style="color: white; font-size: 18px; font-weight: 700;">SLA Breach Alert</span>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: white; padding: 24px;">
            <p style="color: #1f2937; font-size: 14px; margin: 0 0 4px;">
              <strong>${breachLabel}</strong> for conversation with <strong>${visitorLabel}</strong>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0;">
              ${conversation.subject ? `Subject: ${conversation.subject}` : ""}
            </p>
            <div style="text-align: center; margin: 24px 0 8px;">
              <a href="${inboxUrl}" style="display: inline-block; background-color: #ef4444; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                View in Inbox
              </a>
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
            ${conversation.workspace.name} via GudDesk
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send SLA breach notification:", error);
  }
}

/**
 * A member's own email reply failed DMARC/DKIM and wasn't posted: tell
 * them at their account address. No Reply-To (they should answer in the
 * app) and never the original body.
 */
export async function sendUnverifiedReplyBounce(bounce: UnverifiedReplyBounce): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: bounce.workspaceId },
    select: { slug: true },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inboxUrl = workspace ? `${appUrl}/workspace/${workspace.slug}/inbox?c=${bounce.conversationId}` : appUrl;
  const content = unverifiedReplyEmail({ memberName: bounce.memberName, inboxUrl });
  try {
    const { error } = await resend.emails.send({
      from: bounceFrom(),
      to: bounce.to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
    if (error) {
      console.error(`[email] send failed: template=unverified-reply-bounce error=${error.name}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] send failed: template=unverified-reply-bounce error=${error instanceof Error ? error.name : "error"}`);
    return false;
  }
}
