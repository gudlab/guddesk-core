"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { claimSubmit, releaseSubmit } from "@/lib/submit-guard";
import { useMentions } from "@/hooks/use-mentions";
import { useSharedDraft } from "@/hooks/use-shared-draft";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";

import { CannedResponsePicker } from "./canned-response-picker";
import { deliverReply } from "./deliver-reply";
import { MentionPicker } from "./mention-picker";
import { SharedDraftEditor } from "./shared-draft-editor";

interface WorkspaceMember {
  id: string;
  userId: string;
  user: { name: string | null; image: string | null };
}

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface ReplyBoxProps {
  conversationId: string;
  cannedResponses: CannedResponse[];
  members: WorkspaceMember[];
  currentUserId: string;
  currentUserName: string;
  onTyping?: () => void;
  /** The thread couldn't be loaded (offline, server down): no sending until it is. */
  disabled?: boolean;
  onReplyingStart?: () => void;
  onReplyingStop?: () => void;
}

export function ReplyBox({
  conversationId,
  cannedResponses,
  members,
  currentUserId,
  currentUserName,
  onTyping,
  disabled = false,
  onReplyingStart,
  onReplyingStop,
}: ReplyBoxProps) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"reply" | "note" | "draft">("reply");
  const [isPending, startTransition] = useTransition();
  const [showCanned, setShowCanned] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Set synchronously, so a second Enter or click in the same tick can't send twice.
  const inFlight = useRef(false);

  // Mentions (active only in note mode)
  const mentionMembers = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    user: m.user,
  }));
  const {
    showPicker: showMentionPicker,
    filteredMembers,
    selectedMentions,
    handleInputChange: handleMentionInput,
    insertMention,
    closePicker: closeMentionPicker,
    resetMentions,
  } = useMentions(mentionMembers);

  // Shared draft
  const { draft, updateDraft, hasDraft } = useSharedDraft(
    mode === "draft" ? conversationId : null,
    currentUserId,
  );

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [conversationId, disabled]);

  // Collision: signal replying start/stop on focus/blur
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (mode === "reply") onReplyingStart?.();
  }, [mode, onReplyingStart]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onReplyingStop?.();
  }, [onReplyingStop]);

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
      mentions: mode === "note" ? selectedMentions : undefined,
    });
    if (outcome !== "posted") return;

    setBody("");
    resetMentions();
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Don't submit on enter if mention picker is open
    if (showMentionPicker && mode === "note") return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Show canned responses on /
    if (e.key === "/" && body === "") {
      setShowCanned(true);
    }
    // Close mention picker on Escape
    if (e.key === "Escape" && showMentionPicker) {
      closeMentionPicker();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setBody(value);
    onTyping?.();

    if (value === "" || !value.startsWith("/")) {
      setShowCanned(false);
    }

    // Mention detection in note mode
    if (mode === "note") {
      const cursorPos = e.target.selectionStart ?? value.length;
      handleMentionInput(value, cursorPos);
    }
  }

  function handleMentionSelect(member: {
    id: string;
    userId: string;
    user: { name: string | null; image: string | null };
  }) {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart ?? body.length;
    const { newValue, newCursorPos } = insertMention(member, body, cursorPos);
    setBody(newValue);
    // Set cursor position after React re-render
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  }

  function insertCannedResponse(response: CannedResponse) {
    setBody(response.body);
    setShowCanned(false);
    textareaRef.current?.focus();
  }

  function handleModeChange(v: string) {
    setMode(v as "reply" | "note" | "draft");
    if (v !== "note") {
      closeMentionPicker();
    }
  }

  // Draft mode renders the shared draft editor instead
  if (mode === "draft" && !disabled) {
    return (
      <div className="border-t">
        <div className="flex items-center gap-2 border-b px-3 py-1.5">
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList className="h-7">
              <TabsTrigger value="reply" className="px-2 text-sm">
                Reply
              </TabsTrigger>
              <TabsTrigger value="note" className="px-2 text-sm">
                Note
              </TabsTrigger>
              <TabsTrigger value="draft" className="px-2 text-sm">
                Draft
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-sm text-blue-800 dark:text-blue-300">
            Shared draft - visible to your team
          </span>
        </div>
        <SharedDraftEditor
          conversationId={conversationId}
          body={draft.body}
          lastEditedByName={draft.lastEditedByName}
          onBodyChange={updateDraft}
          onSent={() => setMode("reply")}
        />
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="flex items-center gap-2 border-b px-3 py-1.5">
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="h-7">
            <TabsTrigger value="reply" className="px-2 text-sm">
              Reply
            </TabsTrigger>
            <TabsTrigger value="note" className="px-2 text-sm">
              Note
            </TabsTrigger>
            <TabsTrigger value="draft" className="px-2 text-sm">
              Draft
              {hasDraft && (
                <span className="ml-1 size-1.5 rounded-full bg-blue-500" />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {mode === "note" && (
          <span className="text-sm text-yellow-900 dark:text-yellow-200">
            Only visible to your team{" "}
            <span className="text-neutral-600 dark:text-neutral-300">
              (type @ to mention)
            </span>
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

        {/* Mention picker */}
        {mode === "note" && showMentionPicker && filteredMembers.length > 0 && (
          <MentionPicker
            members={filteredMembers}
            onSelect={handleMentionSelect}
            onClose={closeMentionPicker}
          />
        )}

        <textarea
          ref={textareaRef}
          className="focus:ring-ring min-h-[80px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-600 focus:ring-1 dark:placeholder:text-neutral-300"
          placeholder={
            mode === "note"
              ? "Write an internal note... (@ to mention teammates)"
              : 'Type a reply... (press "/" for canned responses)'
          }
          value={body}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
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
