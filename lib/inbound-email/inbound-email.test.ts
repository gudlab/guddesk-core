import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { InboundPayload } from "../channels/types";
import { BOUNCE_WINDOW_MS, bounceKey, unverifiedReplyEmail } from "./bounce";
import {
  handleInboundEmail,
  senderAuthenticated,
  type InboundDb,
  type InboundDeps,
  type UnverifiedReplyBounce,
} from "./handler";
import { htmlToText, parseInboundPayload } from "./payload";
import { DONE, FINISHED_TTL_MS, IN_FLIGHT_TTL_MS, PROCESSING, replayKey, sweepExpiredWebhookIds } from "./replay";
import { forwardedSenderName, SENDER_NAME_MAX } from "./sender-name";
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
    { id: "conva", workspaceId: "ws_a", status: "CLOSED", channel: "EMAIL", firstResponseAt: null, visitor: { email: "jane.customer@example.com" } },
    { id: "convb", workspaceId: "ws_b", status: "OPEN", channel: "EMAIL", firstResponseAt: null, visitor: { email: "bob@globex.test" } },
    { id: "convchat", workspaceId: "ws_a", status: "OPEN", channel: "WIDGET", firstResponseAt: null, visitor: { email: null } },
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
  const bounces: UnverifiedReplyBounce[] = [];
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
    async sendUnverifiedReplyBounce(bounce) {
      bounces.push(bounce);
      return true;
    },
    ...overrides,
  };
  return { ...store, logs, customer, fetched, broadcasts, bounces, received, deps };
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

  it("a database error on the claim: 500 with one reason-coded line, no stack", async () => {
    const t = setup();
    (t.db as unknown as { verificationToken: { updateMany: () => Promise<never> } }).verificationToken.updateMany = async () => {
      throw Object.assign(new Error("Can't reach database server at db.internal for jane@example.com"), {
        name: "PrismaClientInitializationError",
      });
    };
    const res = await handleInboundEmail(signed(receivedEvent("em_1", ["support+appa@mail.guddesk.com"])), t.deps);
    assert.deepEqual(res, { status: 500, body: { error: "Failed to process inbound email" } });
    assert.deepEqual(t.logs, ["[inbound-email] failed reason=claim_error error=PrismaClientInitializationError svix_id=msg_2abc"]);
    assert.equal(t.fetched.length, 0);
  });

  it("the sweep deletes only expired inbound rows (replay ids and bounce limits)", async () => {
    const t = setup();
    const past = new Date(NOW.getTime() - 1000);
    const future = new Date(NOW.getTime() + 1000);
    t.tokens.set(replayKey("old"), { identifier: DONE, expires: past });
    t.tokens.set(replayKey("live"), { identifier: DONE, expires: future });
    t.tokens.set(bounceKey("u_agent", "conva"), { identifier: "inbound:bounce:", expires: past });
    t.tokens.set("throttle:sla:ws_a", { identifier: "throttle:sla:ws_a", expires: past });
    assert.equal(await sweepExpiredWebhookIds(t.db, NOW), 2);
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
    // support+ threading is unchanged: no keepVisitor, so it still updates the visitor.
    assert.ok(!("keepVisitor" in t.customer[0]));
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

  /** A member's reply that failed the checks: not posted, one agent-only note, one bounce to the account address. */
  function assertUnverified(t: ReturnType<typeof setup>, res: { status: number; body: unknown }) {
    assert.deepEqual(res, { status: 200, body: { ignored: "sender_not_authenticated" } });
    assert.equal(t.customer.length, 0, "never filed as a customer message");
    assert.equal(t.messages.length, 1);
    assert.equal(t.messages[0].type, "NOTE", "agents only");
    assert.equal(t.messages[0].conversationId, "conva");
    assert.equal(t.messages[0].senderId, null);
    assert.match(String(t.messages[0].body), /An email reply from Ada Agent couldn't be verified \(DMARC\/DKIM\), so it wasn't posted\./);
    assert.ok(!String(t.messages[0].body).includes("Agent reply text"));
    assert.ok(!String(t.messages[0].body).includes("@"));
    assert.deepEqual(t.bounces, [
      { to: "agent@acme.test", memberName: "Ada Agent", conversationId: "conva", workspaceId: "ws_a" },
    ]);
    assert.deepEqual(t.logs, ["[inbound-email] ignored reason=sender_not_authenticated notice=posted bounce=sent svix_id=msg_2abc"]);
    assertCleanLogs(t.logs);
  }

  it("member with DMARC fail: not posted; agent-only note and a bounce to the member", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "fail", "pass");
    assertUnverified(t, res);
  });

  it("member with gray DMARC and no DKIM pass: not posted; note and bounce", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "none", "fail");
    assertUnverified(t, res);
  });

  it("member through the legacy shape (no auth results): not posted; note and bounce", async () => {
    const t = setup();
    const res = await handleInboundEmail(
      signed({ from: "agent@acme.test", to: ["reply+conva@mail.guddesk.com"], text: "Agent reply text" }),
      t.deps,
    );
    assertUnverified(t, res);
  });

  it("a display-name spoof of a member ('Name <member@...>') is matched on the address: not filed as a customer", async () => {
    const t = setup();
    t.received.em_2 = {
      ...agentEmail("Ada Agent <agent@acme.test>", "conva", "fail", "fail"),
      from: "Ada Agent <agent@acme.test>",
    };
    const res = await handleInboundEmail(signed(receivedEvent("em_2", ["reply+conva@mail.guddesk.com"])), t.deps);
    assertUnverified(t, res);
  });

  it("the note and bounce go out at most once per member per conversation per hour", async () => {
    const t = setup();
    t.received.em_2 = agentEmail("agent@acme.test", "conva", "fail", "fail");
    const event = receivedEvent("em_2", ["reply+conva@mail.guddesk.com"]);
    for (const id of ["msg_s1", "msg_s2", "msg_s3"]) {
      const res = await handleInboundEmail(signed(event, { id }), t.deps);
      assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    }
    assert.equal(t.messages.length, 1);
    assert.equal(t.bounces.length, 1);
    assert.match(t.logs[1], /^\[inbound-email\] ignored reason=sender_not_authenticated notice=rate_limited svix_id=msg_s2$/);
    assert.equal(t.tokens.get(bounceKey("u_agent", "conva"))?.expires.getTime(), NOW.getTime() + BOUNCE_WINDOW_MS);
    // An hour later, another one may go out.
    const later = new Date(NOW.getTime() + BOUNCE_WINDOW_MS);
    t.deps.now = () => later;
    await handleInboundEmail(signed(event, { id: "msg_s4", ts: String(Math.floor(later.getTime() / 1000)) }), t.deps);
    assert.equal(t.messages.length, 2);
    assert.equal(t.bounces.length, 2);
  });

  it("a bounce that fails to send is logged; still a 200 and the note stays", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "fail", "fail", (x) => {
      x.deps.sendUnverifiedReplyBounce = async () => false;
    });
    assert.deepEqual(res.body, { ignored: "sender_not_authenticated" });
    assert.equal(t.messages.length, 1);
    assert.match(t.logs[0], /notice=posted bounce=failed/);
  });

  it("a database failure saving the note: 500, and both the svix-id and the bounce slot are freed", async () => {
    const { t, res } = await replyTo("agent@acme.test", "conva", "fail", "fail", (x) => {
      (x.db as unknown as { message: { create: () => Promise<never> } }).message.create = async () => {
        throw Object.assign(new Error("db down"), { name: "PrismaClientKnownRequestError" });
      };
    });
    assert.equal(res.status, 500);
    assert.equal(t.tokens.size, 0);
    assert.equal(t.bounces.length, 0);
  });

  it("the bounce email never includes the original body", () => {
    const email = unverifiedReplyEmail({ memberName: "Ada <b>", inboxUrl: "https://app.test/workspace/acme/inbox?c=conva" });
    assert.equal(email.subject, "Your email reply wasn't posted");
    assert.match(email.text, /couldn't be verified \(DMARC\/DKIM\), so it wasn't posted/);
    assert.match(email.text, /https:\/\/app\.test\/workspace\/acme\/inbox\?c=conva/);
    assert.match(email.html, /Ada &lt;b&gt;/);
    assert.ok(!email.html.includes("<b>"));
  });

  /** Filed through the email channel's own customer path, threaded onto the conversation. */
  function assertCustomerReply(t: ReturnType<typeof setup>, from: string, fromName?: string) {
    assert.equal(t.messages.length, 0, "not written here: the channel's path writes it");
    assert.equal(t.customer.length, 1);
    assert.deepEqual(t.customer[0], {
      workspaceId: "ws_a",
      from,
      fromName,
      subject: "Help",
      body: "Agent reply text",
      threadId: "conva",
      keepVisitor: true,
    });
  }

  it("the customer's usual address: filed through the customer path, threaded onto that conversation", async () => {
    const { t, res } = await replyTo("Jane.Customer@example.com", "conva", "none", "none");
    assert.equal(res.status, 200);
    assertCustomerReply(t, "Jane.Customer@example.com");
    assert.equal(t.bounces.length, 0);
    assertCleanLogs(t.logs);
  });

  it("a stranger: a customer message, never an agent", async () => {
    const { t } = await replyTo("stranger@example.com", "conva");
    assertCustomerReply(t, "stranger@example.com", "stranger@example.com");
  });

  it("a forwarded sender is filed on the conversation without replacing its visitor (keepVisitor)", async () => {
    const { t } = await replyTo("colleague@forwarded.example", "conva");
    assertCustomerReply(t, "colleague@forwarded.example", "colleague@forwarded.example");
    assert.equal(t.customer[0].keepVisitor, true);
  });

  /** A reply+ customer email with a From header that has a display name. */
  async function replyWithName(fromHeader: string, bareFrom: string) {
    const t = setup();
    t.received.em_2 = { ...agentEmail(bareFrom, "conva"), headers: { from: fromHeader } };
    await handleInboundEmail(signed(receivedEvent("em_2", ["reply+conva@mail.guddesk.com"])), t.deps);
    assert.equal(t.customer.length, 1);
    return t.customer[0];
  }

  it("senderName: a forwarded sender with a display name is 'Name (address)'", async () => {
    const filed = await replyWithName("Colin Colleague <colin@forwarded.example>", "colin@forwarded.example");
    assert.equal(filed.fromName, "Colin Colleague (colin@forwarded.example)");
    assert.equal(filed.from, "colin@forwarded.example");
  });

  it("senderName: a forwarded sender without a display name is just the address", async () => {
    const { t } = await replyTo("colleague@forwarded.example", "conva");
    assert.equal(t.customer[0].fromName, "colleague@forwarded.example");
  });

  it("senderName: the visitor's own reply keeps its usual name", async () => {
    const filed = await replyWithName("Jane Customer <jane.customer@example.com>", "jane.customer@example.com");
    assert.equal(filed.fromName, "Jane Customer");
  });

  it("senderName: the visitor match ignores case", async () => {
    const filed = await replyWithName("Jane C <JANE.Customer@Example.COM>", "JANE.Customer@Example.COM");
    assert.equal(filed.fromName, "Jane C");
    assert.equal(forwardedSenderName({ from: "Jane.Customer@EXAMPLE.com" }, "jane.customer@example.com"), null);
    assert.equal(forwardedSenderName({ from: "jane.customer@example.com" }, "Jane <JANE.CUSTOMER@example.com>"), null);
  });

  it("senderName: CR/LF and control characters in the display name are stripped", () => {
    assert.equal(
      forwardedSenderName({ from: "colin@forwarded.example", fromName: "Colin\r\nBcc: x\u0000\u0007 Colleague\t" }, "jane.customer@example.com"),
      "Colin Bcc: x Colleague (colin@forwarded.example)",
    );
    assert.equal(forwardedSenderName({ from: "colin@forwarded.example", fromName: "\r\n\u0000" }, "jane@x.test"), "colin@forwarded.example");
  });

  it("senderName: a display name with '(other@x)' can't pose as another address; the real one is shown", async () => {
    const filed = await replyWithName(
      '"Jane Customer (jane.customer@example.com)" <mallory@evil.example>',
      "mallory@evil.example",
    );
    assert.equal(filed.fromName, "Jane Customer (mallory@evil.example)");
    assert.equal(
      forwardedSenderName({ from: "mallory@evil.example", fromName: "jane.customer@example.com <jane.customer@example.com>" }, "jane.customer@example.com"),
      "mallory@evil.example",
    );
  });

  it("senderName: capped, always keeping the real address", () => {
    const name = forwardedSenderName({ from: "colin@forwarded.example", fromName: "A".repeat(500) }, "jane@x.test") ?? "";
    assert.equal(name.length, SENDER_NAME_MAX);
    assert.ok(name.endsWith(" (colin@forwarded.example)"));
  });

  it("a member of another workspace (cross-workspace id): a customer message, never an agent", async () => {
    const { t } = await replyTo("agent@acme.test", "convb");
    assert.equal(t.messages.length, 0);
    assert.equal(t.customer.length, 1);
    assert.equal(t.customer[0].workspaceId, "ws_b");
    assert.equal(t.customer[0].threadId, "convb");
  });

  it("a removed member: no longer a member, so a customer message", async () => {
    const { t } = await replyTo("removed@acme.test", "conva");
    assertCustomerReply(t, "removed@acme.test", "removed@acme.test");
  });

  it("a banned member: ignored, with no note and no bounce", async () => {
    for (const dmarc of ["pass", "fail"]) {
      const { t, res } = await replyTo("banned@acme.test", "conva", dmarc, dmarc);
      assert.deepEqual(res.body, { ignored: "sender_banned" });
      assert.equal(t.messages.length + t.customer.length + t.bounces.length, 0);
    }
  });

  /** A customer reply that can't be filed: 422 with a reason, logged, svix-id freed for the retry. */
  function assertUnfiled(t: ReturnType<typeof setup>, res: { status: number; body: unknown }, reason: string) {
    assert.equal(res.status, 422);
    assert.deepEqual(res.body, { error: "Customer reply not filed", reason });
    assert.equal(t.messages.length + t.customer.length, 0);
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
    assert.equal(t.customer.length, 1);
    assert.equal(t.customer[0].threadId, "conva");
  });

  it("unknown conversation: 200 ignored before any Resend fetch (a retry can't help)", async () => {
    const { t, res } = await replyTo("jane.customer@example.com", "nosuch");
    assert.deepEqual(res, { status: 200, body: { ignored: "unknown_conversation" } });
    assert.equal(t.fetched.length, 0, "looked up before receiving.get");
    assert.equal(t.messages.length + t.customer.length, 0);
    assert.deepEqual(t.logs, ["[inbound-email] ignored reason=unknown_conversation svix_id=msg_2abc"]);
  });

  it("unknown conversation through the legacy shape: 200 ignored too", async () => {
    const t = setup();
    const res = await handleInboundEmail(
      signed({ from: "jane.customer@example.com", to: ["reply+nosuch@mail.guddesk.com"], text: "Private customer text" }),
      t.deps,
    );
    assert.deepEqual(res.body, { ignored: "unknown_conversation" });
  });

  it("a database failure while filing: 500, logged without details, svix-id freed", async () => {
    const { t, res } = await replyTo("jane.customer@example.com", "conva", "pass", "pass", (x) => {
      x.deps.handleCustomerInbound = async () => {
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
