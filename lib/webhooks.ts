import { createHmac } from "crypto";

import { prisma } from "@/lib/db";

// ── Constants ───────────────────────────────────────────

/**
 * Retry delays in milliseconds.
 * After the first attempt fails: 10s, 30s, 2m, 10m, 1h
 */
const RETRY_DELAYS_MS = [10_000, 30_000, 120_000, 600_000, 3_600_000];

/** 1 initial attempt + 5 retries = 6 total */
const MAX_ATTEMPTS = 6;

/** Fetch timeout per delivery attempt */
const FETCH_TIMEOUT_MS = 10_000;

/** Max response body stored (4 KB) */
const MAX_RESPONSE_BODY = 4096;

/**
 * Map event names to WebhookEndpoint boolean fields.
 */
const EVENT_FIELD_MAP: Record<string, string> = {
  "message.created": "onMessageCreated",
  "conversation.created": "onConversationCreated",
  "conversation.closed": "onConversationClosed",
  "conversation.assigned": "onConversationAssigned",
  // SLA breach events also fire on conversation.created endpoints
  "sla.breached": "onConversationCreated",
  // Test ping — not filtered by subscription, matched manually
  ping: "__ping__",
};

// ── Helpers ─────────────────────────────────────────────

/**
 * Sign a payload with HMAC SHA-256 using the endpoint's secret.
 */
function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function isSuccess(httpStatus: number | null): boolean {
  return httpStatus !== null && httpStatus >= 200 && httpStatus < 300;
}

function getNextRetryAt(attemptCount: number): Date | null {
  const delayIndex = attemptCount - 1; // attemptCount is 1-based after first try
  if (delayIndex < 0 || delayIndex >= RETRY_DELAYS_MS.length) return null;
  return new Date(Date.now() + RETRY_DELAYS_MS[delayIndex]);
}

// ── Core: Execute a single HTTP delivery ────────────────

interface DeliveryResult {
  httpStatus: number | null;
  responseBody: string | null;
  errorMessage: string | null;
  durationMs: number;
}

