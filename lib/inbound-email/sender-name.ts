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

/**
 * Cap for the display-name part, " (" and ")" included. The address is
 * never cut, so a senderName is at most SENDER_NAME_MAX plus the address
 * (which the handler limits to 254 characters).
 */
export const SENDER_NAME_MAX = 200;

/**
 * Bidi controls (LRM, RLM, LRE..RLO, LRI..PDI) and zero-width characters
 * (ZWSP, ZWNJ, ZWJ, word joiner, BOM): they can reorder or hide what an
 * agent reads, for example make an address look like another one.
 */
const INVISIBLE = /[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g;

/**
 * Header text for display: bidi and zero-width characters removed, control
 * characters (CR/LF included) become spaces, runs collapse, trimmed.
 */
export function cleanHeaderText(value: string): string {
  return value
    .replace(INVISIBLE, "")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const address = cleanHeaderText(sender.from);
  if (bare(address) === bare(visitorEmail)) return null;
  const name = cleanDisplayName(sender.fromName ?? "")
    .slice(0, SENDER_NAME_MAX - 3)
    .trim();
  if (!name) return address;
  return `${name} (${address})`;
}

/**
 * senderName as the visitor sees it (widget API): a customer-path message
 * stored as "Name (address)" shows just "Name", so the forwarded sender's
 * address isn't shown back. Anything else is unchanged.
 */
export function visitorFacingSenderName(senderName: string | null): string | null {
  if (!senderName) return senderName;
  const match = /^(.+?) \([^\s()@]+@[^\s()]+\)$/.exec(senderName);
  return match ? match[1] : senderName;
}
