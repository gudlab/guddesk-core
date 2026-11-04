"use client";

import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/hooks/use-conversations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChannelBadge } from "@/components/inbox/channel-badge";

interface ConversationListItemProps {
  conversation: ConversationListItem;
  isSelected: boolean;
  onClick: () => void;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ConversationListItemComponent({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  const visitorName =
    conversation.visitor.name ||
    conversation.visitor.email ||
    "Anonymous Visitor";
  const initials = visitorName.slice(0, 2).toUpperCase();

  return (
    <button
      className={cn(
        "hover:bg-muted/50 flex w-full items-start gap-3 border-b p-3 text-left transition-colors",
        isSelected && "bg-muted",
      )}
      onClick={onClick}
    >
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{visitorName}</span>
          <span className="shrink-0 text-xs text-neutral-600 dark:text-neutral-300">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>

        <p className="mt-0.5 truncate text-sm text-neutral-600 dark:text-neutral-300">
          {conversation.lastMessagePreview || "No messages yet"}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1">
          {conversation.channel && conversation.channel !== "WIDGET" && (
            <ChannelBadge channel={conversation.channel} />
          )}
          {conversation.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-1.5 py-0 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}
