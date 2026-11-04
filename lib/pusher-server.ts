import Pusher from "pusher";

import { env } from "@/env.mjs";

let pusherServerInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (!env.PUSHER_APP_ID || !env.PUSHER_SECRET || !env.NEXT_PUBLIC_PUSHER_KEY || !env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    return null;
  }

  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: env.PUSHER_APP_ID,
      key: env.NEXT_PUBLIC_PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherServerInstance;
}

export interface RealtimeEvent {
  channel: string;
  name: string;
  data: unknown;
}

/**
 * Trigger a single Pusher event, swallowing errors so a realtime failure
 * (rate limit, account suspension, network blip) never bubbles up and
 * fails an action whose primary work (DB write, etc.) already succeeded.
 * Returns true if Pusher accepted the event, false otherwise.
 *
 * Use this for all server-emitted Pusher events. For multi-event payloads
 * prefer `safeTriggerBatch`.
 */
export async function safeTrigger(
  channel: string,
  name: string,
  data: unknown,
  context?: string,
): Promise<boolean> {
  const pusher = getPusherServer();
  if (!pusher) return false;
  try {
    await pusher.trigger(channel, name, data);
    return true;
  } catch (err) {
    console.error(
      `Pusher trigger failed${context ? ` (${context})` : ""}: ${channel}/${name}`,
      err,
    );
    return false;
  }
}

/**
 * Trigger multiple Pusher events in a single HTTPS round-trip. Pusher
 * caps batches at 10 events, so we chunk if needed. Errors are logged
 * and swallowed, same as safeTrigger.
 */
export async function safeTriggerBatch(
  events: RealtimeEvent[],
  context?: string,
): Promise<boolean> {
  if (events.length === 0) return true;
  const pusher = getPusherServer();
  if (!pusher) return false;

  const CHUNK_SIZE = 10;
  try {
    for (let i = 0; i < events.length; i += CHUNK_SIZE) {
      const chunk = events.slice(i, i + CHUNK_SIZE);
      await pusher.triggerBatch(chunk);
    }
    return true;
  } catch (err) {
    console.error(
      `Pusher triggerBatch failed${context ? ` (${context})` : ""} (${events.length} events)`,
      err,
    );
    return false;
  }
}
