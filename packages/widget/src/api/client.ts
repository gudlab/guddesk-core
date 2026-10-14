import {
  config,
  configLoaded,
  conversationId,
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

let appId = "";
let baseUrl = "";

export function initClient(key: string, url: string) {
  appId = key;
  baseUrl = url.replace(/\/$/, "");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (visitorToken.value) {
    headers["x-visitor-token"] = visitorToken.value;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
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

export async function authenticate(): Promise<void> {
  if (visitorToken.value && visitorId.value) return;

  const data = await request<{ visitorId: string; visitorToken: string }>(
    "/api/widget/auth",
    { method: "POST", body: JSON.stringify({ appId }) },
  );
  visitorId.value = data.visitorId;
  visitorToken.value = data.visitorToken;
  persistState();
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

export async function startConversation(body: string): Promise<void> {
  const tempId = addOptimisticMessage(body);
  try {
    const data = await request<{
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
    conversationId.value = data.conversationId;
    visitorId.value = data.visitorId;
    visitorToken.value = data.visitorToken;
    // Replace optimistic with the server messages
    messages.value = data.messages;
    persistState();
  } catch {
    replaceOptimistic(tempId, null);
  }
}

export async function sendMessage(body: string): Promise<void> {
  if (!conversationId.value) {
    return startConversation(body);
  }

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

export async function fetchMessages(): Promise<void> {
  if (!conversationId.value) return;

  const data = await request<{ messages: Message[] }>(
    `/api/widget/conversations/${conversationId.value}/messages`,
  );
  messages.value = data.messages;
}
