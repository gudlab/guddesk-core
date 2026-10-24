import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { InboundPayload } from "../channels/types";
import { handleInboundEmail, type InboundDb, type InboundDeps } from "./handler";
import { htmlToText, parseInboundPayload } from "./payload";
import { replayKey } from "./replay";
import { signSvixPayload, verifySvixSignature } from "./signature";

const SECRET = "whsec_" + Buffer.from("test-signing-key-0123456789abcdef").toString("base64");
const OTHER_SECRET = "whsec_" + Buffer.from("some-other-key-0123456789abcdef!").toString("base64");
const NOW = new Date("2026-10-24T12:00:00Z");
const TS = String(Math.floor(NOW.getTime() / 1000));

interface Member {
  workspaceId: string;
  userId: string;
}

function fakeDb() {
  const tokens = new Map<string, Date>();
  const messages: Array<Record<string, unknown>> = [];
  const conversationUpdates: Array<Record<string, unknown>> = [];
  const messageLookups: Array<Record<string, unknown>> = [];
  const users = [
    { id: "u_agent", email: "agent@acme.test", name: "Ada Agent", isBanned: false },
    { id: "u_banned", email: "banned@acme.test", name: "Bad", isBanned: true },
    { id: "u_removed", email: "removed@acme.test", name: "Gone", isBanned: false },
    { id: "u_other", email: "other@globex.test", name: "Other", isBanned: false },
  ];
  const members: Member[] = [
    { workspaceId: "ws_a", userId: "u_agent" },
    { workspaceId: "ws_a", userId: "u_banned" },
    { workspaceId: "ws_b", userId: "u_other" },
  ];
  const conversations = [
    { id: "conva", workspaceId: "ws_a", status: "CLOSED", firstResponseAt: null },
    { id: "convb", workspaceId: "ws_b", status: "OPEN", firstResponseAt: null },
  ];
  const db = {
    verificationToken: {
      async updateMany({ where, data }: { where: { token: string; expires: { lte: Date } }; data: { expires: Date } }) {
        const current = tokens.get(where.token);
        if (current && current <= where.expires.lte) {
          tokens.set(where.token, data.expires);
          return { count: 1 };
        }
        return { count: 0 };
      },
      async create({ data }: { data: { token: string; expires: Date } }) {
        if (tokens.has(data.token)) throw Object.assign(new Error("unique"), { code: "P2002" });
        tokens.set(data.token, data.expires);
        return data;
      },
      async deleteMany({ where }: { where: { token: string } }) {
        return { count: tokens.delete(where.token) ? 1 : 0 };
      },
    },
    conversation: {
      async findUnique({ where }: { where: { id: string } }) {
        return conversations.find((c) => c.id === where.id) ?? null;
      },
      async findFirst({ where }: { where: { id: string; workspaceId: string } }) {
        return conversations.find((c) => c.id === where.id && c.workspaceId === where.workspaceId) ?? null;
      },
      async update(args: Record<string, unknown>) {
        conversationUpdates.push(args);
        return {};
      },
    },
    user: {
      async findFirst({ where }: { where: { email: { equals: string } } }) {
        return users.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) ?? null;
      },
    },
    workspaceMember: {
      async findUnique({ where }: { where: { workspaceId_userId: Member } }) {
        const key = where.workspaceId_userId;
        return members.find((m) => m.workspaceId === key.workspaceId && m.userId === key.userId) ? { id: "m" } : null;
      },
    },
    workspace: {
      async findUnique({ where }: { where: { appId: string } }) {
        return where.appId === "appa" ? { id: "ws_a" } : null;
      },
    },
    emailChannelConfig: {
      async findUnique() {
        return { isEnabled: true };
      },
    },
    message: {
      async create({ data }: { data: Record<string, unknown> }) {
        const row = { id: `msg_${messages.length + 1}`, createdAt: NOW, ...data };
        messages.push(row);
        return row;
      },
      async findFirst(args: Record<string, unknown>) {
        messageLookups.push(args);
        return null;
      },
    },
  };
  return { db: db as unknown as InboundDb, tokens, messages, conversationUpdates, messageLookups };
}

