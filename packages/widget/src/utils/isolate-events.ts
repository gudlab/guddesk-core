/**
 * Keep widget keystrokes inside the shadow tree.
 *
 * Host-page shortcuts (Vercel Preview Comment = "c", site "compose"
 * hotkeys, etc.) listen on document and skip firing when
 * event.target.closest("input,textarea") is set. Events that originate
 * in an open shadow root are retargeted to the host div, so that guard
 * fails and the handler calls preventDefault. The letter never appears.
 *
 * stopPropagation on the shadow root stops bubble-phase host listeners
 * before they run, so the browser can insert the key as usual.
 * Capture-phase host listeners have already run by then; if they
 * preventDefault on a printable key, insert it into the focused field.
 */

export type CaretInput = {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  setSelectionRange: (start: number, end: number) => void;
  dispatchEvent: (event: Event) => boolean;
};

export function stolenPrintableKey(event: {
  defaultPrevented: boolean;
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  isComposing: boolean;
}): string | null {
  if (!event.defaultPrevented) return null;
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
    return null;
  }
  if (event.key.length !== 1) return null;
  return event.key;
}

export function insertAtCaret(el: CaretInput, text: string): void {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  const caret = start + text.length;
  try {
    el.setSelectionRange(caret, caret);
  } catch {
    // Some input types (email, number) throw in older engines.
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function isCaretInput(
  target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

export const ISOLATED_KEY_EVENTS = ["keydown", "keyup", "keypress"] as const;

export function isolateShadowKeyboard(
  root: Pick<ShadowRoot, "addEventListener" | "removeEventListener">,
): () => void {
  const restoreStolen = (event: Event) => {
    const keyEvent = event as KeyboardEvent;
    const stolen = stolenPrintableKey(keyEvent);
    if (!stolen || !isCaretInput(keyEvent.target)) return;
    insertAtCaret(keyEvent.target, stolen);
  };
  const stop = (event: Event) => {
    event.stopPropagation();
  };

  // Capture: host capture listeners (if any) have already run. Restore
  // a printable key they preventDefault'd before the event is cancelled
  // at the input. Do not stopPropagation here or the input never sees it.
  root.addEventListener("keydown", restoreStolen, true);
  // Bubble: keep the event from reaching document listeners that treat
  // the retargeted host as a non-input and steal the next keys too.
  for (const type of ISOLATED_KEY_EVENTS) {
    root.addEventListener(type, stop);
  }

  return () => {
    root.removeEventListener("keydown", restoreStolen, true);
    for (const type of ISOLATED_KEY_EVENTS) {
      root.removeEventListener(type, stop);
    }
  };
}
