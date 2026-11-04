"use client";

import { cn } from "@/lib/utils";
import type { MessageItem } from "@/hooks/use-messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Render message body with @mention highlights for note messages.
 */
function renderBodyWithMentions(body: string, isNote: boolean) {
  if (!isNote) return <p className="whitespace-pre-wrap">{body}</p>;

  // Split on @Name patterns
  const parts = body.split(/(@[\w][\w\s]*?\b)/g);

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith("@") && part.length > 1 ? (
          <span
            key={i}
            className="rounded bg-blue-100 px-0.5 font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

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
        <span className="bg-muted rounded-full px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300">
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
      className={cn("flex gap-2", isVisitor ? "flex-row" : "flex-row-reverse")}
    >
      <Avatar className="size-7 shrink-0">
        {senderImage && <AvatarImage src={senderImage} />}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[70%] space-y-1",
          isVisitor ? "items-start" : "items-end",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {/* bdi: a right-to-left name can't reorder the text around it. */}
            <bdi>{senderName}</bdi>
          </span>
          <span className="text-xs text-neutral-600 dark:text-neutral-300">
            {formatTime(message.createdAt)}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isVisitor && "bg-muted",
            isNote &&
              "border border-dashed border-yellow-700 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-950",
            !isVisitor && !isNote && "bg-primary text-primary-foreground",
          )}
        >
          {isNote && (
            <span className="mb-1 block text-xs font-semibold text-yellow-950 dark:text-yellow-100">
              Internal note
            </span>
          )}
          {renderBodyWithMentions(message.body, isNote)}
        </div>
      </div>
    </div>
  );
}
