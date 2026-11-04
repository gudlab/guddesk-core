"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { assignConversation } from "@/actions/assign-conversation";
import { tagConversation } from "@/actions/tag-conversation";
import { updateConversationStatus } from "@/actions/update-conversation-status";
import { toast } from "sonner";

import { callAction } from "@/lib/network";
import type { ConversationListItem } from "@/hooks/use-conversations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelBadge } from "@/components/inbox/channel-badge";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceContext } from "@/components/workspace/workspace-context";

interface WorkspaceMember {
  id: string;
  userId?: string;
  user: { name: string | null; image: string | null };
}

interface ConversationDetailSidebarProps {
  conversation: ConversationListItem;
  members: WorkspaceMember[];
  sideConversationCount?: number;
  onToggleSidePanel?: () => void;
}

export function ConversationDetailSidebar({
  conversation,
  members,
  sideConversationCount = 0,
  onToggleSidePanel,
}: ConversationDetailSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");
  const wsContext = useWorkspaceContext();

  const visitorName =
    conversation.visitor.name ||
    conversation.visitor.email ||
    "Anonymous Visitor";
  const initials = visitorName.slice(0, 2).toUpperCase();

  function handleAssign(value: string) {
    const assigneeId = value === "unassigned" ? null : value;
    startTransition(async () => {
      const result = await callAction(
        () => assignConversation(conversation.id, assigneeId),
        toast.error,
      );
      if (result?.status === "error") toast.error(result.message);
    });
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await callAction(
        () =>
          updateConversationStatus(
            conversation.id,
            status as "OPEN" | "SNOOZED" | "CLOSED",
          ),
        toast.error,
      );
      if (result?.status === "error") toast.error(result.message);
    });
  }

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (conversation.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    startTransition(async () => {
      const result = await callAction(
        () => tagConversation(conversation.id, [...conversation.tags, tag]),
        toast.error,
      );
      if (!result) return;
      if (result.status === "error") toast.error(result.message);
      setTagInput("");
    });
  }

  function handleRemoveTag(tag: string) {
    startTransition(async () => {
      const result = await callAction(
        () =>
          tagConversation(
            conversation.id,
            conversation.tags.filter((t) => t !== tag),
          ),
        toast.error,
      );
      if (result?.status === "error") toast.error(result.message);
    });
  }

  return (
    <div className="flex h-full w-[280px] min-w-0 shrink-0 flex-col border-l">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Details</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Visitor Info */}
        <div className="space-y-3">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Visitor
          </Label>
          <Link
            href={
              wsContext
                ? `/workspace/${wsContext.workspaceSlug}/customers/${conversation.visitor.id}`
                : "#"
            }
            className="hover:bg-muted/50 -m-1 flex items-center gap-2 rounded-md p-1 transition-colors"
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{visitorName}</p>
              {conversation.visitor.email && (
                <p className="truncate text-sm text-neutral-600 dark:text-neutral-300">
                  {conversation.visitor.email}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Channel */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Channel
          </Label>
          <ChannelBadge channel={conversation.channel ?? "WIDGET"} />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Status
          </Label>
          <Select
            value={conversation.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="SNOOZED">Snoozed</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Assigned to
          </Label>
          <Select
            value={conversation.assigneeId ?? "unassigned"}
            onValueChange={handleAssign}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.user.name ?? "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Tags
          </Label>
          <div className="flex flex-wrap gap-1">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive ml-0.5"
                >
                  x
                </button>
              </Badge>
            ))}
          </div>
          <form onSubmit={handleAddTag} className="flex gap-1">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag..."
              className="h-8 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-sm"
            >
              Add
            </Button>
          </form>
        </div>

        {/* Side Conversations */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Side conversations
          </Label>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-sm"
            onClick={onToggleSidePanel}
          >
            <Icons.messages className="size-3" />
            {sideConversationCount > 0
              ? `${sideConversationCount} thread${sideConversationCount === 1 ? "" : "s"}`
              : "Start a thread"}
          </Button>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <Label className="text-sm text-neutral-600 dark:text-neutral-300">
            Actions
          </Label>
          {conversation.status !== "CLOSED" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-sm"
              onClick={() => handleStatusChange("CLOSED")}
              disabled={isPending}
            >
              {isPending && (
                <Icons.spinner className="mr-1.5 size-3 animate-spin" />
              )}
              Close Conversation
            </Button>
          )}
          {conversation.status === "CLOSED" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-sm"
              onClick={() => handleStatusChange("OPEN")}
              disabled={isPending}
            >
              Reopen Conversation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
