"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "@/lib/pusher-client";

interface Viewer {
  userId: string;
  name: string;
  image: string | null;
}

/**
 * Track which agents are viewing/replying to a conversation.
 * Uses Pusher presence channel for real-time awareness.
 */
export function useCollisionDetection(
  conversationId: string | null,
  currentUserId: string | undefined,
) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isOtherReplying, setIsOtherReplying] = useState(false);
  const [replyingUser, setReplyingUser] = useState<string | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setViewers([]);
      setIsOtherReplying(false);
      return;
    }

    const client = getPusherClient();
    if (!client) return;

    const channelName = `presence-conversation-${conversationId}`;
    const channel = client.subscribe(channelName);
    channelRef.current = channel;

    function updateViewers() {
      const presenceChannel = channel as any;
      if (!presenceChannel.members) return;
      const list: Viewer[] = [];
      presenceChannel.members.each((member: { id: string; info: { name: string; image: string | null } }) => {
        if (member.id !== currentUserId) {
          list.push({
            userId: member.id,
            name: member.info?.name ?? "Unknown",
            image: member.info?.image ?? null,
          });
        }
      });
      setViewers(list);
    }

    channel.bind("pusher:subscription_succeeded", updateViewers);
    channel.bind("pusher:member_added", updateViewers);
    channel.bind("pusher:member_removed", () => {
      updateViewers();
      // Clear replying state if the replying user left
      setIsOtherReplying(false);
      setReplyingUser(null);
    });

    channel.bind("client-replying-start", (data: { userId: string; name: string }) => {
      if (data.userId !== currentUserId) {
        setIsOtherReplying(true);
        setReplyingUser(data.name);
      }
    });

    channel.bind("client-replying-stop", (data: { userId: string }) => {
      if (data.userId !== currentUserId) {
        setIsOtherReplying(false);
        setReplyingUser(null);
      }
    });

    return () => {
      client.unsubscribe(channelName);
      channelRef.current = null;
      setViewers([]);
      setIsOtherReplying(false);
      setReplyingUser(null);
    };
  }, [conversationId, currentUserId]);

  const sendReplyingStart = useCallback(
    (userId: string, name: string) => {
      if (channelRef.current) {
        channelRef.current.trigger("client-replying-start", { userId, name });
      }
    },
    [],
  );

  const sendReplyingStop = useCallback(
    (userId: string) => {
      if (channelRef.current) {
        channelRef.current.trigger("client-replying-stop", { userId });
      }
    },
    [],
  );

  return {
    viewers,
    isOtherReplying,
    replyingUser,
    sendReplyingStart,
    sendReplyingStop,
  };
}
