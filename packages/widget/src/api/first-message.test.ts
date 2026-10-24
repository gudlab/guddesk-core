import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { initClient, sendMessage } from "./client";
import {
  createFirstMessageQueue,
  VISITOR_NOT_FOUND,
  WidgetRequestError,
  withStaleTokenRetry,
} from "./first-message";
import { conversationId, isLoading, messages, visitorId, visitorToken } from "../stores/state";

/** A fake widget API: counts visitors and conversations like the real routes. */
function fakeServer(opts: { deletedVisitors?: string[] } = {}) {
  const visitors = new Set<string>(["v_existing"]);
  for (const id of opts.deletedVisitors ?? []) visitors.delete(id);
  const conversations: string[] = [];
  const posted: string[] = [];
  const calls: string[] = [];
  let seq = 0;
  const gates: Array<() => void> = [];

  const fetchImpl = async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname;
    calls.push(`${init.method ?? "GET"} ${path}`);
    const body = init.body ? JSON.parse(String(init.body)) : {};
    // Hold every response until the test releases it, so sends overlap.
    await new Promise<void>((resolve) => gates.push(resolve));

    if (path === "/api/widget/conversations") {
      let visitor: string;
      if (body.visitorToken) {
        visitor = String(body.visitorToken).replace(/^tok_/, "");
        if (!visitors.has(visitor)) {
          return Response.json({ error: "Visitor not found", code: VISITOR_NOT_FOUND }, { status: 401 });
        }
      } else {
        visitor = `v_${++seq}`;
        visitors.add(visitor);
      }
      const conv = `c_${conversations.length + 1}`;
      conversations.push(conv);
      return Response.json({
        conversationId: conv,
        visitorId: visitor,
        visitorToken: `tok_${visitor}`,
        messages: [{ id: `m_${conv}`, body: body.message, type: "VISITOR", senderName: null, createdAt: "2026-10-24T00:00:00Z" }],
      });
    }
    const m = /^\/api\/widget\/conversations\/([^/]+)\/messages$/.exec(path);
    if (m && init.method === "POST") {
      posted.push(`${m[1]}:${body.message}`);
      return Response.json({ id: `m_${posted.length}`, body: body.message, type: "VISITOR", senderName: null, createdAt: "2026-10-24T00:00:01Z" });
    }
    return Response.json({ error: "not found" }, { status: 404 });
  };

  /** Let pending requests finish, a few event-loop turns at a time. */
  async function drain() {
    for (let i = 0; i < 50; i++) {
      while (gates.length) gates.shift()!();
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return { fetchImpl, visitors, conversations, posted, calls, drain, createdVisitors: () => seq };
}

function reset() {
  conversationId.value = null;
  visitorId.value = null;
  visitorToken.value = null;
  messages.value = [];
  isLoading.value = false;
}

describe("first message is single-flight (widget client)", () => {
  beforeEach(() => {
    reset();
    initClient("app_1", "https://app.example.com");
  });

  it("two parallel sends create 1 visitor and 1 conversation", async () => {
    const server = fakeServer();
    globalThis.fetch = server.fetchImpl as typeof fetch;

    const a = sendMessage("first");
    const b = sendMessage("second");
    // The first send sets the input loading guard while it is in flight.
    assert.equal(isLoading.value, true);
    await server.drain();
    await Promise.all([a, b]);

    assert.equal(server.createdVisitors(), 1);
    assert.deepEqual(server.conversations, ["c_1"]);
    assert.deepEqual(server.posted, ["c_1:second"]);
    assert.deepEqual(server.calls, ["POST /api/widget/conversations", "POST /api/widget/conversations/c_1/messages"]);
    assert.equal(conversationId.value, "c_1");
    assert.equal(isLoading.value, false);
    assert.deepEqual(messages.value.map((m) => m.body), ["first", "second"]);
  });

  it("drops a token whose visitor was deleted and starts once as a new visitor", async () => {
    const server = fakeServer({ deletedVisitors: ["v_gone"] });
    globalThis.fetch = server.fetchImpl as typeof fetch;
    visitorToken.value = "tok_v_gone";
    visitorId.value = "v_gone";

    const send = sendMessage("hello");
    await server.drain();
    await send;

    assert.deepEqual(server.calls, ["POST /api/widget/conversations", "POST /api/widget/conversations"]);
    assert.equal(server.createdVisitors(), 1);
    assert.equal(visitorToken.value, "tok_v_1");
    assert.equal(conversationId.value, "c_1");
  });
});

describe("createFirstMessageQueue", () => {
  it("retries the start for a later send when the first start failed", async () => {
    let conv: string | null = null;
    const starts: string[] = [];
    const posts: string[] = [];
    let failNext = true;
    const queue = createFirstMessageQueue({
      hasConversation: () => conv !== null,
      start: async (body) => {
        starts.push(body);
        await Promise.resolve();
        if (failNext) {
          failNext = false;
          return; // the real start swallows errors and leaves no conversation
        }
        conv = "c_1";
      },
      post: async (body) => {
        posts.push(body);
      },
    });
    await Promise.all([queue.send("a"), queue.send("b"), queue.send("c")]);
    assert.deepEqual(starts, ["a", "b"]);
    assert.deepEqual(posts, ["c"]);
  });
});

describe("withStaleTokenRetry", () => {
  const stale = () => new WidgetRequestError("Visitor not found", 401, VISITOR_NOT_FOUND);

  it("retries once without the token on VISITOR_NOT_FOUND", async () => {
    let token: string | null = "tok";
    let calls = 0;
    const result = await withStaleTokenRetry(
      async () => {
        calls++;
        if (token) throw stale();
        return "ok";
      },
      { has: () => token !== null, drop: () => (token = null) },
    );
    assert.equal(result, "ok");
    assert.equal(calls, 2);
  });

  it("does not retry other errors or without a token", async () => {
    let calls = 0;
    await assert.rejects(
      withStaleTokenRetry(
        async () => {
          calls++;
          throw new WidgetRequestError("Invalid App ID", 401);
        },
        { has: () => true, drop: () => undefined },
      ),
    );
    assert.equal(calls, 1);
    calls = 0;
    await assert.rejects(
      withStaleTokenRetry(
        async () => {
          calls++;
          throw stale();
        },
        { has: () => false, drop: () => undefined },
      ),
    );
    assert.equal(calls, 1);
  });
});
