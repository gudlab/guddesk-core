/**
 * Polling fallback for the agent inbox when Pusher isn't configured.
 *
 * getPusherClient() returns null when NEXT_PUBLIC_PUSHER_KEY or
 * NEXT_PUBLIC_PUSHER_CLUSTER is missing, and every usePusher() binding then
 * does nothing. Without this fallback the inbox only changed on a reload.
 *
 * This file has no React in it so the timer logic can be tested with
 * node:test fake timers. hooks/use-polling-fallback.ts wraps it.
 */

/** Conversation list refresh interval when Pusher is off. */
export const CONVERSATION_LIST_POLL_MS = 10_000;
/** Open thread refresh interval when Pusher is off. Matches the widget. */
export const THREAD_POLL_MS = 4_000;
/**
 * Incremental thread polls ask for messages created at or after the newest
 * message we hold, minus this window. The overlap catches a message whose
 * createdAt is slightly older than one we already have but which committed
 * later. mergeMessagesById drops the repeats.
 */
export const THREAD_POLL_OVERLAP_MS = 10_000;

export interface VisibilitySource {
  isVisible(): boolean;
  /** Calls listener on every visibility change. Returns an unsubscribe. */
  subscribe(listener: () => void): () => void;
}

export interface PollingFallbackOptions {
  intervalMs: number;
  poll: () => unknown;
  /** True when a realtime client exists. Polling never starts then. */
  hasRealtime: () => boolean;
  visibility: VisibilitySource;
}

export interface PollingHandle {
  stop(): void;
  /** True while the interval timer is armed. */
  readonly active: boolean;
}

/**
 * Starts polling unless realtime is available, in which case it returns null
 * and does nothing. While running:
 * - polls every intervalMs, but only while the page is visible
 * - clears the timer when the page is hidden, and polls once straight away
 *   when it becomes visible again
 * - never starts a poll while the previous one is still in flight
 */
export function startPollingFallback(
  options: PollingFallbackOptions,
): PollingHandle | null {
  if (options.hasRealtime()) return null;

  const { intervalMs, poll, visibility } = options;
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight = false;
  let stopped = false;

  const tick = () => {
    if (stopped || inFlight || !visibility.isVisible()) return;
    inFlight = true;
    let result: unknown;
    try {
      result = poll();
    } catch {
      inFlight = false;
      return;
    }
    Promise.resolve(result)
      .catch(() => {})
      .finally(() => {
        inFlight = false;
      });
  };

  const arm = () => {
    if (timer === null) timer = setInterval(tick, intervalMs);
  };
  const disarm = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const unsubscribe = visibility.subscribe(() => {
    if (stopped) return;
    if (visibility.isVisible()) {
      tick();
      arm();
    } else {
      disarm();
    }
  });

  if (visibility.isVisible()) arm();

  return {
    stop() {
      stopped = true;
      disarm();
      unsubscribe();
    },
    get active() {
      return timer !== null;
    },
  };
}

/** Browser visibility via document.visibilityState. */
export const documentVisibility: VisibilitySource = {
  isVisible: () =>
    typeof document === "undefined" || document.visibilityState === "visible",
  subscribe: (listener) => {
    if (typeof document === "undefined") return () => {};
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  },
};

export interface IdentifiedMessage {
  id: string;
  createdAt: string | Date;
}

function toTime(value: string | Date): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

/**
 * Adds incoming messages that aren't already in prev, keeping createdAt
 * order. Returns prev itself when nothing is new, so React skips the render
 * and the thread doesn't flicker. Used for poll results, Pusher events and
 * the agent's own reply, so one message delivered by two of those paths
 * only shows once.
 */
export function mergeMessagesById<T extends IdentifiedMessage>(
  prev: T[],
  incoming: T[],
): T[] {
  if (incoming.length === 0) return prev;
  const seen = new Set(prev.map((m) => m.id));
  const fresh: T[] = [];
  for (const message of incoming) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    fresh.push(message);
  }
  if (fresh.length === 0) return prev;
  // Array.prototype.sort is stable, so equal timestamps keep arrival order.
  return [...prev, ...fresh].sort(
    (a, b) => toTime(a.createdAt) - toTime(b.createdAt),
  );
}

/**
 * The `after` value for an incremental thread poll, or null when there are
 * no messages yet (the caller should do a full fetch instead).
 */
export function messagesAfterParam(
  messages: IdentifiedMessage[],
  overlapMs: number = THREAD_POLL_OVERLAP_MS,
): string | null {
  let latest = -Infinity;
  for (const message of messages) {
    const time = toTime(message.createdAt);
    if (time > latest) latest = time;
  }
  if (!Number.isFinite(latest)) return null;
  return new Date(latest - overlapMs).toISOString();
}

/**
 * Applies a fresh first page of the conversation list. Items the agent
 * already loaded past the first page stay, so polling doesn't undo
 * "load more". Returns prev itself when nothing changed.
 */
export function mergeConversationPage<T extends { id: string }>(
  prev: T[],
  firstPage: T[],
  pageSize: number,
): T[] {
  const pageIds = new Set(firstPage.map((c) => c.id));
  const tail = prev.slice(pageSize).filter((c) => !pageIds.has(c.id));
  const next = [...firstPage, ...tail];
  if (next.length === prev.length) {
    let same = true;
    for (let i = 0; i < next.length; i++) {
      if (JSON.stringify(next[i]) !== JSON.stringify(prev[i])) {
        same = false;
        break;
      }
    }
    if (same) return prev;
  }
  return next;
}
