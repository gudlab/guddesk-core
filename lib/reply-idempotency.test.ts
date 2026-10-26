import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  REPLY_IDEM_PREFIX,
  REPLY_IDEM_TTL_MS,
  REPLY_LEASE_MS,
  claimReplyKey,
  formatReplyState,
  newReplyKey,
  normalizeIdempotencyKey,
  parseReplyState,
  replyIdemToken,
  runReplyOnce,
  sweepExpiredReplyKeys,
  type EmailResult,
  type ReplyIdemDb,
} from "./reply-idempotency";
import { forgetReplyKey, replyKeyFor, type KeyStorage } from "./reply-key-store";

type Row = { identifier: string; token: string; expires: Date };
const tick = () => new Promise((resolve) => setImmediate(resolve));

/** In-memory verification_tokens with a unique token; each call yields first, so concurrent callers interleave. */
function fakeDb() {
  const rows = new Map<string, Row>();
  const db: ReplyIdemDb = {
    verificationToken: {
      async updateMany({ where, data }) {
        await tick();
        const row = rows.get(where.token);
        if (!row) return { count: 0 };
        if (where.identifier !== undefined && row.identifier !== where.identifier) return { count: 0 };
        if (where.expires && !(row.expires <= where.expires.lte)) return { count: 0 };
        row.identifier = data.identifier;
        if (data.expires) row.expires = data.expires;
        return { count: 1 };
      },
      async create({ data }) {
        await tick();
        if (rows.has(data.token)) throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        rows.set(data.token, { ...data });
        return data;
      },
      async findUnique({ where }) {
        await tick();
        const row = rows.get(where.token);
        return row ? { identifier: row.identifier, expires: row.expires } : null;
      },
      async deleteMany({ where }) {
        await tick();
        let count = 0;
        for (const [token, row] of rows) {
          let hit: boolean;
          if (typeof where.token === "string") {
            hit = token === where.token && (!("identifier" in where) || where.identifier === undefined || row.identifier === where.identifier);
          } else {
            hit = token.startsWith(where.token.startsWith) && "expires" in where && row.expires < where.expires.lt;
          }
          if (hit) {
            rows.delete(token);
            count++;
          }
        }
        return { count };
      },
    },
  };
  return { db, rows };
}

type Msg = { id: string; conversationId: string; body: string };

/**
 * sendMessage's steps against in-memory stores, with failures to inject.
 * `emails` counts emails that actually went out.
 */
function fakeServer(db: ReplyIdemDb, clock: { now: number }) {
  const messages: Msg[] = [];
  const emails: string[] = [];
  const webhooks: string[] = [];
  const notified: string[] = [];
  const faults = {
    createFails: 0,
    notifyFails: 0,
    emailFails: 0 as number,
    emailResult: null as EmailResult | null,
    notifyHang: null as Promise<void> | null,
    createDelayMs: 0,
  };
  async function send(conversationId: string, userId: string, key: string | null, body = "Hello") {
    return runReplyOnce<Msg>(
      db,
      { conversationId, userId, key: normalizeIdempotencyKey(key), now: () => new Date(clock.now) },
      {
        async create() {
          if (faults.createDelayMs) await new Promise((r) => setTimeout(r, faults.createDelayMs));
          if (faults.createFails > 0) {
            faults.createFails--;
            throw new Error("db down");
          }
          const message = { id: `msg_${messages.length + 1}`, conversationId, body };
          messages.push(message);
          return message;
        },
        async load(id) {
          return messages.find((m) => m.id === id && m.conversationId === conversationId) ?? null;
        },
        async notify(message) {
          if (faults.notifyHang) await faults.notifyHang;
          if (faults.notifyFails > 0) {
            faults.notifyFails--;
            throw new Error("conversation update failed");
          }
          notified.push(message.id);
        },
        async webhooks(message) {
          webhooks.push(message.id);
        },
        async email(message) {
          if (faults.emailResult) return faults.emailResult;
          if (faults.emailFails > 0) {
            faults.emailFails--;
            return { status: "failed", reason: "send_failed", permanent: false };
          }
          emails.push(message.id);
          return { status: "sent" };
        },
      },
      () => {},
    );
  }
  return { send, messages, emails, webhooks, notified, faults };
}

