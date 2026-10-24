"use client";

import { useRef, useEffect, useTransition } from "react";
import { toast } from "sonner";

import { sendMessage } from "@/actions/send-message";
import { deleteSharedDraft } from "@/actions/manage-shared-draft";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { publishLocalMessage } from "@/lib/local-messages";

interface Props {
  conversationId: string;
  body: string;
  lastEditedByName: string | null;
  onBodyChange: (body: string) => void;
  onSent: () => void;
}

export function SharedDraftEditor({
  conversationId,
  body,
  lastEditedByName,
  onBodyChange,
  onSent,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);

  function handleSendAsReply() {
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await sendMessage(conversationId, {
        body: trimmed,
        type: "AGENT",
      });

      if (result.status === "error") {
        toast.error(result.message ?? "Failed to send");
        return;
      }

      // Show it in the thread now, same as ReplyBox.
      if ("sentMessage" in result && result.sentMessage) {
        publishLocalMessage(conversationId, result.sentMessage);
      }

      // Saved, but the email to the customer didn't go out.
      if ("emailError" in result && result.emailError) {
        toast.error(result.emailError, { duration: 10000 });
      }

      // Delete the draft after sending
      await deleteSharedDraft(conversationId);
      onSent();
    });
  }

  function handleDiscard() {
    startTransition(async () => {
      await deleteSharedDraft(conversationId);
      onBodyChange("");
    });
  }

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Shared Draft
        </span>
        {lastEditedByName && (
          <span className="text-[10px] text-muted-foreground">
            Last edited by {lastEditedByName}
          </span>
        )}
      </div>

      <textarea
        ref={textareaRef}
        className="min-h-[80px] w-full resize-none rounded-md border border-dashed border-blue-300 bg-blue-50/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring dark:border-blue-700 dark:bg-blue-950/30"
        placeholder="Write a shared draft... Other agents can see and edit this."
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
      />

      <div className="mt-2 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-muted-foreground"
          onClick={handleDiscard}
          disabled={isPending || !body.trim()}
        >
          Discard
        </Button>
        <Button
          size="sm"
          onClick={handleSendAsReply}
          disabled={!body.trim() || isPending}
        >
          {isPending && <Icons.spinner className="mr-1.5 size-3 animate-spin" />}
          Send as Reply
        </Button>
      </div>
    </div>
  );
}
