/**
 * The composer's idempotency keys, kept in localStorage until a reply is
 * finished, so a retry after a dropped connection, a reload, a failed
 * email or a send from a second tab uses the same key and the server
 * doesn't post the reply twice (lib/reply-idempotency.ts).
 *
 * A key belongs to one reply: the conversation, the reply type and a hash
 * of the text. Sending the same text again reuses its key; different text
 * is a new reply with a new key. The text itself is not stored. The server
 * binds each key to the signed-in user, so two agents never share a reply.
 *
 * localStorage is shared by every tab of the app, so two tabs sending the
 * same text use one key. A brand-new key is written, then re-read after a
 * short settle (under a Web Lock where the browser has them), so two tabs
 * that both mint a key at the same moment end up on the same one.
 *
 * How long a key is kept:
 * - until the reply is finished (email sent or skipped): forgotten at once;
 * - after a temporary email failure: up to 24 hours (the server's TTL).
 *   Sending the same text again in that conversation is the retry: it sends
 *   the email for the existing message and posts nothing new. Edit the text
 *   to send it as a new reply;
 * - after a permanent email failure (Resend refused the sender or the
 *   recipient): 15 minutes, so a repeat shows the stored notice instead of
 *   posting a second message. After that the same text is a new reply.
 */
import { newReplyKey } from "./reply-idempotency";

export interface KeyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ReplyIdentity {
  conversationId: string;
  type: string;
  body: string;
}

const PREFIX = "guddesk:reply-key:";
/** The server forgets a key after 24 hours, so the client does too. */
export const REPLY_KEY_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** How long a reply whose email was refused for good keeps its key. */
export const REPLY_KEY_FINAL_HOLD_MS = 15 * 60 * 1000;
/** How long a new key settles before it is re-read (two tabs at once). */
export const REPLY_KEY_SETTLE_MS = 150;

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

function slotOf(reply: ReplyIdentity): string {
  return replyKeySlot(reply.conversationId, reply.type, reply.body);
}

const memory = new Map<string, string>();
const memoryStorage: KeyStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

/**
 * localStorage (shared by every tab), or an in-memory stand-in where it is
 * blocked or missing.
 */
export function browserKeyStorage(): KeyStorage {
  try {
    const storage = (globalThis as { localStorage?: KeyStorage }).localStorage;
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

interface StoredKey {
  key: string;
  at: number;
  /** Set once the email was refused for good; the key is then kept for a shorter time. */
  final?: boolean;
}

function readSlot(storage: KeyStorage, slot: string, now: number): StoredKey | null {
  try {
    const saved = storage.getItem(slot);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { key?: unknown; at?: unknown; final?: unknown };
    if (typeof parsed.key !== "string" || typeof parsed.at !== "number") return null;
    const maxAge = parsed.final === true ? REPLY_KEY_FINAL_HOLD_MS : REPLY_KEY_MAX_AGE_MS;
    if (now - parsed.at >= maxAge) return null;
    return { key: parsed.key, at: parsed.at, final: parsed.final === true };
  } catch {
    // Unreadable entry: treat as missing.
    return null;
  }
}

function writeSlot(storage: KeyStorage, slot: string, value: StoredKey) {
  try {
    storage.setItem(slot, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the key still works for this attempt.
  }
}

/** The stored key for this reply, or null when there is none (or it ran out). */
export function storedReplyKey(storage: KeyStorage, reply: ReplyIdentity, now: number = Date.now()): string | null {
  return readSlot(storage, slotOf(reply), now)?.key ?? null;
}

/** The key for this reply: the stored one if it was sent before, else a new stored one. */
export function replyKeyFor(storage: KeyStorage, reply: ReplyIdentity, now: number = Date.now()): string {
  const slot = slotOf(reply);
  const saved = readSlot(storage, slot, now);
  if (saved) return saved.key;
  const key = newReplyKey();
  writeSlot(storage, slot, { key, at: now });
  return key;
}

interface LockManagerLike {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

function browserLocks(): LockManagerLike | null {
  const locks = (globalThis as { navigator?: { locks?: LockManagerLike } }).navigator?.locks;
  return locks && typeof locks.request === "function" ? locks : null;
}

/**
 * The key for this reply, shared with every other tab. A stored key is
 * returned at once. Otherwise a new key is written, and after a short
 * settle the slot is read again: if another tab wrote its key meanwhile,
 * both use the one that is stored. Runs under a Web Lock per reply where
 * the browser has them.
 */
export async function acquireReplyKey(
  storage: KeyStorage,
  reply: ReplyIdentity,
  options: {
    now?: () => number;
    settleMs?: number;
    sleep?: (ms: number) => Promise<void>;
    locks?: LockManagerLike | null;
  } = {},
): Promise<string> {
  const now = options.now ?? Date.now;
  const settleMs = options.settleMs ?? REPLY_KEY_SETTLE_MS;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const locks = options.locks === undefined ? browserLocks() : options.locks;
  const slot = slotOf(reply);

  const acquire = async () => {
    const saved = readSlot(storage, slot, now());
    if (saved) return saved.key;
    const key = newReplyKey();
    writeSlot(storage, slot, { key, at: now() });
    if (settleMs > 0) await sleep(settleMs);
    return readSlot(storage, slot, now())?.key ?? key;
  };

  if (!locks) return acquire();
  try {
    return await locks.request(slot, acquire);
  } catch {
    return acquire();
  }
}

/**
 * True while this exact key is still the reply's pending key. A Retry
 * button checks this before it sends: once the reply was finished (by any
 * path, in any tab) the key is gone and the retry must do nothing.
 */
export function isPendingReplyKey(
  storage: KeyStorage,
  reply: ReplyIdentity,
  key: string,
  now: number = Date.now(),
): boolean {
  const saved = readSlot(storage, slotOf(reply), now);
  return saved !== null && saved.key === key && !saved.final;
}

/**
 * The email was refused for good: keep the key for a short while, so the
 * same text sent again returns the stored outcome instead of a 2nd message.
 */
export function holdFinalReplyKey(
  storage: KeyStorage,
  reply: ReplyIdentity,
  key: string,
  now: number = Date.now(),
) {
  const slot = slotOf(reply);
  const saved = readSlot(storage, slot, now);
  if (saved && saved.key !== key) return;
  if (saved?.final) return;
  writeSlot(storage, slot, { key, at: now, final: true });
}

/**
 * The reply is finished (or can't be finished): its next send is a new
 * reply. With `key`, only that key is forgotten, never a newer one.
 */
export function forgetReplyKey(storage: KeyStorage, reply: ReplyIdentity, key?: string) {
  const slot = slotOf(reply);
  try {
    if (key !== undefined) {
      const saved = storage.getItem(slot);
      if (saved) {
        const parsed = JSON.parse(saved) as { key?: unknown };
        if (parsed.key !== key) return;
      }
    }
    storage.removeItem(slot);
  } catch {
    // Nothing to do.
  }
}