function setup(overrides: Partial<InboundDeps> = {}) {
  const store = fakeDb();
  const logs: string[] = [];
  const customer: InboundPayload[] = [];
  const fetched: string[] = [];
  const broadcasts: unknown[] = [];
  const received: Record<string, Record<string, unknown>> = {};
  const deps: InboundDeps = {
    db: store.db,
    secret: SECRET,
    now: () => NOW,
    log: (line) => logs.push(line),
    async fetchReceivedEmail(id) {
      fetched.push(id);
      const email = received[id];
      if (!email) throw Object.assign(new Error("missing"), { name: "not_found" });
      return email;
    },
    async handleCustomerInbound(payload) {
      customer.push(payload);
      return { conversationId: "conv_new", messageId: "m_new", visitorId: "v", isNew: true };
    },
    broadcast: async (events) => {
      broadcasts.push(events);
      return true;
    },
    ...overrides,
  };
  return { ...store, logs, customer, fetched, broadcasts, received, deps };
}

function signed(body: unknown, opts: { id?: string; ts?: string; secret?: string; signature?: string } = {}) {
  const rawBody = typeof body === "string" ? body : JSON.stringify(body);
  const id = opts.id ?? "msg_2abc";
  const ts = opts.ts ?? TS;
  const signature = opts.signature ?? signSvixPayload(opts.secret ?? SECRET, id, ts, rawBody);
  const headers = new Headers({ "svix-id": id, "svix-timestamp": ts, "svix-signature": signature });
  return { headers, rawBody };
}

const receivedEvent = (emailId: string, to: string[]) => ({
  type: "email.received",
  created_at: NOW.toISOString(),
  data: { email_id: emailId, from: "x@y.test", to, subject: "Hi" },
});

const customerEmail = {
  object: "email",
  id: "em_1",
  from: "jane.customer@example.com",
  to: ["support+appa@mail.guddesk.com"],
  subject: "Help",
  text: "Private customer text",
  html: null,
  headers: { from: "Jane Customer <jane.customer@example.com>", "In-Reply-To": "<msg-1@mail.guddesk.com>" },
  authentication: { spf: "pass", dkim: "pass", dmarc: "pass" },
};

const agentEmail = (from: string, conversationId: string, dmarc = "pass") => ({
  ...customerEmail,
  id: "em_2",
  from,
  to: [`reply+${conversationId}@mail.guddesk.com`],
  text: "Agent reply text",
  headers: { from },
  authentication: { spf: "pass", dkim: "pass", dmarc },
});

function assertCleanLogs(logs: string[]) {
  for (const line of logs) {
    for (const leaked of ["@", "Private customer", "Agent reply text", SECRET, SECRET.slice(6)]) {
      assert.ok(!line.includes(leaked), `log leaked ${leaked}: ${line}`);
    }
  }
}

describe("verifySvixSignature", () => {
  it("accepts any one of several v1 signatures (secret rotation)", () => {
    const body = "{}";
    const good = signSvixPayload(SECRET, "msg_1", TS, body);
    const stale = signSvixPayload(OTHER_SECRET, "msg_1", TS, body);
    const result = verifySvixSignature(SECRET, { id: "msg_1", timestamp: TS, signature: `v1a,zz ${stale} ${good}` }, body, NOW);
    assert.deepEqual(result, { ok: true, id: "msg_1" });
  });

  it("rejects a body changed after signing", () => {
    const signature = signSvixPayload(SECRET, "msg_1", TS, '{"a":1}');
    const result = verifySvixSignature(SECRET, { id: "msg_1", timestamp: TS, signature }, '{"a":2}', NOW);
    assert.deepEqual(result, { ok: false, reason: "bad_signature" });
  });

  it("allows 5 minutes of clock skew either way, no more", () => {
    const check = (offsetSec: number) => {
      const ts = String(Number(TS) + offsetSec);
      const signature = signSvixPayload(SECRET, "m", ts, "");
      return verifySvixSignature(SECRET, { id: "m", timestamp: ts, signature }, "", NOW);
    };
    assert.equal(check(-300).ok, true);
    assert.equal(check(300).ok, true);
    assert.deepEqual(check(-301), { ok: false, reason: "stale_timestamp" });
    assert.deepEqual(check(301), { ok: false, reason: "stale_timestamp" });
  });
});

