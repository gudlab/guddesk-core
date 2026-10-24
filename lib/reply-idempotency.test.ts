import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  REPLY_IDEM_PREFIX,
  REPLY_IDEM_TTL_MS,
  claimReplyKey,
  createReplyOnce,
  newReplyKey,
  normalizeIdempotencyKey,
  replyIdemToken,
  sweepExpiredReplyKeys,
  type ReplyIdemDb,
} from "./reply-idempotency";

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
        if (!row || (where.expires && !(row.expires <= where.expires.lte))) return { count: 0 };
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
        return row ? { identifier: row.identifier } : null;
      },
      async deleteMany({ where }) {
        await tick();
        let count = 0;
        for (const [token, row] of rows) {
          const hit =
            typeof where.token === "string"
              ? token === where.token
              : token.startsWith(where.token.startsWith) && "expires" in where && row.expires < where.expires.lt;
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

/**
 * The sendMessage contract: claim, create the message, and email only when
 * this call created it (a duplicate or "sending" returns before the email).
 */
function fakeSender(db: ReplyIdemDb, opts: { createDelayMs?: number; failCreate?: () => boolean } = {}) {
  const messages: { id: string; conversationId: string; body: string }[] = [];
  const emails: string[] = [];
  async function send(conversationId: string, data: { body: string; type?: "AGENT" | "NOTE"; idempotencyKey?: string }, now?: Date) {
    const once = await createReplyOnce(
      db,
      { conversationId, key: normalizeIdempotencyKey(data.idempotencyKey), now },
      async () => {
        if (opts.createDelayMs) await new Promise((r) => setTimeout(r, opts.createDelayMs));
        if (opts.failCreate?.()) throw new Error("db down");
        const message = { id: `msg_${messages.length + 1}`, conversationId, body: data.body };
        messages.push(message);
        return message;
      },
      () => {},
    );
    if (once.kind === "sending") return { status: "sending" as const };
    if (once.kind === "duplicate") return { status: "success" as const, messageId: once.messageId, deduped: true };
    if (data.type !== "NOTE") emails.push(once.message.id);
    return { status: "success" as const, messageId: once.message.id };
  }
  return { send, messages, emails };
}

const KEY = "3f2b8c1e-6a4d-4e2f-9b7a-0c1d2e3f4a5b";

describe("reply idempotency", () => {
  it("two concurrent sends with the same key make one message and one email", async () => {
    const { db } = fakeDb();
    const s = fakeSender(db, { createDelayMs: 5 });
    const [a, b] = await Promise.all([
      s.send("conv1", { body: "hi", type: "AGENT", idempotencyKey: KEY }),
      s.send("conv1", { body: "hi", type: "AGENT", idempotencyKey: KEY }),
    ]);
    assert.equal(s.messages.length, 1);
    assert.equal(s.emails.length, 1);
    const statuses = [a.status, b.status].sort();
    assert.deepEqual(statuses, ["sending", "success"]);
  });

  it("a retry after success returns the same message and sends no email", async () => {
    const { db } = fakeDb();
    const s = fakeSender(db);
    const first = await s.send("conv1", { body: "hi", idempotencyKey: KEY });
    const retry = await s.send("conv1", { body: "hi", idempotencyKey: KEY });
    assert.equal(first.status, "success");
    assert.deepEqual(retry, { status: "success", messageId: (first as { messageId: string }).messageId, deduped: true });
    assert.equal(s.messages.length, 1);
    assert.equal(s.emails.length, 1);
  });

  it("a different key makes a new message", async () => {
    const { db } = fakeDb();
    const s = fakeSender(db);
    await s.send("conv1", { body: "hi", idempotencyKey: KEY });
    await s.send("conv1", { body: "hi", idempotencyKey: newReplyKey() });
    assert.equal(s.messages.length, 2);
    assert.equal(s.emails.length, 2);
  });

  it("the same key in another conversation is a different reply", async () => {
    const { db } = fakeDb();
    const s = fakeSender(db);
    await s.send("conv1", { body: "hi", idempotencyKey: KEY });
    await s.send("conv2", { body: "hi", idempotencyKey: KEY });
    assert.equal(s.messages.length, 2);
  });

  it("an expired key can be used again and makes a new message", async () => {
    const { db, rows } = fakeDb();
    const s = fakeSender(db);
    const t0 = new Date("2026-10-24T18:00:00Z");
    await s.send("conv1", { body: "hi", idempotencyKey: KEY }, t0);
    const within = await s.send("conv1", { body: "hi", idempotencyKey: KEY }, new Date(t0.getTime() + REPLY_IDEM_TTL_MS - 1000));
    assert.equal((within as { deduped?: boolean }).deduped, true);
    const later = new Date(t0.getTime() + REPLY_IDEM_TTL_MS + 1000);
    const after = await s.send("conv1", { body: "hi", idempotencyKey: KEY }, later);
    assert.equal(after.status, "success");
    assert.equal((after as { deduped?: boolean }).deduped, undefined);
    assert.equal(s.messages.length, 2);
    assert.equal(s.emails.length, 2);
    assert.equal(rows.get(replyIdemToken("conv1", KEY))?.expires.getTime(), later.getTime() + REPLY_IDEM_TTL_MS);
  });

  it("the shared-draft Send path dedupes the same way", async () => {
    const { db } = fakeDb();
    const s = fakeSender(db, { createDelayMs: 5 });
    // SharedDraftEditor sends { body, type: "AGENT", idempotencyKey }.
    const results = await Promise.all([
      s.send("conv1", { body: "draft", type: "AGENT", idempotencyKey: KEY }),
      s.send("conv1", { body: "draft", type: "AGENT", idempotencyKey: KEY }),
    ]);
    const retry = await s.send("conv1", { body: "draft", type: "AGENT", idempotencyKey: KEY });
    assert.equal(s.messages.length, 1);
    assert.equal(s.emails.length, 1);
    assert.ok(results.some((r) => r.status === "sending"));
    assert.equal((retry as { deduped?: boolean }).deduped, true);
  });

  it("releases the claim when creating the message fails, so a retry can send", async () => {
    const { db, rows } = fakeDb();
    let fail = true;
    const s = fakeSender(db, { failCreate: () => fail });
    await assert.rejects(s.send("conv1", { body: "hi", idempotencyKey: KEY }), /db down/);
    assert.equal(rows.size, 0);
    fail = false;
    const retry = await s.send("conv1", { body: "hi", idempotencyKey: KEY });
    assert.equal(retry.status, "success");
    assert.equal(s.messages.length, 1);
  });

  it("without a valid key it just creates (no dedupe)", async () => {
    const { db, rows } = fakeDb();
    const s = fakeSender(db);
    await s.send("conv1", { body: "hi" });
    await s.send("conv1", { body: "hi", idempotencyKey: "bad key!" });
    assert.equal(s.messages.length, 2);
    assert.equal(rows.size, 0);
  });

  it("stores the state in identifier and the message id after insert", async () => {
    const { db, rows } = fakeDb();
    assert.deepEqual(await claimReplyKey(db, "conv1", KEY), { state: "claimed" });
    const token = replyIdemToken("conv1", KEY);
    assert.equal(token, `reply-idem:conv1:${KEY}`);
    assert.equal(rows.get(token)?.identifier, "reply-idem:sending");
    assert.deepEqual(await claimReplyKey(db, "conv1", KEY), { state: "sending" });
    rows.get(token)!.identifier = "reply-idem:done:msg_9";
    assert.deepEqual(await claimReplyKey(db, "conv1", KEY), { state: "done", messageId: "msg_9" });
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
    const now = new Date("2026-10-24T18:00:00Z");
    rows.set("reply-idem:c:old", { identifier: "reply-idem:sending", token: "reply-idem:c:old", expires: new Date(now.getTime() - 1) });
    rows.set("reply-idem:c:new", { identifier: "reply-idem:sending", token: "reply-idem:c:new", expires: new Date(now.getTime() + 1000) });
    rows.set("inbound:x", { identifier: "inbound:x", token: "inbound:x", expires: new Date(now.getTime() - 1) });
    assert.equal(await sweepExpiredReplyKeys(db, now), 1);
    assert.deepEqual([...rows.keys()].sort(), ["inbound:x", "reply-idem:c:new"]);
    assert.equal(REPLY_IDEM_PREFIX, "reply-idem:");
  });
});

describe("reply idempotency wiring", () => {
  const root = join(__dirname, "..");
  const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");

  it("sendMessage claims the key after the membership check and returns before any email on a duplicate", () => {
    const src = read("actions", "send-message.ts");
    const member = src.indexOf("requireWorkspaceMember(conversation.workspaceId");
    const claim = src.indexOf("createReplyOnce(");
    const sending = src.indexOf('once.kind === "sending"');
    const dup = src.indexOf('once.kind === "duplicate"');
    const email = src.indexOf("getChannelProvider(");
    assert.ok(member > 0 && claim > member, "claim after membership");
    assert.ok(sending > claim && dup > claim, "early returns after the claim");
    assert.ok(email > dup && email > sending, "email only after the early returns");
    assert.match(src, /normalizeIdempotencyKey\(data\.idempotencyKey\)/);
    assert.match(src, /deduped: true/);
  });

  for (const file of ["reply-box.tsx", "shared-draft-editor.tsx"]) {
    it(`${file} sends one key per composed reply and resets it after success`, () => {
      const src = read("components", "inbox", file);
      assert.match(src, /const replyKey = useRef<string>\(newReplyKey\(\)\);/);
      assert.match(src, /idempotencyKey: replyKey\.current,/);
      assert.match(src, /result\.status === "sending"/);
      const resets = src.match(/replyKey\.current = newReplyKey\(\);/g) ?? [];
      assert.equal(resets.length, 2, "reset on conversation change and after success");
    });
  }

  it("the hourly cron sweeps expired reply keys", () => {
    const src = read("app", "api", "cron", "sla-check", "route.ts");
    assert.match(src, /sweepExpiredReplyKeys\(prisma\)/);
    assert.match(src, /replyKeysSwept/);
  });
});
