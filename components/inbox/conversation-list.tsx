"use client";

import type { ConversationListItem } from "@/hooks/use-conversations";
import { ConversationListItemComponent } from "./conversation-list-item";
import { Icons } from "@/components/shared/icons";

interface ConversationListProps {
  conversations: ConversationListItem[];
  isLoading: boolean;
  status: "OPEN" | "SNOOZED" | "CLOSED";
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  status,
  selectedId,
  onSelect,
}: ConversationListProps) {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <Icons.inbox className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No {status.toLowerCase()} conversations
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationListItemComponent
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedId === conversation.id}
          onClick={() => onSelect(conversation.id)}
        />
      ))}
    </div>
  );
}
