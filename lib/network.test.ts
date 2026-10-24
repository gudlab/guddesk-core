import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { OFFLINE_MESSAGE, callAction, onBackOnline } from "./network";

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
