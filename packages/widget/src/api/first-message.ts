/**
 * The widget creates its visitor and conversation with the first message
 * (POST /api/widget/conversations). Two sends before that request returns
 * must not create two visitors and two conversations, so the first send is
 * single-flight: later sends wait for it, then post to the conversation it
 * created.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */

/** Thrown by the widget's request helper for a non-2xx response. */
export class WidgetRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "WidgetRequestError";
  }
}

/** The server's answer when a cached token's visitor no longer exists. */
export const VISITOR_NOT_FOUND = "VISITOR_NOT_FOUND";

export function isStaleVisitorError(error: unknown): boolean {
  return (
    error instanceof WidgetRequestError &&
    error.status === 401 &&
    error.code === VISITOR_NOT_FOUND
  );
}

/**
 * Run `start`. If the server says the cached visitor is gone, drop the
 * token and try once more without it.
 */
export async function withStaleTokenRetry<T>(
  start: () => Promise<T>,
  token: { has: () => boolean; drop: () => void },
): Promise<T> {
  try {
    return await start();
  } catch (error) {
    if (!isStaleVisitorError(error) || !token.has()) throw error;
    token.drop();
    return start();
  }
}

export interface FirstMessageQueueDeps {
  hasConversation: () => boolean;
  /** Creates the conversation with the first message. */
  start: (body: string) => Promise<void>;
  /** Posts a message to the existing conversation. */
  post: (body: string) => Promise<void>;
}

export function createFirstMessageQueue(deps: FirstMessageQueueDeps) {
  let pending: Promise<void> | null = null;

  async function send(body: string): Promise<void> {
    if (deps.hasConversation()) return deps.post(body);

    if (!pending) {
      const started = deps.start(body).finally(() => {
        if (pending === started) pending = null;
      });
      pending = started;
      return started;
    }

    await pending.catch(() => undefined);
    // If the first send failed there is still no conversation, so this
    // send starts one (single-flight again).
    return send(body);
  }

  return { send, isStarting: () => pending !== null };
}
