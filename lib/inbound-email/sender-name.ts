/**
 * senderName for a customer reply on reply+ that comes from someone other
 * than the conversation's visitor (for example a colleague the customer
 * forwarded to): "Display Name (address)", or "address" without a name.
 * The visitor itself is not changed, so this is how agents see who wrote.
 *
 * The address is the one the parser extracted, never text from the display
 * name: a name like "Jane (jane@customer.test)" can't pose as another
 * address.
 */
import { splitAddress } from "./payload";

/** No senderName limit exists elsewhere (text column); this keeps it to a sane line. */
export const SENDER_NAME_MAX = 200;

/** Header text for display: control characters (CR/LF included) become spaces, runs collapse, trimmed. */
export function cleanHeaderText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim();
}

/** A display name with anything address-like removed, so it can't carry a fake "(address)". */
function cleanDisplayName(name: string): string {
  return cleanHeaderText(
    cleanHeaderText(name)
      .replace(/\([^)]*@[^)]*\)/g, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\S+@\S+/g, " ")
      .replace(/[()<>]/g, " "),
  );
}

function bare(address: string | null | undefined): string {
  return splitAddress(address ?? "").address.trim().toLowerCase();
}

/**
 * The senderName to store, or null when the sender is the visitor (keep
 * the usual senderName then). Compared on the bare address, ignoring case.
 */
export function forwardedSenderName(
  sender: { from: string; fromName?: string },
  visitorEmail: string | null | undefined,
): string | null {
  const address = cleanHeaderText(sender.from).slice(0, SENDER_NAME_MAX);
  if (bare(address) === bare(visitorEmail)) return null;
  const name = cleanDisplayName(sender.fromName ?? "");
  if (!name) return address;
  const room = SENDER_NAME_MAX - address.length - 3;
  if (room <= 0) return address;
  return `${name.slice(0, room).trim()} (${address})`;
}
