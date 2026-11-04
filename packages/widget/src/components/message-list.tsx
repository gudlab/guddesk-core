import { useRef, useEffect } from "preact/hooks";
import { messages, isTyping, config, hasConversation } from "../stores/state";

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageList() {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.value.length, isTyping.value]);

  if (!hasConversation.value) {
    return (
      <div class="fc-messages">
        <div class="fc-msg fc-msg-agent">
          {config.value.welcomeMessage}
        </div>
      </div>
    );
  }

  return (
    <div class="fc-messages">
      {messages.value.map((msg) =>
        msg.type === "SYSTEM" ? (
          <div key={msg.id} class="fc-msg-system">
            {msg.body}
          </div>
        ) : (
          <div
            key={msg.id}
            class={`fc-msg-row ${msg.type === "VISITOR" ? "fc-msg-row-visitor" : "fc-msg-row-agent"}`}
          >
            {msg.type !== "VISITOR" && msg.senderName && (
              <div class="fc-msg-sender">{msg.senderName}</div>
            )}
            <div
              class={`fc-msg ${msg.type === "VISITOR" ? "fc-msg-visitor" : "fc-msg-agent"}${msg._sending ? " fc-msg-sending" : ""}`}
            >
              {msg.body}
              <div class="fc-msg-time">
                {msg._sending ? (
                  <span class="fc-sending-indicator">
                    <span class="fc-sending-dot" />
                    <span class="fc-sending-dot" />
                    <span class="fc-sending-dot" />
                  </span>
                ) : (
                  formatTime(msg.createdAt)
                )}
              </div>
            </div>
          </div>
        ),
      )}

      {isTyping.value && (
        <div class="fc-typing">
          <span class="fc-typing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
