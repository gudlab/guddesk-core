import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";

import {
  CONVERSATION_LIST_POLL_MS,
  THREAD_POLL_MS,
  THREAD_POLL_OVERLAP_MS,
  MESSAGES_AFTER_TAKE,
  REALTIME_CONNECT_TIMEOUT_MS,
  appendConversationPage,
  createRequestGeneration,
  mergeConversationPage,
  mergeMessagesById,
  messagesAfterParam,
  messagesQueryArgs,
  cursorAfterPage,
  messagesPollQuery,
  type MessagesPollCursor,
  parseMessagesAfter,
  startPollingFallback,
  type RealtimeConnection,
  type VisibilitySource,
} from "./inbox-polling";
import { publishLocalMessage, subscribeLocalMessages } from "./local-messages";

function fakeVisibility(initial = true) {
  let visible = initial;
  const listeners = new Set<() => void>();
  const source: VisibilitySource = {
    isVisible: () => visible,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    source,
    listenerCount: () => listeners.size,
    set(next: boolean) {
      visible = next;
      for (const listener of Array.from(listeners)) listener();
    },
  };
}

/** A stand-in for pusher-js `client.connection`. */
function fakeConnection(initial = "connecting") {
  let state = initial;
  const listeners = new Set<(s: { previous: string; current: string }) => void>();
  const connection: RealtimeConnection = {
    get state() {
      return state;
    },
    bind(_event, callback) {
      listeners.add(callback);
    },
    unbind(_event, callback) {
      listeners.delete(callback);
    },
  };
  return {
    connection,
    listenerCount: () => listeners.size,
    set(next: string) {
      const previous = state;
      state = next;
      for (const listener of Array.from(listeners)) listener({ previous, current: next });
    },
  };
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe("startPollingFallback", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setInterval", "setTimeout"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  it("uses a 10s list interval and a 4s thread interval", () => {
    assert.equal(CONVERSATION_LIST_POLL_MS, 10_000);
    assert.equal(THREAD_POLL_MS, 4_000);
  });

  it("does nothing while Pusher is connected", () => {
    const poll = mock.fn();
    const visibility = fakeVisibility();
    const pusher = fakeConnection("connected");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: visibility.source,
    });
    assert.equal(handle.polling, false);
    mock.timers.tick(60_000);
    assert.equal(poll.mock.callCount(), 0);
    visibility.set(false);
    visibility.set(true);
    assert.equal(poll.mock.callCount(), 0, "visibility changes don't poll either");
    handle.stop();
    assert.equal(pusher.listenerCount(), 0);
  });

  it("polls on every interval when Pusher is missing", async () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility();
    const handle = startPollingFallback({
      intervalMs: CONVERSATION_LIST_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    assert.ok(handle?.active);
    assert.equal(poll.mock.callCount(), 0, "no poll before the first interval");
    for (let i = 1; i <= 3; i++) {
      mock.timers.tick(CONVERSATION_LIST_POLL_MS);
      await flush();
      assert.equal(poll.mock.callCount(), i);
    }
    mock.timers.tick(CONVERSATION_LIST_POLL_MS - 1);
    await flush();
    assert.equal(poll.mock.callCount(), 3);
    handle?.stop();
  });

  it("pauses while hidden and polls at once when visible again", async () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility();
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    mock.timers.tick(THREAD_POLL_MS);
    await flush();
    assert.equal(poll.mock.callCount(), 1);

    visibility.set(false);
    assert.equal(handle?.active, false);
    mock.timers.tick(THREAD_POLL_MS * 10);
    await flush();
    assert.equal(poll.mock.callCount(), 1, "no polls while hidden");

    visibility.set(true);
    assert.equal(poll.mock.callCount(), 2, "catch-up poll on becoming visible");
    assert.equal(handle?.active, true);
    await flush();
    mock.timers.tick(THREAD_POLL_MS);
    await flush();
    assert.equal(poll.mock.callCount(), 3);
    handle?.stop();
  });

  it("waits for the page to be visible before arming", async () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility(false);
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    assert.equal(handle?.active, false);
    mock.timers.tick(THREAD_POLL_MS * 5);
    assert.equal(poll.mock.callCount(), 0);
    visibility.set(true);
    assert.equal(poll.mock.callCount(), 1);
    handle?.stop();
  });

  it("stop() clears the timer and the visibility listener", async () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility();
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    assert.equal(visibility.listenerCount(), 1);
    handle?.stop();
    assert.equal(handle?.active, false);
    assert.equal(visibility.listenerCount(), 0);
    mock.timers.tick(THREAD_POLL_MS * 5);
    visibility.set(true);
    await flush();
    assert.equal(poll.mock.callCount(), 0);
  });

  it("skips a tick while the previous poll is still running", async () => {
    let release: () => void = () => {};
    const poll = mock.fn(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const visibility = fakeVisibility();
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    mock.timers.tick(THREAD_POLL_MS);
    mock.timers.tick(THREAD_POLL_MS);
    mock.timers.tick(THREAD_POLL_MS);
    assert.equal(poll.mock.callCount(), 1);
    release();
    await flush();
    mock.timers.tick(THREAD_POLL_MS);
    assert.equal(poll.mock.callCount(), 2);
    release();
    handle?.stop();
  });

  it("keeps polling after a failed poll", async () => {
    const poll = mock.fn(async () => {
      throw new Error("network");
    });
    const visibility = fakeVisibility();
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: null,
      visibility: visibility.source,
    });
    mock.timers.tick(THREAD_POLL_MS);
    await flush();
    mock.timers.tick(THREAD_POLL_MS);
    await flush();
    assert.equal(poll.mock.callCount(), 2);
    handle?.stop();
  });
});

