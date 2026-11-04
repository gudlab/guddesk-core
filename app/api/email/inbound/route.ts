import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { EmailChannelProvider } from "@/lib/channels/email/provider";
import { prisma } from "@/lib/db";
import { sendUnverifiedReplyBounce } from "@/lib/email-notifications";
import { handleInboundEmail } from "@/lib/inbound-email/handler";
import { fetchReceivedEmail } from "@/lib/outbound-email";
import { safeTriggerBatch } from "@/lib/pusher-server";

const emailProvider = new EmailChannelProvider();

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
