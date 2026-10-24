"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePusher, usePusherReconnect } from "./use-pusher";
import { usePollingFallback } from "./use-polling-fallback";
import { onBackOnline } from "@/lib/network";
import {
  CONVERSATION_LIST_POLL_MS,
  appendConversationPage,
  mergeConversationPage,
} from "@/lib/inbox-polling";

export interface ConversationListItem {
  id: string;
  status: "OPEN" | "SNOOZED" | "CLOSED";
  channel: "WIDGET" | "EMAIL" | "API";
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  tags: string[];
  assigneeId: string | null;
  visitor: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  assignee: {
    id: string;
    user: { name: string | null; image: string | null };
  } | null;
  _count: { messages: number };
}

interface UseConversationsOptions {
  workspaceId: string;
  status?: "OPEN" | "SNOOZED" | "CLOSED";
  assigneeId?: string;
}

const PAGE_SIZE = 25;

export function useConversations({
  workspaceId,
  status = "OPEN",
  assigneeId,
}: UseConversationsOptions) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  // The last list load failed (offline, server down or an error answer).
  const [loadError, setLoadError] = useState(false);
  const nextCursorRef = useRef<string | null>(null);
  // True once "load more" has appended a second page.
  const extraPagesRef = useRef(false);
  const filterKey = `${workspaceId}|${status}|${assigneeId ?? ""}`;
  const filterKeyRef = useRef(filterKey);
  filterKeyRef.current = filterKey;

  const fetchConversations = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams({
        workspaceId,
        status,
        limit: String(PAGE_SIZE),
      });
      if (assigneeId) params.set("assigneeId", assigneeId);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/inbox/conversations?${params}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();

        if (cursor) {
          // Appending more results. A poll may already have pulled some of
          // these rows up, so skip duplicates.
          setConversations((prev) => appendConversationPage(prev, data.conversations));
          extraPagesRef.current = true;
        } else {
          // Fresh fetch (filter change or refresh)
          setConversations(data.conversations);
          extraPagesRef.current = false;
        }

        setHasMore(data.hasMore ?? false);
        setTotal(data.total ?? 0);
        nextCursorRef.current = data.nextCursor ?? null;
        setLoadError(false);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error instanceof Error ? error.name : "error");
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, status, assigneeId]);

  // Initial fetch + re-fetch on filter change
  useEffect(() => {
    setIsLoading(true);
    nextCursorRef.current = null;
    fetchConversations();
  }, [fetchConversations]);

  // Load more (append next page)
  const loadMore = useCallback(() => {
    if (nextCursorRef.current) {
      fetchConversations(nextCursorRef.current);
    }
  }, [fetchConversations]);

  // Real-time updates — refresh from the beginning
  const refresh = useCallback(() => {
    nextCursorRef.current = null;
    fetchConversations();
  }, [fetchConversations]);

  usePusher(`private-workspace-${workspaceId}`, "conversation:created", refresh);
  usePusher(`private-workspace-${workspaceId}`, "conversation:updated", refresh);
  usePusher(`private-workspace-${workspaceId}`, "conversation:new-message", refresh);
  usePusher(`private-workspace-${workspaceId}`, "conversations:bulk-updated", refresh);

  // Resync after reconnect — events that fired while disconnected are lost.
  usePusherReconnect(refresh);

  // And when the browser itself comes back online.
  useEffect(() => onBackOnline(refresh), [refresh]);

  // Without Pusher, poll the first page. One request per poll, same
  // endpoint and filters. Rows from "load more" are kept.
  const pollConversations = useCallback(async () => {
    const key = `${workspaceId}|${status}|${assigneeId ?? ""}`;
    const params = new URLSearchParams({
      workspaceId,
      status,
      limit: String(PAGE_SIZE),
    });
    if (assigneeId) params.set("assigneeId", assigneeId);
    try {
      const res = await fetch(`/api/inbox/conversations?${params}`, {
        cache: "no-store",
      });
      if (!res.ok || filterKeyRef.current !== key) return;
      const data = await res.json();
      setConversations((prev) =>
        mergeConversationPage(prev, data.conversations ?? [], PAGE_SIZE),
      );
      setTotal(data.total ?? 0);
      setLoadError(false);
      if (!extraPagesRef.current) {
        setHasMore(data.hasMore ?? false);
        nextCursorRef.current = data.nextCursor ?? null;
      }
    } catch {
      // Next poll retries.
    }
  }, [workspaceId, status, assigneeId]);

  usePollingFallback(pollConversations, CONVERSATION_LIST_POLL_MS);

  return { conversations, isLoading, loadError, hasMore, total, loadMore, refetch: refresh };
}
