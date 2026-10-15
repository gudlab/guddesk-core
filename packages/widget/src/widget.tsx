import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";

import { isOpen, config, configLoaded, conversationId, messages, showOfflineForm, restoreState } from "./stores/state";
import { initClient, fetchConfig, authenticate, fetchMessages, identify } from "./api/client";
import { shouldShowWidget } from "./utils/page-match";
import { initPusher, subscribeToConversation, disconnect, isConnected } from "./api/pusher";
import {
  applySnippetAppearance,
  shouldHideOnMobile,
  type WidgetSnippetSettings,
} from "./utils/snippet-settings";
import { getStyles } from "./utils/styles";
import { ChatWindow } from "./components/chat-window";
import { ChatBubble } from "./components/chat-bubble";

interface WidgetAppProps {
  appId: string;
  baseUrl: string;
  pusherKey?: string;
  pusherCluster?: string;
  snippet?: WidgetSnippetSettings;
}

// Polling interval when Pusher is not available (4 seconds)
const POLL_INTERVAL = 4000;

export function WidgetApp({
  appId,
  baseUrl,
  pusherKey,
  pusherCluster,
  snippet = {},
}: WidgetAppProps) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pusherInitRef = useRef(false);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVisitorMsgCountRef = useRef(0);
  const isHidden = useSignal(false);

  // Start polling for new messages when Pusher is not available
  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(() => {
      if (conversationId.value && isOpen.value) {
        fetchMessages().catch(() => {});
      }
    }, POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Try to init Pusher with the given keys
  async function tryInitPusher(key: string, cluster: string) {
    if (pusherInitRef.current) return;
    pusherInitRef.current = true;
    try {
      await initPusher(key, cluster, `${baseUrl}/api/pusher/auth`);
      // If we already have a conversation, subscribe now
      if (conversationId.value) {
        subscribeToConversation();
      }
      // Pusher connected — stop polling if active
      stopPolling();
    } catch {
      // Pusher failed — fall back to polling
      pusherInitRef.current = false;
      startPolling();
    }
  }

  useEffect(() => {
    restoreState();
    initClient(appId, baseUrl);

    // Fetch config and authenticate in parallel
    Promise.all([
      fetchConfig().catch(() => {}),
      authenticate().catch(() => {}),
    ]).then(() => {
      const appearance = applySnippetAppearance(config.value, snippet);
      config.value = { ...config.value, ...appearance };

      // Check if widget should be hidden on this page
      const visible = shouldShowWidget(
        window.location.pathname,
        config.value.pageVisibilityMode,
        config.value.pageVisibilityPatterns,
      );
      if (!visible || shouldHideOnMobile(snippet.hideOnMobile, window.innerWidth)) {
        isHidden.value = true;
        return;
      }

      if (snippet.openOnLoad) {
        isOpen.value = true;
      }

      if (snippet.name || snippet.email) {
        identify({ name: snippet.name, email: snippet.email }).catch(() => {});
      }

      // If we have a restored conversation, fetch its messages
      if (conversationId.value) {
        fetchMessages().catch(() => {});
      }

      // Try Pusher from props first, then from config response
      const pKey = pusherKey || config.value.pusherKey;
      const pCluster = pusherCluster || config.value.pusherCluster;

      if (pKey && pCluster) {
        tryInitPusher(pKey, pCluster);
      } else {
        // No Pusher configured — use polling
        startPolling();
      }
    });

    return () => {
      disconnect();
      stopPolling();
    };
  }, []);

  // Subscribe to conversation when it changes (Pusher) or ensure polling is active
  useEffect(() => {
    if (conversationId.value) {
      if (isConnected()) {
        subscribeToConversation();
      } else if (!pollRef.current) {
        startPolling();
      }
    }
  }, [conversationId.value]);

  // When widget opens/closes, manage polling (only poll when open)
  useEffect(() => {
    if (isOpen.value && conversationId.value && !isConnected()) {
      // Fetch immediately when opening, then start polling
      fetchMessages().catch(() => {});
      startPolling();
    } else if (!isOpen.value && !isConnected()) {
      stopPolling();
    }
  }, [isOpen.value]);

  // Offline form timer — show form if no agent response after timeout
  useEffect(() => {
    const timeout = config.value.offlineFormTimeout;
    if (!timeout || !conversationId.value) return;

    const msgs = messages.value;
    const visitorMsgCount = msgs.filter((m) => m.type === "VISITOR").length;
    const hasAgentReply = msgs.some((m) => m.type === "AGENT" || m.type === "BOT");

    // If agent has replied, hide the form and reset
    if (hasAgentReply) {
      showOfflineForm.value = false;
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
      lastVisitorMsgCountRef.current = visitorMsgCount;
      return;
    }

    // Start timer only when a new visitor message is sent (and no agent reply yet)
    if (visitorMsgCount > lastVisitorMsgCountRef.current) {
      lastVisitorMsgCountRef.current = visitorMsgCount;

      if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = setTimeout(() => {
        // Check again if no agent reply at timer expiry
        const current = messages.value;
        const replied = current.some((m) => m.type === "AGENT" || m.type === "BOT");
        if (!replied) {
          showOfflineForm.value = true;
        }
      }, timeout * 60 * 1000);
    }

    return () => {
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
    };
  }, [messages.value, conversationId.value, config.value.offlineFormTimeout]);

  // Don't render until config is loaded; hide if page is excluded
  if (!configLoaded.value || isHidden.value) {
    return null;
  }

  return (
    <>
      <style>{getStyles(config.value.primaryColor, config.value.position)}</style>
      <div class="fc-container">
        {isOpen.value && <ChatWindow />}
        <ChatBubble />
      </div>
    </>
  );
}
