"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";

import {
  createSideConversation,
  sendSideMessage,
  closeSideConversation,
} from "@/actions/manage-side-conversation";
import { useSideConversations, type SideConversationItem } from "@/hooks/use-side-conversations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";
import { callAction } from "@/lib/network";
import { LoadError } from "./load-error";

interface Member {
  id: string;
  userId: string;
  user: { name: string | null; image: string | null };
}

interface Props {
  conversationId: string;
  members: Member[];
  currentUserId: string;
  currentUserName?: string;
  onClose?: () => void;
}

export function SideConversationPanel({ conversationId, members, currentUserId, onClose }: Props) {
  const { sideConversations, isLoading, loadError, refetch } = useSideConversations(conversationId);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected = sideConversations.find((sc) => sc.id === selectedThread);

  if (selectedThread && selected) {
    return (
      <ThreadView
        thread={selected}
        members={members}
        currentUserId={currentUserId}
        onBack={() => setSelectedThread(null)}
      />
    );
  }

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Side Conversations
        </h4>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => setShowCreate(true)}
          >
            + New
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onClose}>
              <Icons.close className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateForm
          conversationId={conversationId}
          members={members}
          currentUserId={currentUserId}
          onClose={() => setShowCreate(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="p-4 text-center text-xs text-muted-foreground">Loading...</p>
        )}
        {!isLoading && loadError && (
          <LoadError what="side conversations" onRetry={refetch} compact={sideConversations.length > 0} />
        )}
        {!isLoading && !loadError && sideConversations.length === 0 && (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No side conversations yet
          </p>
        )}
        {sideConversations.map((sc) => (
          <button
            key={sc.id}
            className="flex w-full items-center gap-2 border-b px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
            onClick={() => setSelectedThread(sc.id)}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{sc.subject}</span>
                {sc.status === "CLOSED" && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    Closed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {sc.messages.length} message{sc.messages.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Icons.chevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Create Form ────────────────────────────────────────

function CreateForm({
  conversationId,
  members,
  currentUserId,
  onClose,
}: {
  conversationId: string;
  members: Member[];
  currentUserId: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;

    startTransition(async () => {
      const result = await callAction(
        () =>
          createSideConversation(conversationId, {
            subject: subject.trim(),
            participantIds: members.map((m) => m.userId),
          }),
        toast.error,
      );
      if (!result) return;
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        onClose();
      }
    });
  }

  return (
    <form onSubmit={handleCreate} className="border-b p-3 space-y-2">
      <Input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Thread subject..."
        className="h-8 text-xs"
        autoFocus
      />
      <div className="flex gap-1">
        <Button type="submit" size="sm" className="text-xs" disabled={!subject.trim() || isPending}>
          Create
        </Button>
        <Button type="button" size="sm" variant="ghost" className="text-xs" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Thread View ────────────────────────────────────────

function ThreadView({
  thread,
  members,
  currentUserId,
  onBack,
}: {
  thread: SideConversationItem;
  members: Member[];
  currentUserId: string;
  onBack: () => void;
}) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await callAction(() => sendSideMessage(thread.id, trimmed), toast.error);
      if (!result) return;
      if (result.status === "error") {
        toast.error(result.message);
      } else {
        setBody("");
      }
    });
  }

  function handleClose() {
    startTransition(async () => {
      const result = await callAction(() => closeSideConversation(thread.id), toast.error);
      if (result?.status === "error") toast.error(result.message);
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <Icons.arrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{thread.subject}</p>
        </div>
        {thread.status === "OPEN" && (
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={handleClose}>
            Close
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {thread.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const name = msg.senderName ?? "Unknown";
          const initials = name.slice(0, 2).toUpperCase();
          return (
            <div key={msg.id} className="flex gap-2">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-xs font-medium">{name}</span>
                <p className="text-sm">{msg.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {thread.status === "OPEN" && (
        <div className="border-t p-2">
          <div className="flex gap-1">
            <input
              className="flex-1 rounded-md border bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="Reply..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button size="sm" className="h-7 px-2" onClick={handleSend} disabled={!body.trim() || isPending}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
