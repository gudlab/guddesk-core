import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createReplyDelivery, retryToastId, type ReplyToSend, type SendResult } from "./reply-delivery";
import {
  REPLY_KEY_FINAL_HOLD_MS,
  acquireReplyKey,
  holdFinalReplyKey,
  isPendingReplyKey,
  replyKeyFor,
  storedReplyKey,
  type KeyStorage,
} from "./reply-key-store";

const T0 = Date.UTC(2026, 9, 26, 9, 0, 0);
const tick = () => new Promise((resolve) => setImmediate(resolve));

/**
 * localStorage as several tabs see it: one shared store, and per tab a view
 * whose writes reach the other tabs only when `propagate()` runs (as with
 * real cross-process localStorage, which syncs asynchronously).
 */
function sharedStorage() {
  const views: Array<Map<string, string>> = [];
  const pending: Array<() => void> = [];
  function tab(): KeyStorage {
    const own = new Map<string, string>();
    for (const [k, v] of views[0] ?? []) own.set(k, v);
    views.push(own);
    return {
      getItem: (k) => own.get(k) ?? null,
      setItem: (k, v) => {
        own.set(k, v);
        pending.push(() => views.forEach((view) => view.set(k, v)));
      },
      removeItem: (k) => {
        own.delete(k);
        pending.push(() => views.forEach((view) => view.delete(k)));
      },
    };
  }
  function propagate() {
    for (const apply of pending.splice(0)) apply();
  }
  return { tab, propagate };
}

/**
 * A stand-in for sendMessage + lib/reply-idempotency.ts: one message per
 * key, an in-flight key answers "sending", a finished key repeats its
 * stored outcome, and a temporary email failure leaves the key open for
 * an email-only retry.
 */
function fakeServer() {
  const rows = new Map<string, { messageId: string; state: "sending" | "saved" | "delivered"; emailError?: string }>();
  const state = {
    messages: [] as string[],
    emailsSent: 0,
    emailAttempts: 0,
    calls: 0,
    email: "ok" as "ok" | "temporary" | "permanent",
  };
  async function send(
    _conversationId: string,
    data: { body: string; idempotencyKey: string },
  ): Promise<SendResult> {
    state.calls++;
    await tick();
    let row = rows.get(data.idempotencyKey);
    if (row?.state === "sending") return { status: "sending" };
    if (row?.state === "delivered") {
      return { status: "success", emailError: row.emailError ?? null, emailRetryable: false, sentMessage: { id: row.messageId } };
    }
    if (!row) {
      row = { messageId: `m${state.messages.length + 1}`, state: "sending" };
      rows.set(data.idempotencyKey, row);
      await tick();
      state.messages.push(data.body);
    } else {
      row.state = "sending";
    }
    await tick();
    state.emailAttempts++;
    if (state.email === "temporary") {
      row.state = "saved";
      return { status: "success", emailError: "The email could not be sent. Press Retry email.", emailRetryable: true };
    }
    row.state = "delivered";
    if (state.email === "permanent") {
      row.emailError = "Resend rejected the from address. Don't send it again.";
      return { status: "success", emailError: row.emailError, emailRetryable: false };
    }
    state.emailsSent++;
    return { status: "success", emailError: null, emailRetryable: false, sentMessage: { id: row.messageId } };
  }
  return { send, state };
}

type ToastCall = { kind: "error" | "message" | "dismiss"; text: string; options?: Record<string, unknown> };

function client(server: ReturnType<typeof fakeServer>, storage: KeyStorage, opts: { now?: () => number; broadcast?: (id: string) => void } = {}) {
  const toasts: ToastCall[] = [];
  const delivery = createReplyDelivery({
    send: server.send,
    storage: () => storage,
    toast: {
      error: (text, options) => void toasts.push({ kind: "error", text, options: options as Record<string, unknown> }),
      message: (text) => void toasts.push({ kind: "message", text }),
      dismiss: (id) => void toasts.push({ kind: "dismiss", text: id }),
    },
    publish: () => {},
    broadcast: opts.broadcast,
    now: opts.now ?? (() => T0),
    acquireKey: (s, r, o) => acquireReplyKey(s, r, { ...o, settleMs: 0, locks: null }),
  });
  /** The Retry email action of the newest notice that has one. */
  function retryAction(): () => void {
    const withAction = toasts.filter((t) => t.options?.action).pop();
    assert.ok(withAction, "a Retry email notice is shown");
    return (withAction.options!.action as { onClick: () => void }).onClick;
  }
  return { ...delivery, toasts, retryAction };
}

const reply: ReplyToSend = { conversationId: "c1", type: "AGENT", body: "Thanks, fixed now." };

