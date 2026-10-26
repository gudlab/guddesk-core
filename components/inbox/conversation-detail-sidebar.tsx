"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { callAction } from "@/lib/network";
import { assignConversation } from "@/actions/assign-conversation";
import { updateConversationStatus } from "@/actions/update-conversation-status";
import { tagConversation } from "@/actions/tag-conversation";
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
import { Icons } from "@/components/shared/icons";
import type { ConversationListItem } from "@/hooks/use-conversations";

interface WorkspaceMember {
  id: string;
  user: { name: string | null; image: string | null };
}

interface ConversationDetailSidebarProps {
  conversation: ConversationListItem;
  members: WorkspaceMember[];
}

export function ConversationDetailSidebar({
  conversation,
  members,
}: ConversationDetailSidebarProps) {
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const visitorName =
    conversation.visitor.name ||
    conversation.visitor.email ||
    "Anonymous Visitor";
  const initials = visitorName.slice(0, 2).toUpperCase();

  function handleAssign(value: string) {
    const assigneeId = value === "unassigned" ? null : value;
    startTransition(async () => {
      const result = await callAction(() => assignConversation(conversation.id, assigneeId), toast.error);
      if (result?.status === "error") toast.error(result.message);
    });
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await callAction(
        () => updateConversationStatus(conversation.id, status as "OPEN" | "SNOOZED" | "CLOSED"),
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
        () => tagConversation(conversation.id, conversation.tags.filter((t) => t !== tag)),
        toast.error,
      );
      if (result?.status === "error") toast.error(result.message);
    });
  }

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-l">
      <div className="border-b px-4 py-3">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          Details
        </h4>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Visitor Info */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Visitor</Label>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{visitorName}</p>
              {conversation.visitor.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.visitor.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={conversation.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 text-xs">
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
          <Label className="text-xs text-muted-foreground">Assigned To</Label>
          <Select
            value={conversation.assigneeId ?? "unassigned"}
            onValueChange={handleAssign}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 text-xs">
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
          <Label className="text-xs text-muted-foreground">Tags</Label>
          <div className="flex flex-wrap gap-1">
            {conversation.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 text-xs"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 hover:text-destructive"
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
              className="h-7 text-xs"
            />
            <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-xs">
              Add
            </Button>
          </form>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Actions</Label>
          {conversation.status !== "CLOSED" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => handleStatusChange("CLOSED")}
              disabled={isPending}
            >
              {isPending && <Icons.spinner className="mr-1.5 size-3 animate-spin" />}
              Close Conversation
            </Button>
          )}
          {conversation.status === "CLOSED" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
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
