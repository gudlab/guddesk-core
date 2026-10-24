import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { EmailChannelProvider } from "@/lib/channels/email/provider";
import { prisma } from "@/lib/db";
import { sendUnverifiedReplyBounce } from "@/lib/email-notifications";
import { handleInboundEmail } from "@/lib/inbound-email/handler";
import { safeTriggerBatch } from "@/lib/pusher-server";

const emailProvider = new EmailChannelProvider();
let resend: Resend | null = null;

/**
 * The webhook only carries the received email's id. Fetch its body,
 * headers and SPF/DKIM/DMARC results. Throws when Resend doesn't return
 * it, so the webhook answers 500 and Svix retries.
 */
async function fetchReceivedEmail(emailId: string): Promise<Record<string, unknown>> {
  resend ??= new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.receiving.get(emailId);
  if (error || !data) {
    const failure = new Error("Received email not available");
    failure.name = error?.name ?? "not_found";
    throw failure;
  }
  return data as unknown as Record<string, unknown>;
}

// POST /api/email/inbound
// Resend's inbound email webhook. Signed with Svix: without
// RESEND_WEBHOOK_SECRET every request is refused (401). See
// lib/inbound-email/handler.ts for the checks and the two modes.
export async function POST(req: NextRequest) {
  // The signature covers the exact bytes, so read the raw body first.
  const rawBody = await req.text();

  const result = await handleInboundEmail(
    { headers: req.headers, rawBody },
    {
      db: prisma,
      secret: env.RESEND_WEBHOOK_SECRET,
      fetchReceivedEmail,
      handleCustomerInbound: (payload) => emailProvider.handleInbound(payload),
      broadcast: safeTriggerBatch,
      sendUnverifiedReplyBounce,
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