type Msg = { id: string; createdAt: string; body: string };
const msg = (id: string, second: number, body = id): Msg => ({
  id,
  createdAt: new Date(Date.UTC(2026, 9, 20, 8, 0, second)).toISOString(),
  body,
});

describe("mergeMessagesById", () => {
  it("returns the same array when nothing is new, so the thread doesn't re-render", () => {
    const prev = [msg("a", 1), msg("b", 2)];
    assert.equal(mergeMessagesById(prev, []), prev);
    assert.equal(mergeMessagesById(prev, [msg("a", 1), msg("b", 2)]), prev);
  });

  it("appends only unseen ids and keeps createdAt order", () => {
    const prev = [msg("a", 1), msg("c", 3)];
    const next = mergeMessagesById(prev, [msg("c", 3), msg("b", 2), msg("b", 2), msg("d", 4)]);
    assert.deepEqual(
      next.map((m) => m.id),
      ["a", "b", "c", "d"],
    );
  });
});

describe("messagesAfterParam", () => {
  it("is null for an empty thread", () => {
    assert.equal(messagesAfterParam([]), null);
  });

  it("is the newest createdAt minus the overlap window", () => {
    const after = messagesAfterParam([msg("a", 30), msg("b", 50), msg("c", 40)]);
    assert.equal(
      after,
      new Date(Date.parse(msg("b", 50).createdAt) - THREAD_POLL_OVERLAP_MS).toISOString(),
    );
  });
});

describe("own reply append", () => {
  it("shows the sent reply once, even when Pusher and a poll deliver it again", () => {
    let thread: Msg[] = [msg("v1", 1)];
    const unsubscribe = subscribeLocalMessages<Msg>("conv-1", (m) => {
      thread = mergeMessagesById(thread, [m]);
    });
    const otherConversation = mock.fn();
    const unsubscribeOther = subscribeLocalMessages("conv-2", otherConversation);

    const reply = msg("a1", 5, "Thanks, looking now");
    publishLocalMessage("conv-1", reply);
    assert.deepEqual(
      thread.map((m) => m.id),
      ["v1", "a1"],
    );
    assert.equal(otherConversation.mock.callCount(), 0);

    // Pusher message:created for the same message
    thread = mergeMessagesById(thread, [{ ...reply }]);
    // Incremental poll that overlaps it
    thread = mergeMessagesById(thread, [msg("v1", 1), { ...reply }, msg("v2", 6)]);
    assert.deepEqual(
      thread.map((m) => m.id),
      ["v1", "a1", "v2"],
    );

    unsubscribe();
    publishLocalMessage("conv-1", msg("a2", 7));
    assert.equal(thread.length, 3, "no delivery after unsubscribe");
    unsubscribeOther();
  });
});

