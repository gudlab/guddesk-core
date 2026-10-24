/**
 * The composer's idempotency keys, kept in sessionStorage until a reply is
 * finished, so a retry after a dropped connection, a reload or a failed
 * email sends the same key and the server doesn't post the reply twice
 * (lib/reply-idempotency.ts).
 *
 * A key belongs to one reply: the conversation, the reply type and a hash
 * of the text. Sending the same text again reuses its key; different text
 * is a new reply with a new key. The text itself is not stored.
 */
import { newReplyKey } from "./reply-idempotency";

export interface KeyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const PREFIX = "guddesk:reply-key:";
/** The server forgets a key after 24 hours, so the client does too. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** FNV-1a, 32 bit. Only tells replies apart; not a security hash. */
function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function replyKeySlot(conversationId: string, type: string, body: string): string {
  return `${PREFIX}${conversationId}:${type}:${hashText(body)}:${body.length}`;
}

const memory = new Map<string, string>();
const memoryStorage: KeyStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

/** sessionStorage, or an in-memory stand-in where it is blocked or missing. */
export function browserKeyStorage(): KeyStorage {
  try {
    const storage = (globalThis as { sessionStorage?: KeyStorage }).sessionStorage;
    if (storage) {
      const probe = `${PREFIX}probe`;
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return storage;
    }
  } catch {
    // Private mode or storage disabled.
  }
  return memoryStorage;
}

/** The key for this reply: the stored one if it was sent before, else a new stored one. */
export function replyKeyFor(
  storage: KeyStorage,
  reply: { conversationId: string; type: string; body: string },
  now: number = Date.now(),
): string {
  const slot = replyKeySlot(reply.conversationId, reply.type, reply.body);
  try {
    const saved = storage.getItem(slot);
    if (saved) {
      const parsed = JSON.parse(saved) as { key?: unknown; at?: unknown };
      if (typeof parsed.key === "string" && typeof parsed.at === "number" && now - parsed.at < MAX_AGE_MS) {
        return parsed.key;
      }
    }
  } catch {
    // Unreadable entry: replace it.
  }
  const key = newReplyKey();
  try {
    storage.setItem(slot, JSON.stringify({ key, at: now }));
  } catch {
    // Storage full or blocked: the key still works for this attempt.
  }
  return key;
}

/** The reply is finished (or can't be finished): its next send is a new reply. */
export function forgetReplyKey(storage: KeyStorage, reply: { conversationId: string; type: string; body: string }) {
  try {
    storage.removeItem(replyKeySlot(reply.conversationId, reply.type, reply.body));
  } catch {
    // Nothing to do.
  }
}
