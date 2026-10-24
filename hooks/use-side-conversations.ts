"use client";

import { useState, useEffect, useCallback } from "react";
import { usePusher } from "./use-pusher";
import { onBackOnline } from "@/lib/network";

interface SideMessage {
  id: string;
  senderId: string;
  senderName: string | null;
  body: string;
  createdAt: string;
}

export interface SideConversationItem {
  id: string;
  subject: string;
  status: string;
  createdById: string;
  participantIds: string[];
  messages: SideMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch and subscribe to side conversations for a conversation.
 */
export function useSideConversations(conversationId: string | null) {
  const [sideConversations, setSideConversations] = useState<SideConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchSideConversations = useCallback(async () => {
    if (!conversationId) {
      setSideConversations([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/inbox/conversations/${conversationId}/side-conversations`);
      if (res.ok) {
        const data = await res.json();
        setSideConversations(data.sideConversations ?? []);
        setLoadError(false);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("Failed to fetch side conversations:", error instanceof Error ? error.name : "error");
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchSideConversations();
  }, [fetchSideConversations]);

  useEffect(() => onBackOnline(fetchSideConversations), [fetchSideConversations]);

  // Listen for new side conversations
  usePusher(
    conversationId ? `private-conversation-${conversationId}` : null,
    "side-conversation:created",
    fetchSideConversations,
  );

  // Listen for new messages in side conversations
  const handleNewMessage = useCallback(
    (data: { sideConversationId: string; message: SideMessage }) => {
      setSideConversations((prev) =>
        prev.map((sc) =>
          sc.id === data.sideConversationId
            ? { ...sc, messages: [...sc.messages, data.message] }
            : sc,
        ),
      );
    },
    [],
  );

  usePusher(
    conversationId ? `private-conversation-${conversationId}` : null,
    "side-conversation:message",
    handleNewMessage,
  );

  // Listen for closed side conversations
  const handleClosed = useCallback(
    (data: { sideConversationId: string }) => {
      setSideConversations((prev) =>
        prev.map((sc) =>
          sc.id === data.sideConversationId ? { ...sc, status: "CLOSED" } : sc,
        ),
      );
    },
    [],
  );

  usePusher(
    conversationId ? `private-conversation-${conversationId}` : null,
    "side-conversation:closed",
    handleClosed,
  );

  return { sideConversations, isLoading, loadError, refetch: fetchSideConversations };
}
