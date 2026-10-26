"use client";

import { useState } from "react";
import { ConversationFilters } from "./conversation-filters";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { ReplyBox } from "./reply-box";
import { ConversationDetailSidebar } from "./conversation-detail-sidebar";
import { AvailabilitySelector } from "./availability-selector";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useConversations } from "@/hooks/use-conversations";
import { useAgentPresence } from "@/hooks/use-agent-presence";
import type { Availability } from "@/lib/agent-presence";
import { Icons } from "@/components/shared/icons";

interface WorkspaceMember {
  id: string;
  userId?: string;
  availability?: Availability;
  user: { name: string | null; image: string | null };
}

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface InboxLayoutProps {
  workspaceId: string;
  members: WorkspaceMember[];
  cannedResponses: CannedResponse[];
  currentUserId?: string;
  currentUserName?: string;
}

export function InboxLayout({
  workspaceId,
  members,
  cannedResponses,
  currentUserId,
}: InboxLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"OPEN" | "SNOOZED" | "CLOSED">("OPEN");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  // The open thread couldn't be loaded and shows "Couldn't load": no replies.
  const [threadUnavailable, setThreadUnavailable] = useState(false);

  // The only useConversations instance in the inbox. ConversationList gets
  // the list as props, so there is one list poller and one set of Pusher
  // bindings.
  const { conversations, isLoading, loadError, refetch } = useConversations({
    workspaceId,
    status,
    assigneeId: assigneeFilter === "all" || assigneeFilter === "unassigned"
      ? undefined
      : assigneeFilter,
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const { isTyping, typingUser, sendTyping } = useTypingIndicator(selectedId);

  // Own availability: stored value first, then Pusher updates.
  const presenceMembers = members.flatMap((m) =>
    m.userId && m.availability ? [{ id: m.id, userId: m.userId, availability: m.availability }] : [],
  );
  const { getAvailability } = useAgentPresence(workspaceId, presenceMembers);
  const storedAvailability = members.find((m) => m.userId === currentUserId)?.availability;

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-lg border">
      {/* Left: Conversation list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r">
        <ConversationFilters
          status={status}
          onStatusChange={setStatus}
          assigneeFilter={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          members={members}
        />
        {currentUserId && (
          <div className="flex items-center justify-end border-b px-3 py-1">
            <AvailabilitySelector
              workspaceId={workspaceId}
              initialStatus={storedAvailability}
              status={getAvailability(currentUserId, storedAvailability)}
            />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            loadError={loadError}
            onRetry={refetch}
            status={status}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Center: Message thread */}
      <div className="flex flex-1 flex-col">
        {selectedId ? (
          <>
            <MessageThread
              conversationId={selectedId}
              isAgentTyping={isTyping}
              typingUser={typingUser}
              onUnavailableChange={setThreadUnavailable}
            />
            <ReplyBox
              conversationId={selectedId}
              cannedResponses={cannedResponses}
              disabled={threadUnavailable}
              onTyping={sendTyping}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icons.messageCircle className="size-10" />
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        )}
      </div>

      {/* Right: Detail sidebar */}
      {selectedConversation && (
        <ConversationDetailSidebar
          conversation={selectedConversation}
          members={members}
        />
      )}
    </div>
  );
}
