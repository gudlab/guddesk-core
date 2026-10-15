import type { WidgetConfig } from "../stores/state";

/** Same breakpoint as the widget layout CSS (`max-width: 440px`). */
export const WIDGET_MOBILE_MAX_WIDTH = 440;

export interface WidgetSnippetSettings {
  appId?: string;
  baseUrl?: string;
  pusherKey?: string;
  pusherCluster?: string;
  accentColor?: string;
  position?: string;
  greeting?: string;
  openOnLoad?: boolean;
  hideOnMobile?: boolean;
  name?: string;
  email?: string;
}

export function parseBoolAttr(
  value: string | null | undefined,
): boolean | undefined {
  if (value == null || value === "") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
}

/**
 * Read install options from a widget script tag.
 * Never reads a userHash — identity verification is server-signed only.
 */
export function parseScriptTagSettings(script: {
  getAttribute(name: string): string | null;
  hasAttribute?(name: string): boolean;
}): WidgetSnippetSettings {
  const settings: WidgetSnippetSettings = {};
  const appId =
    script.getAttribute("data-app-id") ||
    script.getAttribute("data-guddesk") ||
    undefined;
  if (appId) settings.appId = appId;

  const baseUrl = script.getAttribute("data-base-url");
  if (baseUrl) settings.baseUrl = baseUrl;

  const openOnLoad = parseBoolAttr(script.getAttribute("data-open-on-load"));
  if (openOnLoad !== undefined) settings.openOnLoad = openOnLoad;

  const hideOnMobile = parseBoolAttr(script.getAttribute("data-hide-on-mobile"));
  if (hideOnMobile !== undefined) settings.hideOnMobile = hideOnMobile;

  const name = script.getAttribute("data-name");
  if (name) settings.name = name;

  const email = script.getAttribute("data-email");
  if (email) settings.email = email;

  const accentColor = script.getAttribute("data-accent-color");
  if (accentColor) settings.accentColor = accentColor;

  const position = script.getAttribute("data-position");
  if (position) settings.position = position;

  if (script.hasAttribute?.("data-greeting")) {
    settings.greeting = script.getAttribute("data-greeting") ?? "";
  }

  return settings;
}

/** Window settings win over data attributes when both are present. */
export function mergeSnippetSettings(
  fromScript: WidgetSnippetSettings,
  fromWindow?: WidgetSnippetSettings | null,
): WidgetSnippetSettings {
  return { ...fromScript, ...fromWindow };
}

/**
 * Snippet appearance overlays dashboard config after fetchConfig.
 * Omitted snippet keys leave the dashboard values in place.
 */
export function applySnippetAppearance(
  dashboard: Pick<WidgetConfig, "primaryColor" | "position" | "welcomeMessage">,
  snippet: WidgetSnippetSettings,
): Pick<WidgetConfig, "primaryColor" | "position" | "welcomeMessage"> {
  return {
    primaryColor: snippet.accentColor ?? dashboard.primaryColor,
    position: snippet.position ?? dashboard.position,
    welcomeMessage:
      snippet.greeting !== undefined
        ? snippet.greeting
        : dashboard.welcomeMessage,
  };
}

export function shouldHideOnMobile(
  hideOnMobile: boolean | undefined,
  width: number,
  breakpoint = WIDGET_MOBILE_MAX_WIDTH,
): boolean {
  return Boolean(hideOnMobile) && width <= breakpoint;
}

export function findWidgetScriptElement<
  T extends { src: string; getAttribute(name: string): string | null },
>(scripts: T[]): T | undefined {
  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i];
    if (!script) continue;
    if (
      script.getAttribute("data-app-id") ||
      script.getAttribute("data-guddesk")
    ) {
      return script;
    }
    if (
      script.src &&
      (script.src.includes("widget.js") || script.src.includes("guddesk"))
    ) {
      return script;
    }
  }
  return undefined;
}
