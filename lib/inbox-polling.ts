/**
 * Polling fallback for the agent inbox when Pusher isn't configured or
 * can't connect.
 *
 * getPusherClient() returns null when NEXT_PUBLIC_PUSHER_KEY or
 * NEXT_PUBLIC_PUSHER_CLUSTER is missing, and every usePusher() binding then
 * does nothing. A configured client can also fail to connect (bad key,
 * blocked network). Without this fallback the inbox only changed on a reload.
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

/** How long to wait for Pusher to connect before polling anyway. Matches the widget. */
export const REALTIME_CONNECT_TIMEOUT_MS = 8_000;

/**
 * The bits of a pusher-js connection the fallback needs. Pusher's
 * `client.connection` fits this shape.
 */
export interface RealtimeConnection {
  readonly state: string;
  bind(event: "state_change", callback: (states: { previous: string; current: string }) => void): unknown;
  unbind(event: "state_change", callback: (states: { previous: string; current: string }) => void): unknown;
}

export interface PollingFallbackOptions {
  intervalMs: number;
  poll: () => unknown;
  /**
   * The Pusher connection, or null when Pusher isn't configured. With a
   * connection, polling only runs while it isn't connected: after
   * connectTimeoutMs without a connection, or once it reports "failed" or
   * "unavailable". It stops again as soon as the connection is up.
   */
  realtime: RealtimeConnection | null;
  visibility: VisibilitySource;
  connectTimeoutMs?: number;
}

export interface PollingHandle {
  stop(): void;
  /** True while the interval timer is armed. */
  readonly active: boolean;
  /** True while polling is wanted (no realtime, or realtime is down). */
  readonly polling: boolean;
}

const REALTIME_DOWN_STATES = new Set(["failed", "unavailable"]);

/**
 * Polls as a stand-in for realtime. While polling is wanted:
 * - polls every intervalMs, but only while the page is visible
 * - clears the timer when the page is hidden, and polls once straight away
 *   when it becomes visible again
 * - never starts a poll while the previous one is still in flight
 * With a realtime connection that is (or becomes) connected, nothing runs.
 */
export function startPollingFallback(options: PollingFallbackOptions): PollingHandle {
  const { intervalMs, poll, visibility, realtime } = options;
  const connectTimeoutMs = options.connectTimeoutMs ?? REALTIME_CONNECT_TIMEOUT_MS;
  let timer: ReturnType<typeof setInterval> | null = null;
  let connectTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let stopped = false;
  let wanted = false;

  const tick = () => {
    if (stopped || !wanted || inFlight || !visibility.isVisible()) return;
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
  const clearConnectTimer = () => {
    if (connectTimer !== null) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
  };

  // immediate: poll at once, used when realtime drops so the agent doesn't
  // wait a full interval for data it may have missed.
  const setWanted = (next: boolean, immediate: boolean) => {
    if (stopped || wanted === next) return;
    wanted = next;
    if (!next) {
      disarm();
      return;
    }
    if (!visibility.isVisible()) return;
    if (immediate) tick();
    arm();
  };

  const unsubscribe = visibility.subscribe(() => {
    if (stopped || !wanted) return;
    if (visibility.isVisible()) {
      tick();
      arm();
    } else {
      disarm();
    }
  });

  const onStateChange = ({ current }: { previous: string; current: string }) => {
    if (current === "connected") {
      clearConnectTimer();
      setWanted(false, false);
    } else if (REALTIME_DOWN_STATES.has(current)) {
      clearConnectTimer();
      setWanted(true, true);
    }
  };

  if (!realtime) {
    setWanted(true, false);
  } else {
    realtime.bind("state_change", onStateChange);
    if (REALTIME_DOWN_STATES.has(realtime.state)) {
      setWanted(true, true);
    } else if (realtime.state !== "connected") {
      connectTimer = setTimeout(() => {
        connectTimer = null;
        if (realtime.state !== "connected") setWanted(true, true);
      }, connectTimeoutMs);
    }
  }

  return {
    stop() {
      stopped = true;
      clearConnectTimer();
      disarm();
      unsubscribe();
      realtime?.unbind("state_change", onStateChange);
    },
    get active() {
      return timer !== null;
    },
    get polling() {
      return wanted && !stopped;
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
 *
 * When rows arrive at the top (new conversations, or older ones with a new
 * message), the same number of rows fall off the bottom of the server's
 * first page onto page 2. If the agent has loaded more, those rows are kept
 * right after the first page instead of disappearing.
 */
export function mergeConversationPage<T extends { id: string }>(
  prev: T[],
  firstPage: T[],
  pageSize: number,
): T[] {
  const pageIds = new Set(firstPage.map((c) => c.id));
  const oldHead = prev.slice(0, pageSize);
  const oldTail = prev.slice(pageSize);
  let displaced: T[] = [];
  if (oldTail.length > 0 && firstPage.length >= pageSize) {
    const oldHeadIds = new Set(oldHead.map((c) => c.id));
    const arrivals = firstPage.filter((c) => !oldHeadIds.has(c.id)).length;
    if (arrivals > 0) {
      displaced = oldHead
        .slice(Math.max(0, oldHead.length - arrivals))
        .filter((c) => !pageIds.has(c.id));
    }
  }
  const tail = [...displaced, ...oldTail.filter((c) => !pageIds.has(c.id))];
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

/** Appends a "load more" page, skipping rows already in the list. */
export function appendConversationPage<T extends { id: string }>(
  prev: T[],
  page: T[],
): T[] {
  const seen = new Set(prev.map((c) => c.id));
  const fresh = page.filter((c) => !seen.has(c.id));
  return fresh.length === 0 ? prev : [...prev, ...fresh];
}

/**
 * Request generations. Each time the open conversation changes, next()
 * returns a new number. A response is applied only if isCurrent() is still
 * true for the number taken when its request started, so a slow poll from
 * an earlier visit to the same conversation (A, then B, then A again)
 * can't overwrite fresher data.
 */
export function createRequestGeneration() {
  let current = 0;
  return {
    next(): number {
      current += 1;
      return current;
    },
    current(): number {
      return current;
    },
    isCurrent(generation: number): boolean {
      return generation === current;
    },
  };
}

/** Most messages one `?after=` request returns. */
export const MESSAGES_AFTER_TAKE = 200;

// Postgres timestamps go far past these, but a real `after` from the
// poller is always a recent time. Anything outside is clamped.
const AFTER_MIN_MS = Date.UTC(1970, 0, 1);
const AFTER_MAX_MS = Date.UTC(9999, 11, 31, 23, 59, 59, 999);

/**
 * Parses the messages route `?after=` value. Returns null when it's missing
 * or not a date (the route then returns the full thread, as before). A
 * valid JavaScript date outside 1970-01-01 to 9999-12-31 is clamped to that
 * range, so the query never sends Postgres a timestamp it rejects.
 */
export function parseMessagesAfter(value: string | null): Date | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return new Date(Math.min(Math.max(time, AFTER_MIN_MS), AFTER_MAX_MS));
}

/**
 * The findMany arguments (minus `include`) for the messages route. Full
 * thread without a usable `after`; otherwise messages since then, capped.
 */
export function messagesQueryArgs(conversationId: string, afterParam: string | null) {
  const after = parseMessagesAfter(afterParam);
  return {
    where: after ? { conversationId, createdAt: { gte: after } } : { conversationId },
    orderBy: { createdAt: "asc" as const },
    ...(after ? { take: MESSAGES_AFTER_TAKE } : {}),
  };
}
