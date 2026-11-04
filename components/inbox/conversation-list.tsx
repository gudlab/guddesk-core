"use client";

import type { ConversationListItem } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

import { ConversationListItemComponent } from "./conversation-list-item";
import { LoadError } from "./load-error";

interface ConversationListProps {
  conversations: ConversationListItem[];
  isLoading: boolean;
  /** The last load failed; the list may be stale or empty. */
  loadError?: boolean;
  onRetry?: () => void;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  loadError = false,
  onRetry = () => {},
  hasMore,
  total,
  loadMore,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="size-5 animate-spin text-neutral-600 dark:text-neutral-300" />
      </div>
    );
  }

  if (loadError && conversations.length === 0) {
    return <LoadError what="conversations" onRetry={onRetry} />;
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <Icons.inbox className="size-8 text-neutral-600 dark:text-neutral-300" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          No conversations
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {loadError && (
        <LoadError what="conversations" onRetry={onRetry} compact />
      )}
      <div className="divide-y">
        {conversations.map((conversation) => (
          <ConversationListItemComponent
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onClick={() => onSelect(conversation.id)}
          />
        ))}
      </div>

      {/* Load more / count */}
      <div className="shrink-0 border-t px-3 py-2">
        {hasMore ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm"
            onClick={loadMore}
          >
            Load more
          </Button>
        ) : (
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
            {total} {total === 1 ? "conversation" : "conversations"}
          </p>
        )}
      </div>
    </div>
  );
}