describe("POST /api/email/inbound: rejections", () => {
  it("unset or empty secret: 401 for every request, even a correctly signed one", async () => {
    for (const secret of [undefined, "", "   "]) {
      const t = setup({ secret });
      const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"])), t.deps);
      assert.equal(res.status, 401);
      assert.match(t.logs[0], /rejected reason=secret_unset/);
      assert.equal(t.tokens.size, 0);
      assert.equal(t.fetched.length, 0);
    }
  });

  it("unsigned: 401 missing_headers", async () => {
    const t = setup();
    const res = await handleInboundEmail({ headers: new Headers(), rawBody: JSON.stringify({ from: "a@b.c", to: "x", text: "t" }) }, t.deps);
    assert.equal(res.status, 401);
    assert.match(t.logs[0], /rejected reason=missing_headers svix_id=none/);
    assert.equal(t.messages.length + t.customer.length, 0);
  });

  it("bad signature: 401", async () => {
    const t = setup();
    const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@x.test"]), { secret: OTHER_SECRET }), t.deps);
    assert.equal(res.status, 401);
    assert.match(t.logs[0], /rejected reason=bad_signature svix_id=msg_2abc/);
    assert.equal(t.fetched.length, 0);
  });

  it("stale timestamp: 401 even with a valid signature", async () => {
    const t = setup();
    const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@x.test"]), { ts: String(Number(TS) - 600) }), t.deps);
    assert.equal(res.status, 401);
    assert.match(t.logs[0], /rejected reason=stale_timestamp/);
  });

  it("replayed id: the repeat is a 200 no-op", async () => {
    const t = setup();
    t.received.em_1 = customerEmail;
    const request = signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"]), { id: "msg_replay" });
    const first = await handleInboundEmail(request, t.deps);
    const second = await handleInboundEmail(request, t.deps);
    assert.equal(first.status, 200);
    assert.deepEqual(second, { status: 200, body: { ignored: "replayed_id" } });
    assert.equal(t.customer.length, 1);
    assert.equal(t.fetched.length, 1);
    assert.deepEqual([...t.tokens.keys()], [replayKey("msg_replay")]);
    assert.equal(t.tokens.get("inbound:svix:msg_replay")?.getTime(), NOW.getTime() + 5 * 60 * 1000);
    assert.match(t.logs.at(-1) ?? "", /ignored reason=replayed_id svix_id=msg_replay/);
  });

  it("a processing failure returns 500 and frees the id for Svix's retry", async () => {
    const t = setup();
    const request = signed(receivedEvent("em_late", ["support+appa@mail.guddesk.com"]), { id: "msg_retry" });
    const first = await handleInboundEmail(request, t.deps);
    assert.equal(first.status, 500);
    assert.match(t.logs[0], /failed reason=processing_error error=not_found svix_id=msg_retry/);
    assert.equal(t.tokens.size, 0);
    t.received.em_late = customerEmail;
    const retry = await handleInboundEmail(request, t.deps);
    assert.equal(retry.status, 200);
    assert.equal(t.customer.length, 1);
  });
});

describe("POST /api/email/inbound: valid requests", () => {
  it("new shape: fetches the received email and files it as a customer message", async () => {
    const t = setup();
    t.received.em_1 = customerEmail;
    const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"])), t.deps);
    assert.equal(res.status, 200);
    assert.deepEqual(t.fetched, ["em_1"]);
    assert.deepEqual(t.customer[0], {
      workspaceId: "ws_a",
      from: "jane.customer@example.com",
      fromName: "Jane Customer",
      subject: "Help",
      body: "Private customer text",
      threadId: undefined,
    });
    // Threading lookups stay inside the recipient's workspace.
    assert.deepEqual((t.messageLookups[0] as { where: unknown }).where, {
      emailMessageId: "<msg-1@mail.guddesk.com>",
      conversation: { workspaceId: "ws_a" },
    });
    assertCleanLogs(t.logs);
  });

  it("new shape: html-only email becomes text", async () => {
    const t = setup();
    t.received.em_1 = { ...customerEmail, text: null, html: "<p>Hello&nbsp;<b>there</b></p>" };
    await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"])), t.deps);
    assert.equal(t.customer[0].body, "Hello there");
    assert.equal(htmlToText("data:text/html;base64," + Buffer.from("<p>Hi</p>").toString("base64")), "Hi");
  });

  it("new shape: an active member's reply+ email is posted as that agent", async () => {
    const t = setup();
    t.received.em_2 = agentEmail("Agent@Acme.test", "conva");
    const res = await handleInboundEmail(signed(receivedEvent("em_2", ["reply+conva@mail.guddesk.com"])), t.deps);
    assert.equal(res.status, 200);
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "AGENT");
    assert.equal(t.messages[0].senderId, "u_agent");
    const update = t.conversationUpdates[0] as { data: Record<string, unknown> };
    assert.equal(update.data.status, "OPEN");
    assert.ok(update.data.firstResponseAt);
    assert.equal(t.broadcasts.length, 1);
  });

  it("old top-level shape still works after a valid signature", async () => {
    const t = setup();
    const res = await handleInboundEmail(
      signed({
        from: "Jane Customer <jane.customer@example.com>",
        to: ["support+appa@mail.guddesk.com"],
        subject: "Old",
        text: "Private customer text",
        headers: { "In-Reply-To": "<x@y>" },
      }),
      t.deps,
    );
    assert.equal(res.status, 200);
    assert.equal(t.fetched.length, 0);
    assert.equal(t.customer[0].from, "jane.customer@example.com");
    assert.equal(t.customer[0].fromName, "Jane Customer");
    assertCleanLogs(t.logs);
  });

  it("the old shape is not accepted unsigned", async () => {
    const t = setup();
    const res = await handleInboundEmail(
      { headers: new Headers(), rawBody: JSON.stringify({ from: "a@b.test", to: ["support+appa@x.test"], text: "t" }) },
      t.deps,
    );
    assert.equal(res.status, 401);
    assert.equal(t.customer.length, 0);
  });

  it("ignores other event types with a 200", async () => {
    const t = setup();
    const res = await handleInboundEmail(signed({ type: "email.delivered", data: {} }), t.deps);
    assert.deepEqual(res, { status: 200, body: { ignored: "event_type" } });
  });
});

