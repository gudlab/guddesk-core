import { h, render } from "preact";

import { identify as identifyVisitor } from "./api/client";
import type { IdentifyVisitorInfo } from "./api/identify-payload";
import { isOpen } from "./stores/state";
import {
  findWidgetScriptSrc,
  resolveDefaultApiOrigin,
} from "./utils/api-origin";
import { WidgetApp } from "./widget";

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
      identify: (info: IdentifyVisitorInfo) => Promise<void>;
      open: () => void;
      close: () => void;
      destroy: () => void;
    };
  }
}

let shadowRoot: ShadowRoot | null = null;

function getBaseUrl(explicitBaseUrl?: string): string {
  const scripts = Array.from(document.querySelectorAll("script[src]")).map(
    (el) => ({ src: (el as HTMLScriptElement).src }),
  );
  return resolveDefaultApiOrigin(
    findWidgetScriptSrc(scripts),
    window.location.origin,
    explicitBaseUrl,
  );
}

function init(settings: GudDeskSettings) {
  if (shadowRoot) return; // Already initialized

  const appId = settings.appId;
  if (!appId) {
    console.error("[GudDesk] Missing appId in GudDeskSettings");
    return;
  }

  const baseUrl = getBaseUrl(settings.baseUrl);

  // Create host element + shadow DOM for style isolation
  const host = document.createElement("div");
  host.id = "guddesk-widget";
  document.body.appendChild(host);
  shadowRoot = host.attachShadow({ mode: "open" });

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
    render(null, shadowRoot!);
    host.remove();
    shadowRoot = null;
  }
}

// Public API
const GudDesk = {
  init,
  identify: (info: IdentifyVisitorInfo) => identifyVisitor(info),
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
