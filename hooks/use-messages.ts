"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePusher, usePusherReconnect } from "./use-pusher";
import { usePollingFallback } from "./use-polling-fallback";
import {
  THREAD_POLL_MS,
  mergeMessagesById,
  messagesAfterParam,
} from "@/lib/inbox-polling";
import { subscribeLocalMessages } from "@/lib/local-messages";

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

  // Which conversation the messages in state belong to, and the latest
  // messages, for the poller. Refs so the poll callback never goes stale.
  const loadedForRef = useRef<string | null>(null);
  const messagesRef = useRef<MessageItem[]>(messages);
  messagesRef.current = messages;
  const currentIdRef = useRef(conversationId);
  currentIdRef.current = conversationId;

  const loadMessages = useCallback(
    async (silent: boolean) => {
      if (!conversationId) return;
      if (!silent) setIsLoading(true);
      try {
        const res = await fetch(`/api/inbox/conversations/${conversationId}/messages`);
        if (res.ok && currentIdRef.current === conversationId) {
          const data = await res.json();
          setMessages(data.messages);
          loadedForRef.current = conversationId;
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [conversationId],
  );

  const fetchMessages = useCallback(() => loadMessages(false), [loadMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
    if (loadedForRef.current !== conversationId) {
      await loadMessages(true);
      return;
    }
    const after = messagesAfterParam(messagesRef.current);
    if (!after) {
      await loadMessages(true);
      return;
    }
    try {
      const res = await fetch(
        `/api/inbox/conversations/${conversationId}/messages?after=${encodeURIComponent(after)}`,
        { cache: "no-store" },
      );
      if (!res.ok || currentIdRef.current !== conversationId) return;
      const data = await res.json();
      setMessages((prev) => mergeMessagesById(prev, data.messages ?? []));
    } catch {
      // Next poll retries.
    }
  }, [conversationId, loadMessages]);

  usePollingFallback(pollMessages, THREAD_POLL_MS, conversationId !== null);

  return { messages, isLoading, refetch: fetchMessages };
}
