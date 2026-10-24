"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MessageItem } from "@/hooks/use-messages";

interface MessageBubbleProps {
  message: MessageItem;
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {message.body}
        </span>
      </div>
    );
  }

  const isVisitor = message.type === "VISITOR";
  const isNote = message.type === "NOTE";
  const senderName = message.senderName || message.sender?.name || "Unknown";
  const senderImage = message.sender?.image;
  const initials = senderName.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex gap-2",
        isVisitor ? "flex-row" : "flex-row-reverse",
      )}
    >
      <Avatar className="size-7 shrink-0">
        {senderImage && <AvatarImage src={senderImage} />}
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[70%] space-y-1",
          isVisitor ? "items-start" : "items-end",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {/* bdi: a right-to-left name can't reorder the text around it. */}
            <bdi>{senderName}</bdi>
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isVisitor && "bg-muted",
            isNote && "border-2 border-dashed border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-950",
            !isVisitor && !isNote && "bg-primary text-primary-foreground",
          )}
        >
          {isNote && (
            <span className="mb-1 block text-[10px] font-semibold uppercase text-yellow-600 dark:text-yellow-400">
              Internal note
            </span>
          )}
          <p className="whitespace-pre-wrap">{message.body}</p>
        </div>
      </div>
    </div>
  );
}
