/**
 * Pusher calls are awaited by request handlers (a close waits on its
 * realtime events and the CSAT broadcast). A Pusher API that accepts the
 * connection and never answers must not hang those handlers, so every
 * server-side trigger is raced against this timeout.
 */
export const PUSHER_TIMEOUT_MS = 5_000;

export class PusherTimeoutError extends Error {
  constructor(ms: number) {
    super(`Pusher did not answer within ${ms} ms`);
    this.name = "PusherTimeoutError";
  }
}

/** Rejects with PusherTimeoutError if `work` has not settled within `ms`. */
export function withPusherTimeout<T>(work: Promise<T>, ms: number = PUSHER_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PusherTimeoutError(ms)), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}
