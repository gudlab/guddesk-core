import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  OFFLINE_MESSAGE,
  OFFLINE_NAV_MESSAGE,
  callAction,
  heldNavigationTarget,
  onBackOnline,
} from "./network";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", ...p), "utf8");

describe("inbox network errors", () => {
  it("a thrown action becomes null and one report, not an exception", async () => {
    const reports: string[] = [];
    const result = await callAction(async () => {
      throw new TypeError("Failed to fetch");
    }, (m) => reports.push(m));
    assert.equal(result, null);
    assert.deepEqual(reports, [OFFLINE_MESSAGE]);
  });

  it("a returned result passes through, including an error result", async () => {
    const reports: string[] = [];
    assert.deepEqual(await callAction(async () => ({ status: "error", message: "No" }), (m) => reports.push(m)), {
      status: "error",
      message: "No",
    });
    assert.equal(reports.length, 0);
  });

  it("onBackOnline subscribes to 'online' and unsubscribes", () => {
    const listeners = new Map<string, () => void>();
    const target = {
      addEventListener: (type: string, cb: () => void) => void listeners.set(type, cb),
      removeEventListener: (type: string) => void listeners.delete(type),
    } as unknown as Pick<Window, "addEventListener" | "removeEventListener">;
    let calls = 0;
    const stop = onBackOnline(() => calls++, target);
    listeners.get("online")?.();
    assert.equal(calls, 1);
    stop();
    assert.equal(listeners.size, 0);
    onBackOnline(() => {}, undefined)();
  });

  it("the copy has no em dashes", () => {
    assert.ok(!OFFLINE_MESSAGE.includes("\u2014"));
    assert.ok(!OFFLINE_NAV_MESSAGE.includes("\u2014"));
    for (const path of [
      ["components", "inbox", "load-error.tsx"],
      ["app", "(protected)", "workspace", "[workspaceSlug]", "inbox", "error.tsx"],
    ]) {
      assert.ok(!read(...path).includes("\u2014"), path.join("/"));
    }
  });
});

describe("inbox network wiring", () => {
  it("every inbox action in a transition goes through callAction", () => {
    for (const file of ["conversation-detail-sidebar.tsx", "availability-selector.tsx", "side-conversation-panel.tsx"]) {
      const src = read("components", "inbox", file);
      const transitions = src.match(/startTransition\(async \(\) => \{/g) ?? [];
      const guarded = src.match(/await callAction\(/g) ?? [];
      assert.ok(transitions.length > 0, file);
      assert.equal(guarded.length, transitions.length, file);
    }
  });

  it("the list and thread hooks report load errors and refetch when back online", () => {
    for (const file of ["use-conversations.ts", "use-messages.ts", "use-side-conversations.ts"]) {
      const src = read("hooks", file);
      assert.match(src, /setLoadError\(true\)/, file);
      assert.match(src, /setLoadError\(false\)/, file);
      assert.match(src, /onBackOnline\(/, file);
      assert.match(src, /loadError/, file);
    }
  });

  it("the list and thread show the error state instead of an empty inbox", () => {
    assert.match(read("components", "inbox", "conversation-list.tsx"), /<LoadError/);
    assert.match(read("components", "inbox", "message-thread.tsx"), /<LoadError/);
  });

  it("the inbox route has its own error boundary", () => {
    const src = read("app", "(protected)", "workspace", "[workspaceSlug]", "inbox", "error.tsx");
    assert.match(src, /^"use client";/);
    assert.match(src, /reset\(\)/);
    assert.match(src, /onBackOnline\(/);
  });
});

describe("offline link clicks", () => {
  const here = { origin: "https://app.example.com", pathname: "/workspace/acme/customers", search: "" };
  const click = (over: Partial<Parameters<typeof heldNavigationTarget>[0]> = {}) => ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    ...over,
  });
  const anchor = (href: string, target = "", attrs: string[] = []) => ({
    href,
    target,
    hasAttribute: (name: string) => attrs.includes(name),
  });

  it("holds a plain click on a dashboard link", () => {
    assert.equal(
      heldNavigationTarget(click(), anchor("https://app.example.com/workspace/acme/inbox?x=1#top"), here),
      "/workspace/acme/inbox?x=1#top",
    );
    assert.equal(heldNavigationTarget(click(), anchor("/workspace/acme/inbox"), here), "/workspace/acme/inbox");
  });

  it("lets everything else through", () => {
    const inbox = anchor("/workspace/acme/inbox");
    assert.equal(heldNavigationTarget(click(), null, here), null);
    assert.equal(heldNavigationTarget(click({ defaultPrevented: true }), inbox, here), null);
    assert.equal(heldNavigationTarget(click({ button: 1 }), inbox, here), null);
    for (const key of ["metaKey", "ctrlKey", "shiftKey", "altKey"] as const) {
      assert.equal(heldNavigationTarget(click({ [key]: true }), inbox, here), null, key);
    }
    assert.equal(heldNavigationTarget(click(), anchor("/workspace/acme/inbox", "_blank"), here), null);
    assert.equal(heldNavigationTarget(click(), anchor("/export.csv", "", ["download"]), here), null);
    assert.equal(heldNavigationTarget(click(), anchor("https://docs.example.org/"), here), null);
    assert.equal(heldNavigationTarget(click(), anchor("/workspace/acme/customers#notes"), here), null);
  });
});

describe("offline switching", () => {
  it("the thread and side conversations are cleared when another conversation opens", () => {
    const messages = read("hooks", "use-messages.ts");
    assert.match(messages, /generation\.next\(\);\s*setMessages\(\[\]\);/);
    assert.match(messages, /const unavailable = loadError && messages\.length === 0;/);
    assert.match(read("hooks", "use-side-conversations.ts"), /setSideConversations\(\[\]\);\s*setLoadError\(false\);\s*fetchSideConversations\(\);/);
  });

  it("the list is cleared on a filter change and ignores answers for an old filter", () => {
    const src = read("hooks", "use-conversations.ts");
    assert.match(src, /setIsLoading\(true\);\s*setConversations\(\[\]\);/);
    assert.match(src, /if \(filterKeyRef\.current !== key\) return;/);
  });

  it("the reply box is disabled while the thread couldn't load", () => {
    assert.match(read("components", "inbox", "message-thread.tsx"), /onUnavailableChange\?\.\(unavailable\)/);
    assert.match(read("components", "inbox", "inbox-layout.tsx"), /disabled=\{threadUnavailable\}/);
    const reply = read("components", "inbox", "reply-box.tsx");
    assert.match(reply, /disabled=\{disabled\}/);
    assert.match(reply, /function handleSubmit\(\) \{\s*if \(disabled\) return;/);
  });

  it("the dashboard holds offline link clicks", () => {
    assert.match(read("app", "(protected)", "layout.tsx"), /<OfflineNavGuard \/>/);
    assert.match(read("components", "layout", "offline-nav-guard.tsx"), /addEventListener\("click", onClick, true\)/);
  });
});
