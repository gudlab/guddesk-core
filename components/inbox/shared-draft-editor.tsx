"use client";

import { useEffect, useRef, useTransition } from "react";
import { deleteSharedDraft } from "@/actions/manage-shared-draft";
import { toast } from "sonner";

import { claimSubmit, releaseSubmit } from "@/lib/submit-guard";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

import { deliverReply } from "./deliver-reply";

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
  // Set synchronously, so a second Enter or click in the same tick can't send twice.
  const inFlight = useRef(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);

  function handleSendAsReply() {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    if (!claimSubmit(inFlight)) return;

    startTransition(async () => {
      try {
        await send(trimmed);
      } finally {
        releaseSubmit(inFlight);
      }
    });
  }

  async function send(trimmed: string) {
    // deliverReply keeps the reply's idempotency key in localStorage (shared by tabs), so
    // sending the same text again after a failure can't post it twice.
    const outcome = await deliverReply({
      conversationId,
      body: trimmed,
      type: "AGENT",
    });
    if (outcome !== "posted") return;

    // Delete the draft after sending
    try {
      await deleteSharedDraft(conversationId);
    } catch {
      toast.error(
        "Your reply was sent, but the shared draft couldn't be cleared. Discard it when you're back online.",
      );
    }
    onSent();
  }

  function handleDiscard() {
    startTransition(async () => {
      try {
        await deleteSharedDraft(conversationId);
        onBodyChange("");
      } catch {
        toast.error(
          "The draft couldn't be discarded. Check your connection and try again.",
        );
      }
    });
  }

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          Shared draft
        </span>
        {lastEditedByName && (
          <span className="text-xs text-neutral-600 dark:text-neutral-300">
            Last edited by {lastEditedByName}
          </span>
        )}
      </div>

      <textarea
        ref={textareaRef}
        className="focus:ring-ring min-h-[80px] w-full resize-none rounded-md border border-dashed border-blue-700 bg-blue-50 px-3 py-2 text-sm outline-none placeholder:text-neutral-600 focus:ring-1 dark:border-blue-400 dark:bg-blue-950/30 dark:placeholder:text-neutral-300"
        placeholder="Write a shared draft... Other agents can see and edit this."
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
      />

      <div className="mt-2 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          className="text-sm text-neutral-600 dark:text-neutral-300"
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
          {isPending && (
            <Icons.spinner className="mr-1.5 size-3 animate-spin" />
          )}
          Send as Reply
        </Button>
      </div>
    </div>
  );
}