function memoryStorage(): KeyStorage {
  const map = new Map<string, string>();
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

describe("Retry email keeps its key (M1)", () => {
  it("a stale Retry email after the reply was finished by another send does nothing", async () => {
    const server = fakeServer();
    const storage = memoryStorage();
    const ui = client(server, storage);

    server.state.email = "temporary";
    assert.equal(await ui.deliverReply(reply), "posted");
    const staleRetry = ui.retryAction();
    const key = storedReplyKey(storage, reply, T0);
    assert.ok(key);

    // Resend is back; the agent retypes the same text and presses Enter.
    server.state.email = "ok";
    assert.equal(await ui.deliverReply(reply), "posted");
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
    assert.equal(storedReplyKey(storage, reply, T0), null, "the finished reply's key is forgotten");
    assert.ok(ui.toasts.some((t) => t.kind === "dismiss" && t.text === retryToastId(key!)), "its notice is dismissed");

    // The old notice's Retry email is clicked anyway.
    const calls = server.state.calls;
    staleRetry();
    await tick();
    await tick();
    assert.equal(server.state.calls, calls, "no request is sent");
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1], "no 2nd message, no 2nd email");
    assert.equal(storedReplyKey(storage, reply, T0), null, "no new key is minted");
  });

  it("Retry email sends with the exact key it was given and finishes the existing message", async () => {
    const server = fakeServer();
    const storage = memoryStorage();
    const ui = client(server, storage);
    server.state.email = "temporary";
    await ui.deliverReply(reply);
    const key = storedReplyKey(storage, reply, T0)!;

    server.state.email = "ok";
    assert.equal(await ui.retryEmail(reply, key), "posted");
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
    // A second click on the same (now stale) notice is a no-op.
    assert.equal(await ui.retryEmail(reply, key), "stale");
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
  });

  it("Retry email with a key that is no longer the reply's key does nothing", async () => {
    const server = fakeServer();
    const storage = memoryStorage();
    const ui = client(server, storage);
    const newer = replyKeyFor(storage, reply, T0);
    assert.equal(await ui.retryEmail(reply, "an-older-key-1234"), "stale");
    assert.equal(server.state.calls, 0);
    assert.equal(storedReplyKey(storage, reply, T0), newer, "the newer key is left alone");
  });

  it("a stale notice in one tab does nothing after another tab finished the reply", async () => {
    const server = fakeServer();
    const shared = sharedStorage();
    const broadcasts: string[] = [];
    const tabA = client(server, shared.tab(), { broadcast: (id) => broadcasts.push(id) });
    const tabB = client(server, shared.tab(), { broadcast: (id) => broadcasts.push(id) });

    server.state.email = "temporary";
    await tabA.deliverReply(reply);
    shared.propagate();
    const staleRetry = tabA.retryAction();

    server.state.email = "ok";
    await tabB.deliverReply(reply);
    shared.propagate();
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
    assert.equal(broadcasts.length, 1, "tab B tells the other tabs to close the notice");

    const calls = server.state.calls;
    staleRetry();
    await tick();
    await tick();
    assert.equal(server.state.calls, calls);
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
  });
});

describe("permanent email failure keeps the key (M2 step 3)", () => {
  it("the same text again repeats the stored outcome: no 2nd message, no 2nd email attempt", async () => {
    const server = fakeServer();
    const storage = memoryStorage();
    let now = T0;
    const ui = client(server, storage, { now: () => now });

    server.state.email = "permanent";
    assert.equal(await ui.deliverReply(reply), "posted");
    assert.ok(!ui.toasts.some((t) => t.options?.action), "no Retry email button");
    assert.equal(server.state.emailAttempts, 1);

    now = T0 + 60_000;
    assert.equal(await ui.deliverReply(reply), "posted");
    assert.deepEqual([server.state.messages.length, server.state.emailAttempts], [1, 1]);
    assert.equal(ui.toasts.filter((t) => t.kind === "error" && /from address/.test(t.text)).length, 2, "same notice again");
  });

  it("the held key runs out after 24 hours, and edited text is a new reply", async () => {
    const storage = memoryStorage();
    const key = replyKeyFor(storage, reply, T0);
    holdFinalReplyKey(storage, reply, key, T0);
    assert.equal(storedReplyKey(storage, reply, T0 + REPLY_KEY_FINAL_HOLD_MS - 1), key);
    assert.equal(isPendingReplyKey(storage, reply, key, T0), false, "a final key can't be retried");
    assert.equal(storedReplyKey(storage, reply, T0 + REPLY_KEY_FINAL_HOLD_MS), null);
    assert.equal(storedReplyKey(storage, { ...reply, body: "Thanks, fixed now!" }, T0), null);
  });
});