async function executeDelivery(
  url: string,
  payload: string,
  secret: string,
  event: string,
  agentId?: string | null,
): Promise<DeliveryResult> {
  const start = Date.now();
  try {
    const signature = signPayload(payload, secret);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GudDesk-Signature": `sha256=${signature}`,
        "X-GudDesk-Event": event,
        ...(agentId ? { "X-GudDesk-Agent-Id": agentId } : {}),
      },
      body: payload,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    let responseBody: string | null = null;
    try {
      const text = await response.text();
      responseBody = text.slice(0, MAX_RESPONSE_BODY);
    } catch {
      // Ignore body read errors
    }

    return {
      httpStatus: response.status,
      responseBody,
      errorMessage: isSuccess(response.status) ? null : `HTTP ${response.status}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    // Extract the root cause from Node.js fetch errors (TypeError wraps the real error)
    let message = err instanceof Error ? err.message : String(err);
    if (err instanceof TypeError && err.cause) {
      const cause = err.cause as Error;
      message = `${message}: ${cause.message ?? cause}`;
      if ("code" in cause) message += ` (${(cause as NodeJS.ErrnoException).code})`;
    }
    return {
      httpStatus: null,
      responseBody: null,
      errorMessage: message,
      durationMs: Date.now() - start,
    };
  }
}

// ── Public: Dispatch webhooks ───────────────────────────

/**
 * Enqueue webhook deliveries for all subscribed endpoints, then attempt
 * immediate delivery inline.
 *
 * Two-phase design for Vercel serverless:
 *   Phase 1 (fast) — Create PENDING delivery rows with nextRetryAt = now.
 *                     This guarantees the cron will pick them up even if
 *                     the function is killed.
 *   Phase 2 (inline) — Attempt the HTTP delivery right away.
 *                       If it succeeds, mark SUCCESS. If not, the row
 *                       stays PENDING for the cron to retry.
 *
 * Must be awaited in the caller. Never throws.
 */
export async function dispatchWebhooks(
  workspaceId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const field = EVENT_FIELD_MAP[event];
  if (!field) return;

  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        workspaceId,
        isEnabled: true,
        [field]: true,
      },
      select: {
        id: true,
        url: true,
        secret: true,
        agent: { select: { id: true } },
      },
    });

    if (endpoints.length === 0) return;

    const payload = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    // Phase 1: Enqueue all delivery rows (fast — just DB inserts).
    // Set nextRetryAt = now so the cron picks them up immediately
    // if this function is killed before Phase 2 completes.
    const deliveries = await Promise.all(
      endpoints.map(async (endpoint) => {
        const delivery = await prisma.webhookDelivery.create({
          data: {
            endpointId: endpoint.id,
            event,
            payload,
            status: "PENDING",
            attemptCount: 0,
            maxAttempts: MAX_ATTEMPTS,
            nextRetryAt: new Date(), // eligible for cron pickup immediately
          },
        });
        return { delivery, endpoint };
      }),
    );

    // Phase 2: Attempt delivery inline (best-effort).
    // If the function is killed here, the cron will pick up the
    // PENDING rows we created above.
    await Promise.allSettled(
      deliveries.map(async ({ delivery, endpoint }) => {
        const result = await executeDelivery(
          endpoint.url,
          payload,
          endpoint.secret,
          event,
          endpoint.agent?.id,
        );

        const success = isSuccess(result.httpStatus);
        const attemptCount = 1;
        const nextRetryAt = success ? null : getNextRetryAt(attemptCount);

        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            attemptCount,
            httpStatus: result.httpStatus,
            responseBody: result.responseBody,
            errorMessage: result.errorMessage,
            durationMs: result.durationMs,
            status: success ? "SUCCESS" : "PENDING",
            nextRetryAt,
            completedAt: success ? new Date() : null,
          },
        });
      }),
    );
  } catch (err) {
    console.error("Webhook dispatch failed:", err);
  }
}

// ── Public: Retry a single delivery ─────────────────────

/**
 * Retry a pending/failed delivery. Called by the retry cron
 * and the manual retry action.
 */
export async function retryDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: {
      endpoint: {
        select: { url: true, secret: true, agent: { select: { id: true } } },
      },
    },
  });

  if (!delivery) return;
  if (delivery.status === "SUCCESS") return;

  const result = await executeDelivery(
    delivery.endpoint.url,
    delivery.payload,
    delivery.endpoint.secret,
    delivery.event,
    delivery.endpoint.agent?.id,
  );

  const attemptCount = delivery.attemptCount + 1;
  const success = isSuccess(result.httpStatus);
  const exhausted = attemptCount >= delivery.maxAttempts;
  const nextRetryAt = success || exhausted ? null : getNextRetryAt(attemptCount);

  await prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      attemptCount,
      httpStatus: result.httpStatus,
      responseBody: result.responseBody,
      errorMessage: result.errorMessage,
      durationMs: result.durationMs,
      status: success ? "SUCCESS" : exhausted ? "FAILED" : "PENDING",
      nextRetryAt,
      completedAt: success || exhausted ? new Date() : null,
    },
  });
}

// ── Public: Send a test ping ────────────────────────────

/**
 * Send a test ping event to a specific endpoint.
 * Creates a delivery record with maxAttempts=1 (no retry).
 */
export async function sendTestPing(endpointId: string): Promise<{
  success: boolean;
  httpStatus: number | null;
  errorMessage: string | null;
}> {
  const endpoint = await prisma.webhookEndpoint.findUnique({
    where: { id: endpointId },
    select: { url: true, secret: true, agent: { select: { id: true } } },
  });

  if (!endpoint) {
    return { success: false, httpStatus: null, errorMessage: "Endpoint not found" };
  }

  const payload = JSON.stringify({
    event: "ping",
    data: { message: "Test ping from GudDesk" },
    timestamp: new Date().toISOString(),
  });

  const delivery = await prisma.webhookDelivery.create({
    data: {
      endpointId,
      event: "ping",
      payload,
      status: "PENDING",
      attemptCount: 0,
      maxAttempts: 1,
    },
  });

  const result = await executeDelivery(
    endpoint.url,
    payload,
    endpoint.secret,
    "ping",
    endpoint.agent?.id,
  );

  const success = isSuccess(result.httpStatus);

  await prisma.webhookDelivery.update({
    where: { id: delivery.id },
    data: {
      attemptCount: 1,
      httpStatus: result.httpStatus,
      responseBody: result.responseBody,
      errorMessage: result.errorMessage,
      durationMs: result.durationMs,
      status: success ? "SUCCESS" : "FAILED",
      completedAt: new Date(),
    },
  });

  return {
    success,
    httpStatus: result.httpStatus,
    errorMessage: result.errorMessage,
  };
}
