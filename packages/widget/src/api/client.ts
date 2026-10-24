import {
  config,
  configLoaded,
  conversationId,
  isLoading,
  messages,
  persistState,
  visitorEmail,
  visitorId,
  visitorToken,
  type Message,
  type WidgetConfig,
} from "../stores/state";
import {
  buildIdentifyPayload,
  type IdentifyVisitorInfo,
} from "./identify-payload";
import {
  createFirstMessageQueue,
  WidgetRequestError,
  withStaleTokenRetry,
} from "./first-message";
import { widgetRequestHeaders } from "./request-headers";

let appId = "";
let baseUrl = "";

export function initClient(key: string, url: string) {
  appId = key;
  baseUrl = url.replace(/\/$/, "");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = widgetRequestHeaders({
    hasBody: Boolean(options.body),
    visitorToken: visitorToken.value,
    extra: options.headers as Record<string, string> | undefined,
  });

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new WidgetRequestError(err.error || "Request failed", res.status, err.code);
  }
  return res.json();
}

export async function fetchConfig(): Promise<void> {
  const data = await request<WidgetConfig>(
    `/api/widget/config?appId=${encodeURIComponent(appId)}`,
  );
  config.value = data;
  configLoaded.value = true;
}

export async function identify(info: IdentifyVisitorInfo): Promise<void> {
  const data = await request<{ visitorId: string; visitorToken: string }>(
    "/api/widget/visitors",
    {
      method: "POST",
      body: JSON.stringify(
        buildIdentifyPayload(appId, visitorToken.value, info),
      ),
    },
  );
  visitorId.value = data.visitorId;
  visitorToken.value = data.visitorToken;
  if (info.email) visitorEmail.value = info.email;
  persistState();
}

let _optimisticCounter = 0;

function addOptimisticMessage(body: string): string {
  const tempId = `_opt_${++_optimisticCounter}`;
  const optimistic: Message = {
    id: tempId,
    body,
    type: "VISITOR",
    senderName: null,
    createdAt: new Date().toISOString(),
    _sending: true,
  };
  messages.value = [...messages.value, optimistic];
  return tempId;
}

function replaceOptimistic(tempId: string, real: Message | null) {
  if (real) {
    messages.value = messages.value.map((m) => (m.id === tempId ? real : m));
  } else {
    // Mark as failed
    messages.value = messages.value.map((m) =>
      m.id === tempId ? { ...m, _sending: false } : m,
    );
  }
}

async function postConversation(body: string) {
  return request<{
    conversationId: string;
    messages: Message[];
    visitorId: string;
    visitorToken: string;
  }>("/api/widget/conversations", {
    method: "POST",
    body: JSON.stringify({
      appId,
      visitorToken: visitorToken.value,
      message: body,
      visitorName: null,
      visitorEmail: visitorEmail.value,
    }),
  });
}

export async function startConversation(body: string): Promise<void> {
  const tempId = addOptimisticMessage(body);
  isLoading.value = true;
  try {
    // A cached token whose visitor was deleted gets a 401. Drop it and
    // start once more as a new visitor.
    const data = await withStaleTokenRetry(() => postConversation(body), {
      has: () => Boolean(visitorToken.value),
      drop: () => {
        visitorToken.value = null;
        visitorId.value = null;
        persistState();
      },
    });
    conversationId.value = data.conversationId;
    visitorId.value = data.visitorId;
    visitorToken.value = data.visitorToken;
    // Replace optimistic with the server messages, keeping any other
    // message still being sent.
    messages.value = [
      ...data.messages,
      ...messages.value.filter((m) => m._sending && m.id !== tempId),
    ];
    persistState();
  } catch {
    replaceOptimistic(tempId, null);
  } finally {
    isLoading.value = false;
  }
}

async function postMessage(body: string): Promise<void> {
  const tempId = addOptimisticMessage(body);
  try {
    const data = await request<Message>(
      `/api/widget/conversations/${conversationId.value}/messages`,
      { method: "POST", body: JSON.stringify({ message: body }) },
    );
    replaceOptimistic(tempId, data);
  } catch {
    replaceOptimistic(tempId, null);
  }
}

// The first message creates the visitor and conversation. Sends made
// while it is in flight wait for it instead of creating a second one.
const firstMessage = createFirstMessageQueue({
  hasConversation: () => Boolean(conversationId.value),
  start: startConversation,
  post: postMessage,
});

export function sendMessage(body: string): Promise<void> {
  return firstMessage.send(body);
}

export async function fetchMessages(): Promise<void> {
  if (!conversationId.value) return;

  const data = await request<{ messages: Message[] }>(
    `/api/widget/conversations/${conversationId.value}/messages`,
  );
  messages.value = data.messages;
}