describe("two tabs share one key (M2 step 4)", () => {
  it("two tabs that mint a key at the same moment settle on the same key", async () => {
    const shared = sharedStorage();
    const a = shared.tab();
    const b = shared.tab();
    const sleep = async () => {
      await tick();
      shared.propagate();
    };
    const [ka, kb] = await Promise.all([
      acquireReplyKey(a, reply, { now: () => T0, sleep, locks: null }),
      acquireReplyKey(b, reply, { now: () => T0, sleep, locks: null }),
    ]);
    assert.equal(ka, kb);
  });

  it("a second tab sending later reuses the first tab's key", async () => {
    const shared = sharedStorage();
    const a = shared.tab();
    const key = await acquireReplyKey(a, reply, { now: () => T0, settleMs: 0, locks: null });
    shared.propagate();
    const b = shared.tab();
    assert.equal(await acquireReplyKey(b, reply, { now: () => T0 + 800, settleMs: 0, locks: null }), key);
  });

  it("two tabs sending the same text: 1 message, 1 email", async () => {
    const server = fakeServer();
    const shared = sharedStorage();
    const tabs = [shared.tab(), shared.tab()].map((storage) =>
      createReplyDelivery({
        send: server.send,
        storage: () => storage,
        toast: { error: () => {}, message: () => {}, dismiss: () => {} },
        publish: () => {},
        now: () => T0,
        acquireKey: (s, r, o) =>
          acquireReplyKey(s, r, {
            ...o,
            locks: null,
            sleep: async () => {
              await tick();
              shared.propagate();
            },
          }),
      }),
    );
    const outcomes = await Promise.all(tabs.map((tab) => tab.deliverReply(reply)));
    assert.deepEqual([...outcomes].sort(), ["kept", "posted"], "one posts, the other is told it is still sending");
    assert.deepEqual([server.state.messages.length, server.state.emailsSent], [1, 1]);
  });

  it("uses a Web Lock per reply when the browser has one", async () => {
    const names: string[] = [];
    const locks = {
      request: async <T>(name: string, callback: () => Promise<T>) => {
        names.push(name);
        return callback();
      },
    };
    const storage = memoryStorage();
    const key = await acquireReplyKey(storage, reply, { now: () => T0, settleMs: 0, locks });
    assert.equal(names.length, 1);
    assert.match(names[0], /^guddesk:reply-key:c1:AGENT:/);
    assert.equal(storedReplyKey(storage, reply, T0), key);
  });

  it("the browser key store is localStorage, not sessionStorage", async () => {
    const { browserKeyStorage } = await import("./reply-key-store");
    const local = memoryStorage();
    const session = memoryStorage();
    const g = globalThis as { localStorage?: KeyStorage; sessionStorage?: KeyStorage };
    g.localStorage = local;
    g.sessionStorage = session;
    try {
      assert.equal(browserKeyStorage(), local);
    } finally {
      delete g.localStorage;
      delete g.sessionStorage;
    }
  });
});

describe("email threading on a retry", () => {
  it("builds headers only from messages before this one, never from itself", async () => {
    const { buildReplyHeaders } = await import("./channels/email/threading");
    const created = new Date(T0);
    const rows = [
      { id: "m1", createdAt: new Date(T0 - 2000), emailMessageId: "<msg-m1@mail.guddesk.com>" },
      { id: "m2", createdAt: created, emailMessageId: "<msg-m2@mail.guddesk.com>" },
      { id: "m3", createdAt: new Date(T0 + 1000), emailMessageId: "<msg-m3@mail.guddesk.com>" },
    ];
    const db = {
      message: {
        async findMany(args: { where: { id?: { not: string }; createdAt?: { lt: Date } } }) {
          return rows
            .filter((r) => !args.where.id || r.id !== args.where.id.not)
            .filter((r) => !args.where.createdAt || r.createdAt < args.where.createdAt.lt)
            .map((r) => ({ emailMessageId: r.emailMessageId }));
        },
      },
    };
    const first = await buildReplyHeaders("c1", { id: "m2", createdAt: created }, db as never);
    assert.equal(first.inReplyTo, "<msg-m1@mail.guddesk.com>");
    assert.ok(!first.references?.includes("msg-m2"), "References doesn't end with its own Message-ID");
    const retry = await buildReplyHeaders("c1", { id: "m2", createdAt: created }, db as never);
    assert.deepEqual(retry, first, "a retry sends the same headers as the first attempt");
  });
});
