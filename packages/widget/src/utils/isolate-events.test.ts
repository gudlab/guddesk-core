import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  insertAtCaret,
  ISOLATED_KEY_EVENTS,
  isolateShadowKeyboard,
  stolenPrintableKey,
} from "./isolate-events";

const srcDir = dirname(fileURLToPath(import.meta.url));
const src = (file: string) => readFileSync(join(srcDir, "..", file), "utf8");

function keyEvent(
  overrides: Partial<Parameters<typeof stolenPrintableKey>[0]> = {},
) {
  return {
    defaultPrevented: false,
    key: "c",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    isComposing: false,
    ...overrides,
  };
}

describe("stolenPrintableKey", () => {
  it("returns null when the host did not preventDefault", () => {
    assert.equal(stolenPrintableKey(keyEvent()), null);
  });

  it("returns the letter when a host shortcut prevented it", () => {
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, key: "c" })),
      "c",
    );
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, key: "C" })),
      "C",
    );
  });

  it("ignores modifiers, IME composition, and non-printable keys", () => {
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, ctrlKey: true })),
      null,
    );
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, metaKey: true })),
      null,
    );
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, altKey: true })),
      null,
    );
    assert.equal(
      stolenPrintableKey(
        keyEvent({ defaultPrevented: true, isComposing: true }),
      ),
      null,
    );
    assert.equal(
      stolenPrintableKey(keyEvent({ defaultPrevented: true, key: "Enter" })),
      null,
    );
  });
});

describe("insertAtCaret", () => {
  it("inserts at the caret and dispatches a bubbling input event", () => {
    const dispatched: Event[] = [];
    const el = {
      value: "poliy",
      selectionStart: 4,
      selectionEnd: 4,
      setSelectionRange(start: number, end: number) {
        this.selectionStart = start;
        this.selectionEnd = end;
      },
      dispatchEvent(event: Event) {
        dispatched.push(event);
        return true;
      },
    };

    insertAtCaret(el, "c");

    assert.equal(el.value, "policy");
    assert.equal(el.selectionStart, 5);
    assert.equal(el.selectionEnd, 5);
    assert.equal(dispatched.length, 1);
    assert.equal(dispatched[0]?.type, "input");
    assert.equal(dispatched[0]?.bubbles, true);
  });

  it("replaces the current selection", () => {
    const el = {
      value: "Inlude",
      selectionStart: 2,
      selectionEnd: 6,
      setSelectionRange(start: number, end: number) {
        this.selectionStart = start;
        this.selectionEnd = end;
      },
      dispatchEvent() {
        return true;
      },
    };

    insertAtCaret(el, "clude");
    assert.equal(el.value, "Include");
  });
});

describe("isolateShadowKeyboard", () => {
  it("binds a capturing restorer plus bubble stoppers for key events", () => {
    const bound: Array<{ type: string; capture: boolean }> = [];
    const root = {
      addEventListener(
        type: string,
        _fn: EventListener,
        opts?: boolean | AddEventListenerOptions,
      ) {
        bound.push({
          type,
          capture:
            opts === true ||
            (typeof opts === "object" && !!opts && opts.capture === true),
        });
      },
      removeEventListener() {},
    };

    isolateShadowKeyboard(root as unknown as ShadowRoot);
    assert.deepEqual(bound, [
      { type: "keydown", capture: true },
      { type: "keydown", capture: false },
      { type: "keyup", capture: false },
      { type: "keypress", capture: false },
    ]);
  });

  it("stops key events from leaving the shadow root on bubble", () => {
    const bubble = new Map<string, EventListener>();
    const root = {
      addEventListener(
        type: string,
        fn: EventListener,
        opts?: boolean | AddEventListenerOptions,
      ) {
        const capture =
          opts === true ||
          (typeof opts === "object" && !!opts && opts.capture === true);
        if (!capture) bubble.set(type, fn);
      },
      removeEventListener(
        type: string,
        _fn: EventListener,
        opts?: boolean | AddEventListenerOptions,
      ) {
        const capture =
          opts === true ||
          (typeof opts === "object" && !!opts && opts.capture === true);
        if (!capture) bubble.delete(type);
      },
    };

    const unbind = isolateShadowKeyboard(root as unknown as ShadowRoot);
    for (const type of ISOLATED_KEY_EVENTS) {
      let stopped = false;
      const event = {
        type,
        stopPropagation() {
          stopped = true;
        },
      } as unknown as KeyboardEvent;
      bubble.get(type)?.(event);
      assert.equal(stopped, true, type);
    }

    unbind();
    assert.equal(bubble.size, 0);
  });
});

describe("widget bootstrap", () => {
  it("attaches isolateShadowKeyboard to the visitor shadow root", () => {
    const index = src("index.ts");
    assert.match(index, /isolateShadowKeyboard\(shadowRoot\)/);
    assert.match(index, /unbindShadowKeyboard\?\.\(\)/);
  });

  it("does not treat the letter c as a widget shortcut", () => {
    const input = src("components/message-input.tsx");
    assert.equal(/\bkey\s*===\s*["']c["']/i.test(input), false);
    assert.match(input, /e\.key === "Enter" && !e\.shiftKey/);
  });
});
