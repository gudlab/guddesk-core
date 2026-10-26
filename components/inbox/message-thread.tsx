"use client";

import { useRef, useEffect } from "react";
import { useMessages } from "@/hooks/use-messages";
import { MessageBubble } from "./message-bubble";
import { Icons } from "@/components/shared/icons";
import { LoadError } from "./load-error";

interface MessageThreadProps {
  conversationId: string;
  isAgentTyping?: boolean;
  typingUser?: string | null;
  /** Told whether the thread couldn't be loaded and nothing is shown, so the reply box can be disabled. */
  onUnavailableChange?: (unavailable: boolean) => void;
}

export function MessageThread({
  conversationId,
  isAgentTyping,
  typingUser,
  onUnavailableChange,
}: MessageThreadProps) {
  const { messages, isLoading, loadError, unavailable, refetch } = useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onUnavailableChange?.(unavailable);
  }, [unavailable, onUnavailableChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAgentTyping]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadError what="this conversation" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {loadError && <LoadError what="messages" onRetry={refetch} compact />}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isAgentTyping && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-pulse">
            {typingUser ?? "Someone"} is typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
