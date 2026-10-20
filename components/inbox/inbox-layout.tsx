"use client";

import { useState } from "react";
import { ConversationFilters } from "./conversation-filters";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { ReplyBox } from "./reply-box";
import { ConversationDetailSidebar } from "./conversation-detail-sidebar";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useConversations } from "@/hooks/use-conversations";
import { Icons } from "@/components/shared/icons";

interface WorkspaceMember {
  id: string;
  userId?: string;
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
}: InboxLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"OPEN" | "SNOOZED" | "CLOSED">("OPEN");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // The only useConversations instance in the inbox. ConversationList gets
  // the list as props, so there is one list poller and one set of Pusher
  // bindings.
  const { conversations, isLoading } = useConversations({
    workspaceId,
    status,
    assigneeId: assigneeFilter === "all" || assigneeFilter === "unassigned"
      ? undefined
      : assigneeFilter,
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const { isTyping, typingUser, sendTyping } = useTypingIndicator(selectedId);

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
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
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
            />
            <ReplyBox
              conversationId={selectedId}
              cannedResponses={cannedResponses}
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
