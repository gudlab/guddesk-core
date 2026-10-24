import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { InboundPayload } from "../channels/types";
import { handleInboundEmail, senderAuthenticated, type InboundDb, type InboundDeps } from "./handler";
import { htmlToText, parseInboundPayload } from "./payload";
import { DONE, FINISHED_TTL_MS, IN_FLIGHT_TTL_MS, PROCESSING, replayKey, sweepExpiredWebhookIds } from "./replay";
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
  const tokens = new Map<string, { identifier: string; expires: Date }>();
  const disabledChannels = new Set<string>();
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
    { id: "conva", workspaceId: "ws_a", status: "CLOSED", channel: "EMAIL", firstResponseAt: null },
    { id: "convb", workspaceId: "ws_b", status: "OPEN", channel: "EMAIL", firstResponseAt: null },
    { id: "convchat", workspaceId: "ws_a", status: "OPEN", channel: "WIDGET", firstResponseAt: null },
  ];
  const db = {
    verificationToken: {
      async updateMany({ where, data }: { where: { token: string; expires?: { lte: Date } }; data: { identifier: string; expires: Date } }) {
        const current = tokens.get(where.token);
        if (current && (!where.expires || current.expires <= where.expires.lte)) {
          tokens.set(where.token, { ...data });
          return { count: 1 };
        }
        return { count: 0 };
      },
      async create({ data }: { data: { identifier: string; token: string; expires: Date } }) {
        if (tokens.has(data.token)) throw Object.assign(new Error("unique"), { code: "P2002" });
        tokens.set(data.token, { identifier: data.identifier, expires: data.expires });
        return data;
      },
      async findUnique({ where }: { where: { token: string } }) {
        const row = tokens.get(where.token);
        return row ? { identifier: row.identifier } : null;
      },
      async deleteMany({ where }: { where: { token: string | { startsWith: string }; expires?: { lt: Date } } }) {
        let count = 0;
        for (const [token, row] of [...tokens]) {
          const match =
            typeof where.token === "string"
              ? token === where.token
              : token.startsWith(where.token.startsWith) && (!where.expires || row.expires < where.expires.lt);
          if (match) {
            tokens.delete(token);
            count++;
          }
        }
        return { count };
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
      async findUnique({ where }: { where: { workspaceId: string } }) {
        return { isEnabled: !disabledChannels.has(where.workspaceId) };
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
  return { db: db as unknown as InboundDb, tokens, messages, conversationUpdates, messageLookups, disabledChannels };
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

const agentEmail = (from: string, conversationId: string, dmarc = "pass", dkim = "pass") => ({
  ...customerEmail,
  id: "em_2",
  from,
  to: [`reply+${conversationId}@mail.guddesk.com`],
  text: "Agent reply text",
  headers: { from },
  authentication: { spf: "pass", dkim, dmarc },
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

  it("replayed id: a finished id is a 200 no-op, kept for days", async () => {
    const t = setup();
    t.received.em_1 = customerEmail;
    const request = signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"]), { id: "msg_replay" });
    const first = await handleInboundEmail(request, t.deps);
    const second = await handleInboundEmail(request, t.deps);
    assert.equal(first.status, 200);
    assert.deepEqual(second, { status: 200, body: { ignored: "replayed_id" } });
    assert.equal(t.customer.length, 1);
    assert.equal(t.fetched.length, 1);
    const row = t.tokens.get(replayKey("msg_replay"));
    assert.equal(row?.identifier, DONE);
    assert.equal(row?.expires.getTime(), NOW.getTime() + FINISHED_TTL_MS);
    assert.ok(FINISHED_TTL_MS >= 2 * 24 * 60 * 60 * 1000, "longer than Svix's ~27 h of retries");
    assert.match(t.logs.at(-1) ?? "", /ignored reason=replayed_id svix_id=msg_replay/);
  });

  it("a duplicate while the first attempt is still running gets a 409, so Svix retries", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const t = setup({
      async fetchReceivedEmail() {
        await gate;
        return customerEmail;
      },
    });
    const request = signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"]), { id: "msg_slow" });
    const first = handleInboundEmail(request, t.deps);
    await new Promise((resolve) => setImmediate(resolve));
    const row = t.tokens.get(replayKey("msg_slow"));
    assert.equal(row?.identifier, PROCESSING);
    assert.equal(row?.expires.getTime(), NOW.getTime() + IN_FLIGHT_TTL_MS);
    const duplicate = await handleInboundEmail(request, t.deps);
    assert.equal(duplicate.status, 409);
    assert.match(t.logs.at(-1) ?? "", /deferred reason=in_flight svix_id=msg_slow/);
    release();
    assert.equal((await first).status, 200);
    assert.deepEqual(await handleInboundEmail(request, t.deps), { status: 200, body: { ignored: "replayed_id" } });
    assert.equal(t.customer.length, 1);
  });

  it("a hung receiving.get times out: 500 and the id is freed", async () => {
    const t = setup({ fetchTimeoutMs: 20, fetchReceivedEmail: () => new Promise(() => {}) });
    const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@x.test"]), { id: "msg_hang" }), t.deps);
    assert.equal(res.status, 500);
    assert.match(t.logs[0], /failed reason=processing_error error=timeout svix_id=msg_hang/);
    assert.equal(t.tokens.size, 0);
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

  it("the sweep deletes only expired inbound:svix rows", async () => {
    const t = setup();
    const past = new Date(NOW.getTime() - 1000);
    const future = new Date(NOW.getTime() + 1000);
    t.tokens.set(replayKey("old"), { identifier: DONE, expires: past });
    t.tokens.set(replayKey("live"), { identifier: DONE, expires: future });
    t.tokens.set("throttle:sla:ws_a", { identifier: "throttle:sla:ws_a", expires: past });
    assert.equal(await sweepExpiredWebhookIds(t.db, NOW), 1);
    assert.deepEqual([...t.tokens.keys()].sort(), [replayKey("live"), "throttle:sla:ws_a"].sort());
    const cron = readFileSync(join(__dirname, "..", "..", "app", "api", "cron", "sla-check", "route.ts"), "utf8");
    assert.match(cron, /sweepExpiredWebhookIds\(prisma\)/);
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

describe("POST /api/email/inbound: reply+ address", () => {
  async function replyTo(from: string, conversationId: string, dmarc = "pass", dkim = "pass", prep?: (t: ReturnType<typeof setup>) => void) {
    const t = setup();
    prep?.(t);
    t.received.em_2 = agentEmail(from, conversationId, dmarc, dkim);
    const res = await handleInboundEmail(signed(receivedEvent("em_2", [`reply+${conversationId}@mail.guddesk.com`])), t.deps);
    return { t, res };
  }

  it("member with DMARC pass: agent reply", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva");
    assert.equal(res.status, 200);
    assert.equal(t.messages[0].type, "AGENT");
  });

  it("member with gray DMARC (none) and DKIM pass: agent reply", async () => {
    const { t } = await replyTo("agent@acme.test", "conva", "none", "pass");
    assert.equal(t.messages[0].type, "AGENT");
  });

  it("member with DMARC fail: ignored as a spoof, not filed as anything", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "fail", "pass");
    assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    assert.equal(t.messages.length + t.customer.length, 0);
    assertCleanLogs(t.logs);
  });

  it("member with gray DMARC and no DKIM pass: ignored as a spoof", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "none", "fail");
    assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    assert.equal(t.messages.length, 0);
  });

  it("member through the legacy shape (no auth results): ignored as a spoof", async () => {
    const t = setup();
    const res = await handleInboundEmail(
      signed({ from: "agent@acme.test", to: ["reply+conva@mail.guddesk.com"], text: "Agent reply text" }),
      t.deps,
    );
    assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    assert.equal(t.messages.length, 0);
  });

  it("the customer's usual address: filed as a customer message in that conversation", async () => {
    const { t, res } = await replyTo("Jane.Customer@example.com", "conva", "none", "none");
    assert.equal(res.status, 200);
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "VISITOR");
    assert.equal(t.messages[0].conversationId, "conva");
    assert.equal(t.messages[0].senderId, null);
    const update = t.conversationUpdates[0] as { data: Record<string, unknown> };
    assert.equal(update.data.status, "OPEN", "a closed conversation reopens");
    assert.equal(update.data.firstResponseAt, undefined, "a customer message is not a first response");
    assertCleanLogs(t.logs);
  });

  it("a stranger: filed as a customer message, never as an agent", async () => {
    const { t } = await replyTo("stranger@example.com", "conva");
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "VISITOR");
  });

  it("a member of another workspace (cross-workspace id): a customer message, never an agent", async () => {
    const { t } = await replyTo("agent@acme.test", "convb");
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "VISITOR");
    assert.equal(t.messages[0].senderId, null);
  });

  it("a removed member: no longer a member, so a customer message", async () => {
    const { t } = await replyTo("removed@acme.test", "conva");
    assert.equal(t.messages[0].type, "VISITOR");
  });

  it("a banned member: ignored", async () => {
    const { t, res } = await replyTo("banned@acme.test", "conva");
    assert.deepEqual(res.body, { ignored: "sender_banned" });
    assert.equal(t.messages.length, 0);
  });

  /** A customer reply that can't be filed: 422 with a reason, logged, svix-id freed for the retry. */
  function assertUnfiled(t: ReturnType<typeof setup>, res: { status: number; body: unknown }, reason: string) {
    assert.equal(res.status, 422);
    assert.deepEqual(res.body, { error: "Customer reply not filed", reason });
    assert.equal(t.messages.length, 0);
    assert.equal(t.tokens.size, 0, "svix-id released so Svix's retry is processed");
    assert.equal(t.logs.length, 1);
    assert.equal(t.logs[0], `[inbound-email] unfiled reason=${reason} svix_id=msg_2abc`);
    assertCleanLogs(t.logs);
  }

  it("a non-email-channel conversation: the customer reply is not dropped (422, retried)", async () => {
    const { t, res } = await replyTo("stranger@example.com", "convchat");
    assertUnfiled(t, res, "not_email_conversation");
  });

  it("email channel turned off: 422, and the retry files it once the channel is back on", async () => {
    const { t, res } = await replyTo("jane.customer@example.com", "conva", "pass", "pass", (x) => x.disabledChannels.add("ws_a"));
    assertUnfiled(t, res, "channel_disabled");
    t.disabledChannels.delete("ws_a");
    const retry = await handleInboundEmail(signed(receivedEvent("em_2", ["reply+conva@mail.guddesk.com"])), t.deps);
    assert.equal(retry.status, 200);
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "VISITOR");
  });

  it("unknown conversation: 422, not dropped", async () => {
    const { t, res } = await replyTo("jane.customer@example.com", "nosuch");
    assertUnfiled(t, res, "unknown_conversation");
  });

  it("a database failure while filing: 500, logged without details, svix-id freed", async () => {
    const { t, res } = await replyTo("jane.customer@example.com", "conva", "pass", "pass", (x) => {
      (x.db as unknown as { message: { create: () => Promise<never> } }).message.create = async () => {
        throw Object.assign(new Error("connection lost for jane.customer@example.com"), { name: "PrismaClientKnownRequestError" });
      };
    });
    assert.equal(res.status, 500);
    assert.equal(t.tokens.size, 0);
    assert.equal(t.logs.length, 1);
    assert.equal(t.logs[0], "[inbound-email] failed reason=processing_error error=PrismaClientKnownRequestError svix_id=msg_2abc");
    assertCleanLogs(t.logs);
  });

  it("a failed Resend fetch for a customer reply: 500, svix-id freed", async () => {
    const t = setup();
    const res = await handleInboundEmail(signed(receivedEvent("em_missing", ["reply+conva@mail.guddesk.com"])), t.deps);
    assert.equal(res.status, 500);
    assert.equal(t.tokens.size, 0);
    assert.equal(t.logs.length, 1);
    assert.match(t.logs[0], /^\[inbound-email\] failed reason=processing_error error=\w+ svix_id=msg_2abc$/);
  });

  it("senderAuthenticated: DMARC pass, or gray DMARC plus DKIM pass", () => {
    assert.equal(senderAuthenticated({ dmarc: "pass" }), true);
    assert.equal(senderAuthenticated({ dmarc: "none", dkim: "pass" }), true);
    assert.equal(senderAuthenticated({ dmarc: "temperror", dkim: "pass" }), true);
    assert.equal(senderAuthenticated({ dkim: "pass" }), true);
    assert.equal(senderAuthenticated({ dmarc: "fail", dkim: "pass" }), false);
    assert.equal(senderAuthenticated({ dmarc: "none", dkim: "fail" }), false);
    assert.equal(senderAuthenticated({}), false);
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
