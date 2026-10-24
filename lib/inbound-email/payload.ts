/**
 * Inbound payload shapes.
 *
 * Current Resend: { type: "email.received", created_at, data: { email_id,
 * from, to[], cc[], received_for[], subject, message_id, ... } }. The
 * webhook carries no body or headers, so the email is fetched with
 * resend.emails.receiving.get(email_id), which returns text, html,
 * headers and SPF/DKIM/DMARC results.
 *
 * Legacy: { from, to, subject, text, headers } at the top level. Only
 * accepted after the signature check passed.
 */

export interface ReceivedEmailEvent {
  kind: "received";
  emailId: string;
  recipients: string[];
  /** From the webhook's own from, so a bad sender is ignored before the fetch. */
  senderProblem?: SenderProblem;
}

export interface LegacyInboundEmail {
  kind: "legacy";
  email: InboundEmail;
}

export interface InboundEmail {
  from: string;
  fromName?: string;
  recipients: string[];
  subject?: string;
  text: string;
  headers: Record<string, string>;
  /** DMARC and DKIM results Resend reports for the received email, when it reports them. */
  dmarc?: string;
  dkim?: string;
  /** Set when the From can't name one sender; the handler ignores the email. */
  senderProblem?: SenderProblem;
}

export type ParsedInbound =
  | ReceivedEmailEvent
  | LegacyInboundEmail
  | { kind: "ignored_event"; type: string }
  | { kind: "invalid" };

const asStrings = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

/** "Name <a@b.com>" or "a@b.com" into address and display name. */
export function splitAddress(raw: string): { address: string; name?: string } {
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(raw);
  if (!match) return { address: raw.trim() };
  const name = match[1].trim();
  return { address: match[2].trim(), ...(name ? { name } : {}) };
}

/** RFC 5321 limit; a longer address is invalid. */
export const MAX_ADDRESS_LENGTH = 254;

/**
 * ambiguous_sender: the From names two or more addresses, so there is no
 * one sender to file it under. invalid_sender: the address is longer than
 * an address can be.
 */
export type SenderProblem = "ambiguous_sender" | "invalid_sender";

/**
 * The distinct addresses in a From value, lowercased. Quoted display names
 * and (comments) are not addresses, so "Jane (jane@x)" <m@y> is one.
 */
export function fromAddresses(raw: string): string[] {
  const text = raw.replace(/"(?:[^"\\]|\\.)*"/g, " ").replace(/\([^()]*\)/g, " ");
  const bracketed = [...text.matchAll(/<([^<>]*)>/g)].map((m) => m[1]);
  const outside = text.replace(/<[^<>]*>/g, " ").split(/[\s,;]+/);
  const seen = new Set<string>();
  for (const token of [...bracketed, ...outside]) {
    const address = token.trim().toLowerCase();
    if (address.includes("@")) seen.add(address);
  }
  return [...seen];
}

export function senderProblem(...froms: unknown[]): SenderProblem | undefined {
  for (const raw of froms) {
    if (typeof raw !== "string") continue;
    const addresses = fromAddresses(raw);
    if (addresses.length >= 2) return "ambiguous_sender";
    if (addresses.some((a) => a.length > MAX_ADDRESS_LENGTH)) return "invalid_sender";
  }
  return undefined;
}

function lowerHeaders(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string") out[k.toLowerCase()] = v;
    }
  }
  return out;
}

export function parseInboundPayload(json: unknown): ParsedInbound {
  if (!json || typeof json !== "object") return { kind: "invalid" };
  const body = json as Record<string, unknown>;

  if (typeof body.type === "string") {
    if (body.type !== "email.received") return { kind: "ignored_event", type: body.type };
    const data = (body.data ?? {}) as Record<string, unknown>;
    if (typeof data.email_id !== "string" || !data.email_id) return { kind: "invalid" };
    const problem = senderProblem(data.from);
    return {
      kind: "received",
      emailId: data.email_id,
      recipients: [...asStrings(data.to), ...asStrings(data.received_for)],
      ...(problem ? { senderProblem: problem } : {}),
    };
  }

  const from = typeof body.from === "string" ? splitAddress(body.from) : null;
  const recipients = asStrings(body.to);
  if (!from?.address || recipients.length === 0 || typeof body.text !== "string" || !body.text) {
    return { kind: "invalid" };
  }
  const problem = senderProblem(body.from);
  return {
    kind: "legacy",
    email: {
      from: from.address,
      fromName: from.name,
      recipients,
      subject: typeof body.subject === "string" ? body.subject : undefined,
      text: body.text,
      headers: lowerHeaders(body.headers),
      ...(problem ? { senderProblem: problem } : {}),
    },
  };
}

function decodeHtml(html: string): string {
  // Resend may return html as a data URI (html_format: "data_uri").
  const dataUri = /^data:[^,]*?(;base64)?,(.*)$/s.exec(html);
  if (!dataUri) return html;
  return dataUri[1] ? Buffer.from(dataUri[2], "base64").toString("utf8") : decodeURIComponent(dataUri[2]);
}

/** Plain text from HTML, good enough for a message body. */
export function htmlToText(html: string): string {
  return decodeHtml(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The fetched received email (resend.emails.receiving.get) as an InboundEmail. */
export function fromReceivedEmail(
  received: Record<string, unknown>,
  eventRecipients: string[],
): InboundEmail | null {
  const headers = lowerHeaders(received.headers);
  const fromRaw = headers.from ?? (typeof received.from === "string" ? received.from : "");
  const from = splitAddress(fromRaw);
  // received.from can carry a display name too ("Name <a@b>"): match
  // members on the bare address only.
  const bare = typeof received.from === "string" ? splitAddress(received.from).address : "";
  const text =
    typeof received.text === "string" && received.text.trim()
      ? received.text
      : typeof received.html === "string"
        ? htmlToText(received.html)
        : "";
  const address = bare || from.address;
  if (!address || !text.trim()) return null;
  const problem = senderProblem(fromRaw, received.from);
  const auth =
    received.authentication && typeof received.authentication === "object"
      ? (received.authentication as Record<string, unknown>)
      : {};
  return {
    from: address,
    fromName: from.name,
    recipients: [...asStrings(received.to), ...asStrings(received.received_for), ...eventRecipients],
    subject: typeof received.subject === "string" ? received.subject : undefined,
    text,
    headers,
    ...(typeof auth.dmarc === "string" ? { dmarc: auth.dmarc.toLowerCase() } : {}),
    ...(typeof auth.dkim === "string" ? { dkim: auth.dkim.toLowerCase() } : {}),
    ...(problem ? { senderProblem: problem } : {}),
  };
}
