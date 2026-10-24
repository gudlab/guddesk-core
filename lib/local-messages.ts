/**
 * In-page channel for messages the current agent just sent.
 *
 * ReplyBox and MessageThread are siblings, so ReplyBox can't reach the
 * thread's state directly. After sendMessage succeeds, ReplyBox publishes
 * the saved message here and useMessages merges it by id. That makes the
 * reply show up at once with or without Pusher. If Pusher (or a poll) then
 * delivers the same message, mergeMessagesById drops the repeat.
 */

export interface LocalMessage {
  id: string;
  createdAt: string;
}

type Listener<T extends LocalMessage> = (message: T) => void;

const listeners = new Map<string, Set<Listener<LocalMessage>>>();

export function publishLocalMessage<T extends LocalMessage>(
  conversationId: string,
  message: T,
): void {
  const set = listeners.get(conversationId);
  if (!set) return;
  for (const listener of Array.from(set)) listener(message);
}

export function subscribeLocalMessages<T extends LocalMessage>(
  conversationId: string,
  listener: Listener<T>,
): () => void {
  let set = listeners.get(conversationId);
  if (!set) {
    set = new Set();
    listeners.set(conversationId, set);
  }
  const entry = listener as Listener<LocalMessage>;
  set.add(entry);
  return () => {
    const current = listeners.get(conversationId);
    if (!current) return;
    current.delete(entry);
    if (current.size === 0) listeners.delete(conversationId);
  };
}
