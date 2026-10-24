/**
 * Collision "is replying" signal for one agent.
 *
 * Pusher drops client events triggered before the presence channel has
 * subscribed, and the reply box autofocuses as soon as a conversation opens,
 * usually before that. So we keep the wanted state (replying or not) and
 * send it whenever a channel finishes subscribing.
 */

export type ReplyingEvent = "client-replying-start" | "client-replying-stop";

export interface ReplyingPayload {
  userId: string;
  name?: string;
}

export type TriggerFn = (event: ReplyingEvent, payload: ReplyingPayload) => unknown;

export interface ReplyingSignal {
  /** The agent focused the reply box. */
  start(userId: string, name: string): void;
  /** The agent left the reply box. */
  stop(userId: string): void;
  /** A channel was created for the open conversation. Not subscribed yet. */
  attach(trigger: TriggerFn): void;
  /** The attached channel subscribed. Sends the current state if replying. */
  markSubscribed(): void;
  /** The conversation closed or changed. */
  detach(): void;
  /** For tests and debugging. */
  readonly state: { replying: boolean; attached: boolean; subscribed: boolean };
}

export function createReplyingSignal(): ReplyingSignal {
  let replying: { userId: string; name: string } | null = null;
  let trigger: TriggerFn | null = null;
  let subscribed = false;

  return {
    start(userId, name) {
      replying = { userId, name };
      if (trigger && subscribed) trigger("client-replying-start", { userId, name });
    },
    stop(userId) {
      const wasReplying = replying !== null;
      replying = null;
      if (wasReplying && trigger && subscribed) trigger("client-replying-stop", { userId });
    },
    attach(next) {
      trigger = next;
      subscribed = false;
    },
    markSubscribed() {
      if (!trigger || subscribed) return;
      subscribed = true;
      if (replying) trigger("client-replying-start", { ...replying });
    },
    detach() {
      trigger = null;
      subscribed = false;
    },
    get state() {
      return { replying: replying !== null, attached: trigger !== null, subscribed };
    },
  };
}