describe("POST /api/email/inbound: agent-reply checks", () => {
  async function agentReply(from: string, conversationId: string, dmarc = "pass") {
    const t = setup();
    t.received.em_2 = agentEmail(from, conversationId, dmarc);
    const res = await handleInboundEmail(signed(receivedEvent("em_2", [`reply+${conversationId}@mail.guddesk.com`])), t.deps);
    return { t, res };
  }

  it("cross-workspace conversation id: a member of another workspace can't post", async () => {
    const { t, res } = await agentReply("agent@acme.test", "convb");
    assert.deepEqual(res, { status: 200, body: { ignored: "sender_not_member" } });
    assert.equal(t.messages.length, 0);
    assert.equal(t.customer.length, 0, "not filed as a customer message either");
    assertCleanLogs(t.logs);
  });

  it("removed member: ignored", async () => {
    const { t, res } = await agentReply("removed@acme.test", "conva");
    assert.deepEqual(res.body, { ignored: "sender_not_member" });
    assert.equal(t.messages.length + t.customer.length, 0);
  });

  it("banned user: ignored", async () => {
    const { t, res } = await agentReply("banned@acme.test", "conva");
    assert.deepEqual(res.body, { ignored: "sender_not_member" });
    assert.equal(t.messages.length, 0);
  });

  it("unknown sender: ignored, not posted as a visitor", async () => {
    const { t, res } = await agentReply("stranger@example.com", "conva");
    assert.deepEqual(res.body, { ignored: "sender_not_member" });
    assert.equal(t.messages.length + t.customer.length, 0);
  });

  it("unknown conversation: ignored", async () => {
    const { t, res } = await agentReply("agent@acme.test", "nosuch");
    assert.deepEqual(res.body, { ignored: "unknown_conversation" });
    assert.equal(t.messages.length, 0);
  });

  it("a forged From that fails DMARC: ignored", async () => {
    const { t, res } = await agentReply("agent@acme.test", "conva", "fail");
    assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    assert.equal(t.messages.length, 0);
  });
});

describe("payload and route", () => {
  it("parses the current Resend shape", () => {
    assert.deepEqual(
      parseInboundPayload({ type: "email.received", data: { email_id: "e", to: ["a@b"], received_for: ["c@d"] } }),
      { kind: "received", emailId: "e", recipients: ["a@b", "c@d"] },
    );
    assert.deepEqual(parseInboundPayload({ type: "email.received", data: {} }), { kind: "invalid" });
  });

  it("route reads the raw body and never parses JSON itself", () => {
    const route = readFileSync(join(__dirname, "..", "..", "app", "api", "email", "inbound", "route.ts"), "utf8");
    assert.match(route, /const rawBody = await req\.text\(\);/);
    assert.ok(!/req\.json\(/.test(route));
    assert.match(route, /secret: env\.RESEND_WEBHOOK_SECRET/);
  });
});