const KEY = "0b4f6c1e-7a2d-4c1b-9b8e-2f1d3c4a5b6c";
const T0 = Date.parse("2026-10-24T18:00:00Z");

describe("reply idempotency: per-step claim", () => {
  it("sends once per key; a repeat returns the same message without a second email", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    const first = await s.send("c1", "u1", KEY);
    const again = await s.send("c1", "u1", KEY);
    assert.equal(first.kind, "delivered");
    assert.equal(again.kind, "delivered");
    assert.equal(again.kind === "delivered" && again.repeat, true);
    assert.equal(again.kind === "delivered" && again.message.id, "msg_1");
    assert.equal(s.messages.length, 1);
    assert.deepEqual(s.emails, ["msg_1"]);
    assert.deepEqual(s.webhooks, ["msg_1"]);
  });

  it("a retry after a failed email sends the email once on the existing message", async () => {
    const { db, rows } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.emailFails = 1;

    const first = await s.send("c1", "u1", KEY);
    assert.equal(first.kind, "incomplete");
    assert.equal(first.kind === "incomplete" && first.failedStep, "email");
    assert.equal(s.emails.length, 0);
    // Not marked done: the row says saved, steps n and w finished, lease released.
    const row = rows.get(replyIdemToken("c1", "u1", KEY))!;
    assert.deepEqual(parseReplyState(row.identifier), { state: "saved", messageId: "msg_1", steps: "nw", leaseUntil: 0 });

    clock.now += 2_000;
    const retry = await s.send("c1", "u1", KEY);
    assert.equal(retry.kind, "delivered");
    assert.equal(retry.kind === "delivered" && retry.repeat, false);
    assert.equal(s.messages.length, 1, "no second message");
    assert.deepEqual(s.emails, ["msg_1"], "email delivered exactly once");
    assert.deepEqual(s.notified, ["msg_1"], "conversation update not repeated");
    assert.deepEqual(s.webhooks, ["msg_1"], "webhooks not repeated");

    const third = await s.send("c1", "u1", KEY);
    assert.equal(third.kind === "delivered" && third.repeat, true);
    assert.deepEqual(s.emails, ["msg_1"]);
  });

  it("a retry after a failed conversation update runs only the missing steps", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.notifyFails = 1;

    const first = await s.send("c1", "u1", KEY);
    assert.equal(first.kind === "incomplete" && first.failedStep, "notify");
    assert.equal(s.emails.length, 0);
    assert.equal(s.webhooks.length, 0);

    const retry = await s.send("c1", "u1", KEY);
    assert.equal(retry.kind, "delivered");
    assert.equal(s.messages.length, 1);
    assert.deepEqual(s.notified, ["msg_1"]);
    assert.deepEqual(s.webhooks, ["msg_1"]);
    assert.deepEqual(s.emails, ["msg_1"]);
  });

  it("an attempt that hangs after creating the message is taken over once its 45s lease runs out", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.notifyHang = new Promise<void>(() => {});

    void s.send("c1", "u1", KEY); // hangs in notify, holding the lease
    for (let i = 0; i < 20; i++) await tick();
    assert.equal(s.messages.length, 1);

    clock.now = T0 + 10_000;
    assert.equal((await s.send("c1", "u1", KEY)).kind, "busy", "lease still held at 10s");
    clock.now = T0 + REPLY_LEASE_MS - 1;
    assert.equal((await s.send("c1", "u1", KEY)).kind, "busy", "lease still held just before 45s");

    s.faults.notifyHang = null;
    clock.now = T0 + REPLY_LEASE_MS + 1_000;
    const takeover = await s.send("c1", "u1", KEY);
    assert.equal(takeover.kind, "delivered");
    assert.equal(takeover.kind === "delivered" && takeover.message.id, "msg_1");
    assert.equal(s.messages.length, 1, "the existing message is reused");
    assert.deepEqual(s.emails, ["msg_1"]);
  });

  it("a stale 'sending' row (attempt died before creating) is taken over after 45s", async () => {
    const { db, rows } = fakeDb();
    const token = replyIdemToken("c1", "u1", KEY);
    rows.set(token, {
      token,
      identifier: formatReplyState({ state: "sending", leaseUntil: T0 + REPLY_LEASE_MS }),
      expires: new Date(T0 + REPLY_IDEM_TTL_MS),
    });
    assert.deepEqual(await claimReplyKey(db, token, new Date(T0 + 30_000)), { kind: "busy" });
    const claim = await claimReplyKey(db, token, new Date(T0 + REPLY_LEASE_MS + 1));
    assert.equal(claim.kind, "new");
  });

  it("only one of several concurrent takeovers wins the expired lease", async () => {
    const { db, rows } = fakeDb();
    const token = replyIdemToken("c1", "u1", KEY);
    rows.set(token, {
      token,
      identifier: formatReplyState({ state: "saved", messageId: "msg_1", steps: "n", leaseUntil: T0 }),
      expires: new Date(T0 + REPLY_IDEM_TTL_MS),
    });
    const now = new Date(T0 + 1);
    const claims = await Promise.all([1, 2, 3].map(() => claimReplyKey(db, token, now)));
    assert.equal(claims.filter((c) => c.kind === "resume").length, 1);
    assert.equal(claims.filter((c) => c.kind === "busy").length, 2);
  });

  it("a concurrent double submit creates one message and sends one email", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.createDelayMs = 20;
    const [a, b] = await Promise.all([s.send("c1", "u1", KEY), s.send("c1", "u1", KEY)]);
    const kinds = [a.kind, b.kind].sort();
    assert.deepEqual(kinds, ["busy", "delivered"]);
    assert.equal(s.messages.length, 1);
    assert.deepEqual(s.emails, ["msg_1"]);
  });

  it("a permanent email failure is final and is returned on every repeat", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.emailResult = { status: "failed", reason: "sender_rejected", permanent: true };
    const first = await s.send("c1", "u1", KEY);
    assert.equal(first.kind, "delivered");
    assert.deepEqual(first.kind === "delivered" && first.email, { status: "failed", reason: "sender_rejected", permanent: true });

    s.faults.emailResult = null;
    const again = await s.send("c1", "u1", KEY);
    assert.equal(again.kind === "delivered" && again.repeat, true);
    assert.deepEqual(again.kind === "delivered" && again.email, { status: "failed", reason: "sender_rejected", permanent: true });
    assert.equal(s.emails.length, 0, "not resent");
    assert.equal(s.messages.length, 1);
  });

  it("the key is per user: the same key from another agent is a different reply", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    await s.send("c1", "u1", KEY);
    const other = await s.send("c1", "u2", KEY);
    assert.equal(other.kind === "delivered" && other.repeat, false);
    assert.equal(s.messages.length, 2);
    assert.notEqual(replyIdemToken("c1", "u1", KEY), replyIdemToken("c1", "u2", KEY));
  });

  it("a failed create frees the key so a retry creates the message", async () => {
    const { db, rows } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.createFails = 1;
    await assert.rejects(s.send("c1", "u1", KEY), /db down/);
    assert.equal(rows.size, 0);
    assert.equal((await s.send("c1", "u1", KEY)).kind, "delivered");
    assert.equal(s.messages.length, 1);
  });

  it("a deleted message is reported as gone, not re-created", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    s.faults.emailFails = 1;
    await s.send("c1", "u1", KEY);
    s.messages.length = 0;
    assert.equal((await s.send("c1", "u1", KEY)).kind, "gone");
    assert.equal(s.messages.length, 0);
  });

  it("without a key every send creates and emails", async () => {
    const { db, rows } = fakeDb();
    const s = fakeServer(db, { now: T0 });
    await s.send("c1", "u1", null);
    await s.send("c1", "u1", null);
    assert.equal(s.messages.length, 2);
    assert.equal(s.emails.length, 2);
    assert.equal(rows.size, 0);
  });

  it("an expired row starts a new reply", async () => {
    const { db } = fakeDb();
    const clock = { now: T0 };
    const s = fakeServer(db, clock);
    await s.send("c1", "u1", KEY);
    clock.now = T0 + REPLY_IDEM_TTL_MS + 1;
    const later = await s.send("c1", "u1", KEY);
    assert.equal(later.kind === "delivered" && later.repeat, false);
    assert.equal(s.messages.length, 2);
  });

  it("states round-trip; unknown identifiers count as an expired lease", () => {
    for (const state of [
      { state: "sending", leaseUntil: 123 },
      { state: "saved", messageId: "cm1", steps: "nw", leaseUntil: 0 },
      { state: "delivered", messageId: "cm1", email: "recipient_rejected" },
    ] as const) {
      assert.deepEqual(parseReplyState(formatReplyState(state)), state);
    }
    assert.deepEqual(parseReplyState("reply-idem:done:cm1"), { state: "sending", leaseUntil: 0 });
    assert.equal(REPLY_LEASE_MS, 45_000);
  });

  it("normalizes keys", () => {
    assert.equal(normalizeIdempotencyKey(KEY), KEY);
    assert.equal(normalizeIdempotencyKey("short"), null);
    assert.equal(normalizeIdempotencyKey("a:b:c-d-e-f"), null);
    assert.equal(normalizeIdempotencyKey("x".repeat(65)), null);
    assert.equal(normalizeIdempotencyKey(42), null);
    assert.match(newReplyKey(), /^[A-Za-z0-9-]{8,64}$/);
    assert.notEqual(newReplyKey(), newReplyKey());
  });

  it("sweeps only expired reply-idem rows", async () => {
    const { db, rows } = fakeDb();
    const now = new Date(T0);
    rows.set("reply-idem:c:u:old", { identifier: "reply-idem:sending:0", token: "reply-idem:c:u:old", expires: new Date(T0 - 1) });
    rows.set("reply-idem:c:u:new", { identifier: "reply-idem:sending:0", token: "reply-idem:c:u:new", expires: new Date(T0 + 1000) });
    rows.set("inbound:x", { identifier: "inbound:x", token: "inbound:x", expires: new Date(T0 - 1) });
    assert.equal(await sweepExpiredReplyKeys(db, now), 1);
    assert.deepEqual([...rows.keys()].sort(), ["inbound:x", "reply-idem:c:u:new"]);
    assert.equal(REPLY_IDEM_PREFIX, "reply-idem:");
  });
});

