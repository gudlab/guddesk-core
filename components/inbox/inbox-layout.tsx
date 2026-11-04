"use client";

import { useState } from "react";

import type { Availability } from "@/lib/agent-presence";
import { cn } from "@/lib/utils";
import { useAgentPresence } from "@/hooks/use-agent-presence";
import { useCollisionDetection } from "@/hooks/use-collision-detection";
import { useConversations } from "@/hooks/use-conversations";
import { useSideConversations } from "@/hooks/use-side-conversations";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { Icons } from "@/components/shared/icons";

import { AvailabilitySelector } from "./availability-selector";
import { CollisionBanner } from "./collision-banner";
import { ConversationDetailSidebar } from "./conversation-detail-sidebar";
import { ConversationFilters } from "./conversation-filters";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { ReplyBox } from "./reply-box";
import { SideConversationPanel } from "./side-conversation-panel";

interface WorkspaceMember {
  id: string;
  userId: string;
  availability: Availability;
  user: { name: string | null; image: string | null };
}

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface InboxLayoutProps {
  workspaceId: string;
  currentUserId: string;
  currentUserName: string;
  members: WorkspaceMember[];
  cannedResponses: CannedResponse[];
}

export function InboxLayout({
  workspaceId,
  currentUserId,
  currentUserName,
  members,
  cannedResponses,
}: InboxLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"OPEN" | "SNOOZED" | "CLOSED">("OPEN");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  // The open thread couldn't be loaded and shows "Couldn't load": no replies.
  const [threadUnavailable, setThreadUnavailable] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const {
    conversations,
    isLoading,
    loadError,
    refetch,
    hasMore,
    total,
    loadMore,
  } = useConversations({
    workspaceId,
    status,
    assigneeId:
      assigneeFilter === "all" || assigneeFilter === "unassigned"
        ? undefined
        : assigneeFilter,
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const { isTyping, typingUser, sendTyping } = useTypingIndicator(selectedId);

  // Collision detection
  const {
    viewers,
    isOtherReplying,
    replyingUser,
    sendReplyingStart,
    sendReplyingStop,
  } = useCollisionDetection(selectedId, currentUserId);

  // Side conversations
  const { sideConversations, isLoading: sideLoading } =
    useSideConversations(selectedId);

  // Own availability: stored value first, then Pusher updates.
  const { getAvailability } = useAgentPresence(workspaceId, members);
  const storedAvailability = members.find(
    (m) => m.userId === currentUserId,
  )?.availability;

  return (
    <div className="flex h-[calc(100vh-10rem)] min-w-0 overflow-hidden border">
      {/* Left: Conversation list */}
      <div
        className={cn(
          "flex min-w-0 shrink-0 flex-col border-r",
          selectedId ? "hidden w-[320px] md:flex" : "w-full md:w-[320px]",
        )}
      >
        <ConversationFilters
          status={status}
          onStatusChange={setStatus}
          assigneeFilter={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          members={members}
        />
        <div className="flex items-center justify-end border-b px-3 py-1">
          <AvailabilitySelector
            workspaceId={workspaceId}
            initialStatus={storedAvailability}
            status={getAvailability(currentUserId, storedAvailability)}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            loadError={loadError}
            onRetry={refetch}
            hasMore={hasMore}
            total={total}
            loadMore={loadMore}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Center: Message thread */}
      <div
        className={cn(
          "min-w-0 flex-1 flex-col",
          selectedId ? "flex" : "hidden md:flex",
        )}
      >
        {selectedId ? (
          <>
            <div className="flex items-center border-b px-3 py-2 md:hidden">
              <button
                type="button"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
                onClick={() => setSelectedId(null)}
              >
                Back to inbox
              </button>
            </div>
            {/* Collision banner */}
            <CollisionBanner
              viewers={viewers}
              isOtherReplying={isOtherReplying}
              replyingUser={replyingUser}
            />
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
              members={members}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onTyping={sendTyping}
              onReplyingStart={() =>
                sendReplyingStart(currentUserId, currentUserName)
              }
              onReplyingStop={() => sendReplyingStop(currentUserId)}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300">
            <Icons.messageCircle className="size-10" />
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        )}
      </div>

      {/* Right: Detail sidebar */}
      {selectedConversation && (
        <div className="hidden h-full lg:flex">
          <ConversationDetailSidebar
            conversation={selectedConversation}
            members={members}
            sideConversationCount={sideConversations.length}
            onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
          />
        </div>
      )}

      {/* Side conversation panel (slides in) */}
      {showSidePanel && selectedId && (
        <SideConversationPanel
          conversationId={selectedId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          members={members}
          onClose={() => setShowSidePanel(false)}
        />
      )}
    </div>
  );
}
