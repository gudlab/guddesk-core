"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";

import { sendMessage } from "@/actions/send-message";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";
import { publishLocalMessage } from "@/lib/local-messages";
import { CannedResponsePicker } from "./canned-response-picker";

interface CannedResponse {
  id: string;
  title: string;
  body: string;
}

interface ReplyBoxProps {
  conversationId: string;
  cannedResponses: CannedResponse[];
  onTyping?: () => void;
}

export function ReplyBox({
  conversationId,
  cannedResponses,
  onTyping,
}: ReplyBoxProps) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [isPending, startTransition] = useTransition();
  const [showCanned, setShowCanned] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await sendMessage(conversationId, {
        body: trimmed,
        type: mode === "note" ? "NOTE" : "AGENT",
      });

      if (result.status === "error") {
        toast.error(result.message || "Failed to send message");
        return;
      }

      // Show the reply in the thread now. With Pusher on, the matching
      // message:created event is merged by id and doesn't add a second copy.
      if ("sentMessage" in result && result.sentMessage) {
        publishLocalMessage(conversationId, result.sentMessage);
      }

      // Saved, but the email to the customer didn't go out.
      if ("emailError" in result && result.emailError) {
        toast.error(result.emailError, { duration: 10000 });
      }

      setBody("");
      textareaRef.current?.focus();
    });
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
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim() || isPending}
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
