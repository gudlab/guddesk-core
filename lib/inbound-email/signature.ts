/**
 * Resend signs webhooks with Svix. The signed content is
 * `${svix-id}.${svix-timestamp}.${raw body}`, HMAC-SHA256 with the
 * base64 key after the "whsec_" prefix. svix-signature holds one or more
 * space-separated "v1,<base64>" entries (more than one while a secret is
 * being rotated). This must run on the raw body, before JSON parsing.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Svix's own tolerance. Also how long a seen svix-id is remembered. */
export const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

export type SignatureRejection =
  | "secret_unset"
  | "missing_headers"
  | "bad_timestamp"
  | "stale_timestamp"
  | "bad_signature";

export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export type SignatureResult = { ok: true; id: string } | { ok: false; reason: SignatureRejection };

function secretKey(secret: string): Buffer | null {
  const encoded = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  const key = Buffer.from(encoded, "base64");
  return key.length > 0 ? key : null;
}

/** The "v1,<base64>" value for this content. Exported for tests. */
export function signSvixPayload(secret: string, id: string, timestamp: string, rawBody: string): string {
  const key = secretKey(secret);
  if (!key) throw new Error("Invalid webhook secret");
  const digest = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  return `v1,${digest}`;
}

export function verifySvixSignature(
  secret: string | undefined,
  headers: SvixHeaders,
  rawBody: string,
  now: Date = new Date(),
): SignatureResult {
  const key = secret?.trim() ? secretKey(secret.trim()) : null;
  if (!key) return { ok: false, reason: "secret_unset" };

  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return { ok: false, reason: "missing_headers" };

  if (!/^\d{1,12}$/.test(timestamp)) return { ok: false, reason: "bad_timestamp" };
  const sentAt = Number(timestamp) * 1000;
  if (Math.abs(now.getTime() - sentAt) > SIGNATURE_TOLERANCE_MS) {
    return { ok: false, reason: "stale_timestamp" };
  }

  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();
  for (const entry of signature.split(" ")) {
    const [version, value] = entry.split(",", 2);
    if (version !== "v1" || !value) continue;
    const given = Buffer.from(value, "base64");
    if (given.length === expected.length && timingSafeEqual(given, expected)) {
      return { ok: true, id };
    }
  }
  return { ok: false, reason: "bad_signature" };
}