describe("reply key store (localStorage)", () => {
  function memoryStorage(): KeyStorage & { map: Map<string, string> } {
    const map = new Map<string, string>();
    return {
      map,
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: (k) => void map.delete(k),
    };
  }
  const reply = { conversationId: "c1", type: "AGENT", body: "Thanks, fixed now." };

  it("the same reply reuses its key until it is forgotten", () => {
    const storage = memoryStorage();
    const key = replyKeyFor(storage, reply, T0);
    assert.equal(replyKeyFor(storage, reply, T0 + 60_000), key);
    assert.ok(![...storage.map.values()].some((v) => v.includes("fixed now")), "the text is not stored");
    forgetReplyKey(storage, reply);
    assert.notEqual(replyKeyFor(storage, reply, T0), key);
  });

  it("different text, type or conversation gets its own key", () => {
    const storage = memoryStorage();
    const key = replyKeyFor(storage, reply, T0);
    assert.notEqual(replyKeyFor(storage, { ...reply, body: "Something else" }, T0), key);
    assert.notEqual(replyKeyFor(storage, { ...reply, type: "NOTE" }, T0), key);
    assert.notEqual(replyKeyFor(storage, { ...reply, conversationId: "c2" }, T0), key);
    assert.equal(replyKeyFor(storage, reply, T0), key, "an earlier pending reply keeps its key");
  });

  it("keys older than 24 hours are replaced, and broken storage still yields a key", () => {
    const storage = memoryStorage();
    const key = replyKeyFor(storage, reply, T0);
    assert.notEqual(replyKeyFor(storage, reply, T0 + REPLY_IDEM_TTL_MS + 1), key);
    const broken: KeyStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    assert.match(replyKeyFor(broken, reply, T0), /^[A-Za-z0-9-]{8,64}$/);
    forgetReplyKey(broken, reply);
  });
});

