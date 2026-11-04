import { render, h } from "preact";
import { WidgetApp } from "./widget";
import { isOpen } from "./stores/state";
import { identify as identifyVisitor } from "./api/client";
import { isolateShadowKeyboard } from "./utils/isolate-events";

interface GudDeskSettings {
  appId: string;
  baseUrl?: string;
  pusherKey?: string;
  pusherCluster?: string;
}

declare global {
  interface Window {
    GudDeskSettings?: GudDeskSettings;
    GudDesk?: {
      init: (settings: GudDeskSettings) => void;
      identify: (info: {
        userId?: string;
        name?: string;
        email?: string;
        metadata?: Record<string, unknown>;
        userHash?: string;
      }) => Promise<void>;
      open: () => void;
      close: () => void;
      destroy: () => void;
    };
  }
}

let shadowRoot: ShadowRoot | null = null;
let unbindShadowKeyboard: (() => void) | null = null;

// Hosted SaaS API is on www. Vercel redirects guddesk.com → www.guddesk.com
// with a 307 that has no CORS headers, so a browser preflight from a
// customer origin to the apex fails. Code cannot skip that domain redirect.
const HOSTED_WIDGET_API_BASE = "https://www.guddesk.com";

function hostedWidgetApiBaseUrl(hostname: string): string | null {
  if (
    hostname === "cdn.guddesk.com" ||
    hostname === "www.guddesk.com" ||
    hostname === "guddesk.com"
  ) {
    return HOSTED_WIDGET_API_BASE;
  }
  return null;
}

function getBaseUrl(): string {
  // Detect the script's origin to derive the base URL
  const scripts = document.querySelectorAll("script[src]");
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = (scripts[i] as HTMLScriptElement).src;
    if (src.includes("guddesk") || src.includes("widget")) {
      try {
        const url = new URL(src);
        return hostedWidgetApiBaseUrl(url.hostname) ?? url.origin;
      } catch {
        // continue
      }
    }
  }
  return window.location.origin;
}

function resolveBaseUrl(settingsBaseUrl?: string): string {
  if (!settingsBaseUrl) return getBaseUrl();
  try {
    const url = new URL(settingsBaseUrl);
    return hostedWidgetApiBaseUrl(url.hostname) ?? settingsBaseUrl.replace(/\/$/, "");
  } catch {
    return settingsBaseUrl.replace(/\/$/, "");
  }
}

function init(settings: GudDeskSettings) {
  if (shadowRoot) return; // Already initialized

  const appId = settings.appId;
  if (!appId) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }

  const baseUrl = resolveBaseUrl(settings.baseUrl);

  // Create host element + shadow DOM for style isolation
  const host = document.createElement("div");
  host.id = "guddesk-widget";
  document.body.appendChild(host);
  shadowRoot = host.attachShadow({ mode: "open" });
  unbindShadowKeyboard = isolateShadowKeyboard(shadowRoot);

  // Mount Preact app inside shadow DOM
  render(
    h(WidgetApp, {
      appId,
      baseUrl,
      pusherKey: settings.pusherKey,
      pusherCluster: settings.pusherCluster,
    }),
    shadowRoot,
  );
}

function destroy() {
  const host = document.getElementById("guddesk-widget");
  if (host) {
    unbindShadowKeyboard?.();
    unbindShadowKeyboard = null;
    render(null, shadowRoot!);
    host.remove();
    shadowRoot = null;
  }
}

// Public API
const GudDesk = {
  init,
  identify: (info: {
    userId?: string;
    name?: string;
    email?: string;
    metadata?: Record<string, unknown>;
    userHash?: string;
  }) => identifyVisitor(info),
  open: () => {
    isOpen.value = true;
  },
  close: () => {
    isOpen.value = false;
  },
  destroy,
};

// Expose globally
window.GudDesk = GudDesk;

// Auto-init if settings are present
if (window.GudDeskSettings) {
  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      init(window.GudDeskSettings!),
    );
  } else {
    init(window.GudDeskSettings);
  }
}

export default GudDesk;