describe("mergeConversationPage", () => {
  type Conv = { id: string; preview: string };
  const conv = (id: string, preview = id): Conv => ({ id, preview });

  it("returns the same array when the first page is unchanged", () => {
    const prev = [conv("a"), conv("b")];
    assert.equal(mergeConversationPage(prev, [conv("a"), conv("b")], 25), prev);
  });

  it("applies new first-page data", () => {
    const prev = [conv("a"), conv("b")];
    const next = mergeConversationPage(prev, [conv("b", "new reply"), conv("a")], 25);
    assert.notEqual(next, prev);
    assert.deepEqual(next, [conv("b", "new reply"), conv("a")]);
  });

  it("keeps rows loaded beyond the first page", () => {
    const prev = [conv("a"), conv("b"), conv("c"), conv("d")];
    const next = mergeConversationPage(prev, [conv("d", "moved up"), conv("a")], 2);
    // b fell off the first page because d moved up. It stays, now on page 2.
    assert.deepEqual(
      next.map((c) => c.id),
      ["d", "a", "b", "c"],
    );
  });
});

describe("mergeConversationPage after load more", () => {
  type Conv = { id: string; preview: string };
  const conv = (id: string, preview = id): Conv => ({ id, preview });
  const ids = (list: Conv[]) => list.map((c) => c.id);

  it("keeps every row when new conversations arrive at the top", () => {
    // Page size 3, agent loaded two pages: c1..c6.
    const prev = ["c1", "c2", "c3", "c4", "c5", "c6"].map((id) => conv(id));
    // Two new conversations arrive. The server's first page is now n1, n2, c1.
    const next = mergeConversationPage(prev, [conv("n1"), conv("n2"), conv("c1")], 3);
    assert.deepEqual(ids(next), ["n1", "n2", "c1", "c2", "c3", "c4", "c5", "c6"]);
  });

  it("then skips the rows a stale load-more cursor returns again", () => {
    const list = ["n1", "n2", "c1", "c2", "c3", "c4"].map((id) => conv(id));
    const next = appendConversationPage(list, [conv("c4"), conv("c5"), conv("c6")]);
    assert.deepEqual(ids(next), ["n1", "n2", "c1", "c2", "c3", "c4", "c5", "c6"]);
    assert.equal(appendConversationPage(list, [conv("c3")]), list);
  });

  it("drops a first-page row that left the filter when nothing new arrived", () => {
    const prev = ["c1", "c2", "c3", "c4"].map((id) => conv(id));
    // c2 was closed: the server's first page is c1, c3, c4.
    const next = mergeConversationPage(prev, [conv("c1"), conv("c3"), conv("c4")], 3);
    assert.deepEqual(ids(next), ["c1", "c3", "c4"]);
  });

  it("only uses the first page when nothing past it was loaded", () => {
    const prev = ["c1", "c2", "c3"].map((id) => conv(id));
    const next = mergeConversationPage(prev, [conv("n1"), conv("c1"), conv("c2")], 3);
    assert.deepEqual(ids(next), ["n1", "c1", "c2"]);
  });
});