describe("reply idempotency wiring", () => {
  const root = join(__dirname, "..");
  const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

  it("sendMessage claims after the membership check, keys by user, and runs every step through the runner", () => {
    const src = read("actions", "send-message.ts");
    const member = src.indexOf("requireWorkspaceMember(conversation.workspaceId");
    const run = src.indexOf("runReplyOnce<Message>(");
    assert.ok(member > 0 && run > member, "claim after membership");
    assert.match(src, /userId: session\.user\.id, key: normalizeIdempotencyKey\(data\.idempotencyKey\)/);
    for (const step of ["create:", "load:", "notify:", "webhooks:", "email:"]) {
      assert.ok(src.indexOf(step, run) > run, step);
    }
    assert.match(src, /emailRetryable: run\.kind === "incomplete"/);
    assert.match(src, /retryable: true/);
  });

  it("the email step gives Resend an idempotency key per message", () => {
    assert.match(read("lib", "channels", "email", "provider.ts"), /idempotencyKey: `email-channel-reply\/\$\{message\.id\}`/);
    assert.match(read("lib", "email", "send.ts"), /\.emails\.send\(email, options\.idempotencyKey \? \{ idempotencyKey: options\.idempotencyKey \} : undefined\)/);
  });

  it("the client catches a failed submit, keeps the key in shared storage, and Retry email reuses its key", () => {
    const flow = read("lib", "reply-delivery.ts");
    assert.match(flow, /const key = await acquireKey\(deps\.storage\(\), reply, \{ now \}\)/);
    assert.match(flow, /\} catch \{\s*\/\/ The request failed/);
    assert.match(flow, /label: "Retry email"/);
    assert.match(flow, /void retryEmail\(reply, key\)/);
    assert.doesNotMatch(flow, /void deliverReply\(reply\)/, "Retry email never goes through key lookup");
    assert.match(read("lib", "reply-key-store.ts"), /\(globalThis as \{ localStorage\?: KeyStorage \}\)\.localStorage/);
    const wiring = read("components", "inbox", "deliver-reply.ts");
    assert.match(wiring, /createReplyDelivery\(\{/);
    assert.match(wiring, /storage: browserKeyStorage/);
    assert.match(wiring, /new BroadcastChannel\(/);
    for (const file of ["reply-box.tsx", "shared-draft-editor.tsx"]) {
      const component = read("components", "inbox", file);
      assert.match(component, /await deliverReply\(\{/, file);
      assert.doesNotMatch(component, /sendMessage\(/, file);
    }
  });

  it("the email step threads from earlier messages only", () => {
    assert.match(read("lib", "channels", "email", "provider.ts"), /buildReplyHeaders\(context\.conversationId, message\)/);
  });

  it("the hourly cron sweeps expired reply keys", () => {
    const src = read("app", "api", "cron", "sla-check", "route.ts");
    assert.match(src, /sweepExpiredReplyKeys\(prisma\)/);
    assert.match(src, /replyKeysSwept/);
  });
});
