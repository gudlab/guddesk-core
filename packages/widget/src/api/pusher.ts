import { messages, conversationId, visitorToken, isTyping, type Message } from "../stores/state";

let pusherInstance: any = null;
let currentChannel: any = null;
let typingTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectHandler: (() => void) | null = null;

// How long to wait for the WS handshake before declaring init a failure
// and letting the caller fall back to polling.
const CONNECT_TIMEOUT_MS = 8000;

export async function initPusher(key: string, cluster: string, authEndpoint: string) {
  // pusher-js is bundled into widget.js (see vite.config.ts), so this import
  // resolves inside the bundle and never asks the browser for "pusher-js".
  const { default: Pusher } = await import("pusher-js");

  // Use a customHandler so the visitor token is read at the time of each
  // auth request, not captured at Pusher-instance-construction time. If
  // identify() rotates the token (anonymous → authenticated), any later
  // subscribe call would otherwise still ship the stale token and get a
  // 403 from /api/pusher/auth.
  const instance = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: authEndpoint,
      transport: "ajax",
      customHandler: ({ channelName, socketId }, callback) => {
        fetch(authEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-visitor-token": visitorToken.value ?? "",
          },
          body: new URLSearchParams({
            socket_id: socketId,
            channel_name: channelName,
          }).toString(),
        })
          .then(async (res) => {
            if (!res.ok) {
              callback(
                new Error(`Pusher auth failed: ${res.status}`),
                null,
              );
              return;
            }
            const data = await res.json();
            callback(null, data);
          })
          .catch((err) => callback(err, null));
      },
    },
  });

  // Wait for the actual WS handshake before reporting success — otherwise
  // a bad key / blocked network / ad-blocker can leave us with a truthy
  // instance that never connects, and the widget stops polling.
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      try {
        instance.disconnect();
      } catch {}
      reject(new Error("Pusher connection timeout"));
    }, CONNECT_TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      instance.connection.unbind("connected", onConnected);
      instance.connection.unbind("error", onError);
      instance.connection.unbind("unavailable", onError);
      instance.connection.unbind("failed", onError);
    }

    function onConnected() {
      cleanup();
      resolve();
    }

    function onError(err: unknown) {
      cleanup();
      try {
        instance.disconnect();
      } catch {}
      reject(err instanceof Error ? err : new Error("Pusher connection error"));
    }

    instance.connection.bind("connected", onConnected);
    instance.connection.bind("error", onError);
    instance.connection.bind("unavailable", onError);
    instance.connection.bind("failed", onError);
  });

  pusherInstance = instance;
  return pusherInstance;
}

/**
 * Register a callback to run whenever the connection recovers after a drop.
 * Used by the widget to resync messages on reconnect.
 */
export function onReconnect(cb: () => void) {
  reconnectHandler = cb;
  if (!pusherInstance) return;

  pusherInstance.connection.bind("connected", () => {
    if (reconnectHandler) reconnectHandler();
    // Re-subscribe after a drop so message:created etc. start flowing again
    if (conversationId.value) subscribeToConversation();
  });
}

export function subscribeToConversation() {
  if (!pusherInstance || !conversationId.value) return;

  // Unsubscribe previous
  if (currentChannel) {
    currentChannel.unbind_all();
    pusherInstance.unsubscribe(currentChannel.name);
  }

  const channelName = `private-visitor-${conversationId.value}`;
  currentChannel = pusherInstance.subscribe(channelName);

  currentChannel.bind("message:created", (data: Message) => {
    if (!messages.value.some((m) => m.id === data.id)) {
      messages.value = [...messages.value, data];
    }
  });

  currentChannel.bind("typing:start", () => {
    isTyping.value = true;
    // Auto-clear after 4 seconds in case typing:stop is never received
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      isTyping.value = false;
    }, 4000);
  });

  currentChannel.bind("typing:stop", () => {
    isTyping.value = false;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
  });
}

export function isConnected(): boolean {
  return pusherInstance?.connection?.state === "connected";
}

export function disconnect() {
  if (currentChannel) {
    currentChannel.unbind_all();
    pusherInstance?.unsubscribe(currentChannel.name);
    currentChannel = null;
  }
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
  reconnectHandler = null;
}