describe("polling when Pusher is configured but not connected", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setInterval", "setTimeout"] });
  });
  afterEach(() => {
    mock.timers.reset();
  });

  it("waits 8s like the widget", () => {
    assert.equal(REALTIME_CONNECT_TIMEOUT_MS, 8_000);
  });

  it("starts polling after 8s with no connection, and stops once it connects", async () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility();
    const pusher = fakeConnection("connecting");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: visibility.source,
    });
    mock.timers.tick(REALTIME_CONNECT_TIMEOUT_MS - 1);
    assert.equal(poll.mock.callCount(), 0);
    assert.equal(handle.polling, false);

    mock.timers.tick(1);
    assert.equal(poll.mock.callCount(), 1, "polls at once when giving up on Pusher");
    assert.equal(handle.active, true);
    await flush();
    mock.timers.tick(THREAD_POLL_MS);
    await flush();
    assert.equal(poll.mock.callCount(), 2);

    pusher.set("connected");
    assert.equal(handle.polling, false);
    assert.equal(handle.active, false);
    mock.timers.tick(THREAD_POLL_MS * 10);
    await flush();
    assert.equal(poll.mock.callCount(), 2, "no polls after Pusher connects");
    handle.stop();
  });

  it("never polls when Pusher connects within 8s", () => {
    const poll = mock.fn(async () => {});
    const pusher = fakeConnection("connecting");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: fakeVisibility().source,
    });
    mock.timers.tick(3_000);
    pusher.set("connected");
    mock.timers.tick(60_000);
    assert.equal(poll.mock.callCount(), 0);
    handle.stop();
  });

  for (const state of ["failed", "unavailable"]) {
    it(`polls at once on "${state}" without waiting for the timeout`, async () => {
      const poll = mock.fn(async () => {});
      const pusher = fakeConnection("connecting");
      const handle = startPollingFallback({
        intervalMs: THREAD_POLL_MS,
        poll,
        realtime: pusher.connection,
        visibility: fakeVisibility().source,
      });
      mock.timers.tick(1_000);
      pusher.set(state);
      assert.equal(poll.mock.callCount(), 1);
      await flush();
      mock.timers.tick(THREAD_POLL_MS);
      assert.equal(poll.mock.callCount(), 2);
      handle.stop();
    });
  }

  it("polls straight away when the connection is already unavailable", () => {
    const poll = mock.fn(async () => {});
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: fakeConnection("unavailable").connection,
      visibility: fakeVisibility().source,
    });
    assert.equal(poll.mock.callCount(), 1);
    handle.stop();
  });

  it("goes back to polling if a connected Pusher drops to unavailable", () => {
    const poll = mock.fn(async () => {});
    const pusher = fakeConnection("connected");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: fakeVisibility().source,
    });
    pusher.set("connecting");
    assert.equal(handle.polling, false, "a brief reconnect alone doesn't poll");
    pusher.set("unavailable");
    assert.equal(handle.polling, true);
    assert.equal(poll.mock.callCount(), 1);
    handle.stop();
  });

  it("stop() clears the connect timer and the state listener", () => {
    const poll = mock.fn(async () => {});
    const pusher = fakeConnection("connecting");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: fakeVisibility().source,
    });
    assert.equal(pusher.listenerCount(), 1);
    handle.stop();
    assert.equal(pusher.listenerCount(), 0);
    mock.timers.tick(60_000);
    pusher.set("failed");
    assert.equal(poll.mock.callCount(), 0);
  });

  it("doesn't poll a hidden tab when Pusher fails, and catches up when shown", () => {
    const poll = mock.fn(async () => {});
    const visibility = fakeVisibility(false);
    const pusher = fakeConnection("connecting");
    const handle = startPollingFallback({
      intervalMs: THREAD_POLL_MS,
      poll,
      realtime: pusher.connection,
      visibility: visibility.source,
    });
    pusher.set("failed");
    assert.equal(poll.mock.callCount(), 0);
    visibility.set(true);
    assert.equal(poll.mock.callCount(), 1);
    handle.stop();
  });
});

describe("thread request generations", () => {
  it("drops a slow response from an earlier visit to the same conversation", () => {
    const generation = createRequestGeneration();
    let open = "A";
    let thread: string[] = [];
    // Each request remembers the conversation and generation it started in.
    const start = () => ({ id: open, gen: generation.current() });
    const apply = (req: { id: string; gen: number }, data: string[]) => {
      if (req.id === open && generation.isCurrent(req.gen)) thread = data;
    };

    generation.next(); // open A
    const slowPollFromFirstVisit = start();
    open = "B";
    generation.next();
    apply(start(), ["b1"]);
    open = "A";
    generation.next();
    apply(start(), ["a1", "a2", "a3"]);

    // The first visit's poll finally returns with older data.
    apply(slowPollFromFirstVisit, ["a1"]);
    assert.deepEqual(thread, ["a1", "a2", "a3"]);
    assert.equal(generation.isCurrent(slowPollFromFirstVisit.gen), false);
  });
});

