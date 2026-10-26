"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePusher, usePusherReconnect } from "./use-pusher";
import { usePollingFallback } from "./use-polling-fallback";
import {
  THREAD_POLL_MS,
  createRequestGeneration,
  cursorAfterPage,
  mergeMessagesById,
  messagesPollQuery,
  type MessagesPollCursor,
} from "@/lib/inbox-polling";
import { subscribeLocalMessages } from "@/lib/local-messages";
import { onBackOnline } from "@/lib/network";

export interface MessageItem {
  id: string;
  type: "VISITOR" | "AGENT" | "NOTE" | "SYSTEM" | "BOT";
  body: string;
  senderId: string | null;
  senderName: string | null;
  createdAt: string;
  sender: {
    name: string | null;
    image: string | null;
  } | null;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // The last thread load failed (offline, server down or an error answer).
  const [loadError, setLoadError] = useState(false);

  // Which conversation the messages in state belong to, and the latest
  // messages, for the poller. Refs so the poll callback never goes stale.
  const loadedForRef = useRef<string | null>(null);
  const messagesRef = useRef<MessageItem[]>(messages);
  // Set after a full page of poll results: the next poll continues from the
  // last message of that page instead of stepping back the overlap window.
  const pollCursorRef = useRef<MessagesPollCursor | null>(null);
  messagesRef.current = messages;
  const currentIdRef = useRef(conversationId);
  currentIdRef.current = conversationId;
  // Bumped each time the open conversation changes. Responses from an
  // earlier visit (A, then B, then back to A) are dropped.
  const generationRef = useRef<ReturnType<typeof createRequestGeneration> | null>(null);
  if (generationRef.current === null) generationRef.current = createRequestGeneration();
  const generation = generationRef.current;

  const loadMessages = useCallback(
    async (silent: boolean) => {
      if (!conversationId) return;
      const gen = generation.current();
      if (!silent) setIsLoading(true);
      try {
        const res = await fetch(`/api/inbox/conversations/${conversationId}/messages`);
        if (currentIdRef.current !== conversationId || !generation.isCurrent(gen)) return;
        if (res.ok) {
          const data = await res.json();
          if (!generation.isCurrent(gen)) return;
          setMessages(data.messages);
          loadedForRef.current = conversationId;
          pollCursorRef.current = null;
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error instanceof Error ? error.name : "error");
        if (generation.isCurrent(gen)) setLoadError(true);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [conversationId, generation],
  );

  const fetchMessages = useCallback(() => loadMessages(false), [loadMessages]);

  // A different conversation: drop the previous one's messages first, so a
  // failed load (offline, server down) shows "Couldn't load" instead of the
  // last conversation's thread.
  useEffect(() => {
    generation.next();
    setMessages([]);
    messagesRef.current = [];
    setLoadError(false);
    loadedForRef.current = null;
    pollCursorRef.current = null;
    fetchMessages();
  }, [fetchMessages, generation]);

  // Real-time new messages
  // Pusher payload is the message object directly (not wrapped in { message })
  usePusher(
    conversationId ? `private-conversation-${conversationId}` : null,
    "message:created",
    (data: MessageItem) => {
      setMessages((prev) => mergeMessagesById(prev, [data]));
    },
  );

  // Status updates
  usePusher(
    conversationId ? `private-conversation-${conversationId}` : null,
    "conversation:updated",
    () => {
      // Refetch to get system messages
      fetchMessages();
    },
  );

  // Resync after reconnect — any message:created fired while we were
  // disconnected is gone forever.
  usePusherReconnect(fetchMessages);

  // And when the browser itself comes back online.
  useEffect(() => onBackOnline(() => void loadMessages(true)), [loadMessages]);

  // The agent's own reply or note, published by ReplyBox once sendMessage
  // succeeds. Merged by id, so a later Pusher or poll copy is ignored.
  useEffect(() => {
    if (!conversationId) return;
    return subscribeLocalMessages<MessageItem>(conversationId, (message) => {
      setMessages((prev) => mergeMessagesById(prev, [message]));
    });
  }, [conversationId]);

  // Without Pusher, poll the open thread. Once the thread is loaded, ask
  // only for messages since the newest one we hold (plus an overlap).
  const pollMessages = useCallback(async () => {
    if (!conversationId) return;
    const gen = generation.current();
    if (loadedForRef.current !== conversationId) {
      await loadMessages(true);
      return;
    }
    const query = messagesPollQuery(messagesRef.current, pollCursorRef.current);
    if (!query) {
      await loadMessages(true);
      return;
    }
    try {
      const res = await fetch(
        `/api/inbox/conversations/${conversationId}/messages?${query}`,
        { cache: "no-store" },
      );
      if (!res.ok || currentIdRef.current !== conversationId || !generation.isCurrent(gen)) return;
      const data = await res.json();
      if (!generation.isCurrent(gen)) return;
      const page: MessageItem[] = data.messages ?? [];
      pollCursorRef.current = cursorAfterPage(page);
      setMessages((prev) => mergeMessagesById(prev, page));
      setLoadError(false);
    } catch {
      // Next poll retries.
    }
  }, [conversationId, loadMessages, generation]);

  usePollingFallback(pollMessages, THREAD_POLL_MS, conversationId !== null);

  // Nothing shown belongs to another conversation: messages are cleared on
  // every switch. unavailable = the thread couldn't be loaded and there is
  // nothing to show, so the reply box should be disabled too.
  const unavailable = loadError && messages.length === 0;

  return { messages, isLoading, loadError, unavailable, refetch: fetchMessages };
}
