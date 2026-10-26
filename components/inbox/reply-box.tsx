"use client";

import { useState, useTransition, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";
import { claimSubmit, releaseSubmit } from "@/lib/submit-guard";
import { CannedResponsePicker } from "./canned-response-picker";
import { deliverReply } from "./deliver-reply";

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface ReplyBoxProps {
  conversationId: string;
  cannedResponses: CannedResponse[];
  onTyping?: () => void;
  /** The thread couldn't be loaded (offline, server down): no sending until it is. */
  disabled?: boolean;
}

export function ReplyBox({
  conversationId,
  cannedResponses,
  onTyping,
  disabled = false,
}: ReplyBoxProps) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [isPending, startTransition] = useTransition();
  const [showCanned, setShowCanned] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Set synchronously, so a second Enter in the same tick can't send twice.
  const inFlight = useRef(false);

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [conversationId, disabled]);

  function handleSubmit() {
    if (disabled) return;
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    if (!claimSubmit(inFlight)) return;

    startTransition(async () => {
      try {
        await submit(trimmed);
      } finally {
        releaseSubmit(inFlight);
      }
    });
  }

  async function submit(trimmed: string) {
    // deliverReply keeps the reply's idempotency key in localStorage (shared by tabs), so
    // sending the same text again after a failure can't post it twice.
    const outcome = await deliverReply({
      conversationId,
      body: trimmed,
      type: mode === "note" ? "NOTE" : "AGENT",
    });
    if (outcome !== "posted") return;

    setBody("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Show canned responses on /
    if (e.key === "/" && body === "") {
      setShowCanned(true);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
    onTyping?.();
    if (e.target.value === "" || !e.target.value.startsWith("/")) {
      setShowCanned(false);
    }
  }

  function insertCannedResponse(response: CannedResponse) {
    setBody(response.body);
    setShowCanned(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t">
      <div className="flex items-center gap-2 border-b px-3 py-1.5">
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "reply" | "note")}
        >
          <TabsList className="h-7">
            <TabsTrigger value="reply" className="px-2 text-xs">
              Reply
            </TabsTrigger>
            <TabsTrigger value="note" className="px-2 text-xs">
              Note
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "note" && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            Only visible to your team
          </span>
        )}
      </div>

      <div className="relative p-3">
        {showCanned && cannedResponses.length > 0 && (
          <CannedResponsePicker
            responses={cannedResponses}
            onSelect={insertCannedResponse}
            onClose={() => setShowCanned(false)}
          />
        )}

        <textarea
          ref={textareaRef}
          className="min-h-[80px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          placeholder={
            mode === "note"
              ? "Write an internal note... (only your team can see this)"
              : 'Type a reply... (press "/" for canned responses)'
          }
          value={body}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {disabled
              ? "Can't send until this conversation loads."
              : "Press Enter to send, Shift+Enter for new line"}
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim() || isPending || disabled}
          >
            {isPending && (
              <Icons.spinner className="mr-1.5 size-3 animate-spin" />
            )}
            {mode === "note" ? "Add Note" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