describe("messages route ?after=", () => {
  // Postgres timestamp range: 4713 BC to 294276 AD.
  const PG_MIN = Date.UTC(-4713, 0, 1);
  // 294276 AD is past the largest JavaScript date, so use that instead.
  const PG_MAX = 8.64e15;

  for (const value of ["-271821-04-20T00:00:00.000Z", "-010000-01-01T00:00:00Z"]) {
    it(`clamps ${value} into a range Postgres accepts`, () => {
      assert.ok(!Number.isNaN(new Date(value).getTime()), "valid in JavaScript");
      const after = parseMessagesAfter(value);
      assert.ok(after);
      assert.equal(after.toISOString(), "1970-01-01T00:00:00.000Z");
      const args = messagesQueryArgs("conv_1", value);
      assert.deepEqual(args.where, { conversationId: "conv_1", createdAt: { gte: after } });
      const gte = (args.where as { createdAt: { gte: Date } }).createdAt.gte.getTime();
      assert.ok(gte >= PG_MIN && gte <= PG_MAX);
      assert.equal(args.take, MESSAGES_AFTER_TAKE);
    });
  }

  it("clamps the far future too", () => {
    assert.equal(
      parseMessagesAfter("+275760-09-13T00:00:00.000Z")?.toISOString(),
      "9999-12-31T23:59:59.999Z",
    );
  });

  it("passes a normal poll value through unchanged", () => {
    const value = "2026-10-20T08:00:00.000Z";
    assert.equal(parseMessagesAfter(value)?.toISOString(), value);
  });

  it("returns the full, uncapped thread without a usable after", () => {
    for (const value of [null, "", "not-a-date", "+300000-01-01T00:00:00Z"]) {
      assert.equal(parseMessagesAfter(value), null, String(value));
      const args = messagesQueryArgs("conv_1", value);
      assert.deepEqual(args.where, { conversationId: "conv_1" });
      assert.equal(args.take, undefined);
    }
  });

  it("caps an incremental poll at a sane size, ordered by createdAt then id", () => {
    assert.equal(MESSAGES_AFTER_TAKE, 200);
    assert.deepEqual(messagesQueryArgs("conv_1", "2026-10-20T08:00:00.000Z").orderBy, [
      { createdAt: "asc" },
      { id: "asc" },
    ]);
  });

  it("continues strictly after (createdAt, id) when afterId is sent", () => {
    const value = "2026-10-20T08:00:00.000Z";
    const args = messagesQueryArgs("conv_1", value, "msg_200");
    assert.deepEqual(args.where, {
      conversationId: "conv_1",
      OR: [
        { createdAt: { gt: new Date(value) } },
        { createdAt: new Date(value), id: { gt: "msg_200" } },
      ],
    });
    assert.equal(args.take, MESSAGES_AFTER_TAKE);
  });

  it("ignores afterId without a usable after, or when it's implausible", () => {
    assert.deepEqual(messagesQueryArgs("conv_1", "garbage", "msg_1").where, { conversationId: "conv_1" });
    assert.deepEqual(messagesQueryArgs("conv_1", "2026-10-20T08:00:00.000Z", "x".repeat(200)).where, {
      conversationId: "conv_1",
      createdAt: { gte: new Date("2026-10-20T08:00:00.000Z") },
    });
  });
});

