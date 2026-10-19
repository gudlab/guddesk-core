/**
 * Remembers the last identity the snippet sent for each appId, so the
 * widget does not call identify() on every page load. The server marks
 * each identify as a customer.identified timeline event and reruns company
 * matching, so repeat calls with the same data add noise.
 */

export interface IdentifyCacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface IdentifyCacheInput {
  visitorId?: string | null;
  userId?: string;
  name?: string;
  email?: string;
}

const STORAGE_PREFIX = "guddesk_identified:";

export function identifyCacheStorageKey(appId: string): string {
  return `${STORAGE_PREFIX}${appId}`;
}

/**
 * Cache value for a visitor and identity. Includes the visitorId so a new
 * anonymous visitor (cleared state, new device) is identified again.
 */
export function identifyCacheValue(input: IdentifyCacheInput): string {
  return JSON.stringify([
    input.visitorId ?? "",
    input.userId ?? "",
    input.name ?? "",
    input.email ?? "",
  ]);
}

/** True when the identity differs from the last one sent for this appId. */
export function shouldSendIdentify(
  storage: IdentifyCacheStorage | null | undefined,
  appId: string,
  input: IdentifyCacheInput,
): boolean {
  if (!storage) return true;
  try {
    return (
      storage.getItem(identifyCacheStorageKey(appId)) !==
      identifyCacheValue(input)
    );
  } catch {
    return true;
  }
}

export function rememberIdentify(
  storage: IdentifyCacheStorage | null | undefined,
  appId: string,
  input: IdentifyCacheInput,
): void {
  if (!storage) return;
  try {
    storage.setItem(identifyCacheStorageKey(appId), identifyCacheValue(input));
  } catch {
    // Storage full or blocked. The next load will identify again.
  }
}

/** localStorage when the page allows it, otherwise null. */
export function browserIdentifyStorage(): IdentifyCacheStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