describe("thread polling after a burst of messages", () => {
  type Row = { id: string; conversationId: string; createdAt: Date };
  type Item = { id: string; createdAt: string };

  /**
   * Runs messagesQueryArgs against an in-memory table the way Postgres
   * would: the where clause (gte, gt, OR with an id tie-break), the
   * (createdAt, id) order and the take.
   */
  function serve(rows: Row[], query: string): Item[] {
    const params = new URLSearchParams(query);
    const args = messagesQueryArgs("conv_1", params.get("after"), params.get("afterId"));
    const where = args.where as {
      conversationId: string;
      createdAt?: { gte: Date };
      OR?: [{ createdAt: { gt: Date } }, { createdAt: Date; id: { gt: string } }];
    };
    const matches = (r: Row) => {
      if (r.conversationId !== where.conversationId) return false;
      if (where.createdAt) return r.createdAt >= where.createdAt.gte;
      if (where.OR) {
        const [later, tie] = where.OR;
        return (
          r.createdAt > later.createdAt.gt ||
          (r.createdAt.getTime() === tie.createdAt.getTime() && r.id > tie.id.gt)
        );
      }
      return true;
    };
    const sorted = rows
      .filter(matches)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const page = args.take === undefined ? sorted : sorted.slice(0, args.take);
    return page.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString() }));
  }

  /** The useMessages poll loop: query, merge, keep the cursor. */
  function poll(rows: Row[], state: { thread: Item[]; cursor: MessagesPollCursor | null }, useCursor = true) {
    const query = messagesPollQuery(state.thread, useCursor ? state.cursor : null);
    assert.ok(query);
    const page = serve(rows, query);
    state.cursor = cursorAfterPage(page);
    state.thread = mergeMessagesById(state.thread, page);
  }

  const base = Date.UTC(2026, 9, 20, 8, 0, 0);
  const id = (n: number) => `msg_${String(n).padStart(4, "0")}`;
  const row = (n: number, ms: number): Row => ({ id: id(n), conversationId: "conv_1", createdAt: new Date(ms) });

  function setup(burst: (n: number) => number) {
    const history = Array.from({ length: 5 }, (_, n) => row(n, base + n * 1_000));
    const state = { thread: serve(history, ""), cursor: null as MessagesPollCursor | null };
    // 300 messages land within 10s of the newest one we hold.
    const rows = [...history, ...Array.from({ length: 300 }, (_, i) => row(100 + i, burst(i)))];
    return { rows, state };
  }

  for (const [label, burst] of [
    ["spread over 3 seconds", (i: number) => base + 5_000 + i * 10],
    ["all with the same createdAt", () => base + 5_000],
  ] as const) {
    it(`gets all 300 of a burst ${label} within a few polls`, () => {
      const { rows, state } = setup(burst);
      assert.equal(state.thread.length, 5);
      let polls = 0;
      while (state.thread.length < 305 && polls < 10) {
        poll(rows, state);
        polls += 1;
      }
      assert.equal(state.thread.length, 305);
      assert.ok(polls <= 3, `took ${polls} polls`);
      assert.equal(new Set(state.thread.map((m) => m.id)).size, 305, "no duplicates");
      // Later polls add nothing and repeat nothing.
      for (let i = 0; i < 5; i++) poll(rows, state);
      assert.equal(state.thread.length, 305);
    });
  }

  it("used to stall at 200 without the cursor (what QA saw)", () => {
    const { rows, state } = setup((i) => base + 5_000 + i * 10);
    for (let i = 0; i < 19; i++) poll(rows, state, false);
    // Every poll asked for the same window and got the same first 200 rows
    // (the 5 older messages plus 195 of the burst).
    assert.equal(state.thread.length, 200);
  });

  it("only sets a cursor for a full page", () => {
    const full = Array.from({ length: MESSAGES_AFTER_TAKE }, (_, n) => ({ id: id(n), createdAt: new Date(base + n).toISOString() }));
    assert.deepEqual(cursorAfterPage(full), {
      after: new Date(base + MESSAGES_AFTER_TAKE - 1).toISOString(),
      afterId: id(MESSAGES_AFTER_TAKE - 1),
    });
    assert.equal(cursorAfterPage(full.slice(1)), null);
    assert.equal(cursorAfterPage([]), null);
  });
});
