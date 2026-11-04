import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canAcceptInvitation,
  conversationBanner,
  getConversationBanner,
  getSeatDecision,
  monthKeyUtc,
  monthStartUtc,
  seatLimitMessage,
  type LimitsForPlan,
  type PlanLimitsDb,
} from "./plan-limits";

// Same numbers as PLAN_LIMITS in lib/feature-flags.ts. That module imports
// the Prisma client, so the tests pass the limits in instead.
const limitsFor: LimitsForPlan = (plan) =>
  plan === "PRO"
    ? { maxSeats: Infinity, maxConversationsPerMonth: Infinity }
    : { maxSeats: 2, maxConversationsPerMonth: 500 };

type Where = Record<string, unknown>;

interface FakeData {
  plan: string;
  members: number;
  invitations: Array<{ status: string; expiresAt: Date }>;
  conversations: Date[];
}

/**
 * In-memory stand-in for the Prisma client. It evaluates the where clauses
 * the code sends, so a wrong filter shows up as a wrong count, and it
 * records every call so the tests can check nothing was written.
 */
function fakeDb(data: FakeData, workspaceId = "ws_1") {
  const calls: Array<{ model: string; method: string; where: Where }> = [];
  const forWorkspace = (where: Where) => where.workspaceId === workspaceId;

  const db: PlanLimitsDb = {
    workspace: {
      async findUnique(args) {
        calls.push({ model: "workspace", method: "findUnique", where: args.where });
        return args.where.id === workspaceId ? { plan: data.plan } : null;
      },
    },
    workspaceMember: {
      async count({ where }) {
        calls.push({ model: "workspaceMember", method: "count", where });
        return forWorkspace(where) ? data.members : 0;
      },
    },
    workspaceInvitation: {
      async count({ where }) {
        calls.push({ model: "workspaceInvitation", method: "count", where });
        if (!forWorkspace(where)) return 0;
        const gt = (where.expiresAt as { gt: Date }).gt;
        return data.invitations.filter(
          (i) => i.status === where.status && i.expiresAt > gt,
        ).length;
      },
    },
    conversation: {
      async count({ where }) {
        calls.push({ model: "conversation", method: "count", where });
        if (!forWorkspace(where)) return 0;
        const gte = (where.createdAt as { gte: Date }).gte;
        return data.conversations.filter((d) => d >= gte).length;
      },
    },
  };
  return { db, calls };
}

const NOW = new Date("2026-10-20T08:00:00Z");
const NEXT_WEEK = new Date("2026-10-27T08:00:00Z");
const YESTERDAY = new Date("2026-10-19T08:00:00Z");

describe("seat limit for new invitations", () => {
  it("allows the first invite on FREE with one member", async () => {
    const { db } = fakeDb({ plan: "FREE", members: 1, invitations: [], conversations: [] });
    const seats = await getSeatDecision(db, limitsFor, "ws_1", NOW);
    assert.equal(seats.allowed, true);
    assert.equal(seats.used, 1);
  });

  it("blocks FREE at 2 members", async () => {
    const { db } = fakeDb({ plan: "FREE", members: 2, invitations: [], conversations: [] });
    const seats = await getSeatDecision(db, limitsFor, "ws_1", NOW);
    assert.equal(seats.allowed, false);
    assert.equal(seats.used, 2);
    assert.equal(seats.maxSeats, 2);
  });

  it("counts pending invites as seats, but not expired or used ones", async () => {
    const { db } = fakeDb({
      plan: "FREE",
      members: 1,
      invitations: [
        { status: "PENDING", expiresAt: NEXT_WEEK },
        { status: "PENDING", expiresAt: YESTERDAY },
        { status: "ACCEPTED", expiresAt: NEXT_WEEK },
        { status: "EXPIRED", expiresAt: YESTERDAY },
      ],
      conversations: [],
    });
    const seats = await getSeatDecision(db, limitsFor, "ws_1", NOW);
    assert.equal(seats.pendingInvites, 1);
    assert.equal(seats.used, 2);
    assert.equal(seats.allowed, false);
  });

  it("frees the seat again once the pending invite expires", async () => {
    const { db } = fakeDb({
      plan: "FREE",
      members: 1,
      invitations: [{ status: "PENDING", expiresAt: YESTERDAY }],
      conversations: [],
    });
    assert.equal((await getSeatDecision(db, limitsFor, "ws_1", NOW)).allowed, true);
  });

  it("leaves PRO unlimited", async () => {
    const { db } = fakeDb({
      plan: "PRO",
      members: 40,
      invitations: [{ status: "PENDING", expiresAt: NEXT_WEEK }],
      conversations: [],
    });
    const seats = await getSeatDecision(db, limitsFor, "ws_1", NOW);
    assert.equal(seats.allowed, true);
    assert.equal(seats.maxSeats, Infinity);
  });

  it("grandfathers FREE workspaces already over the limit: blocked, nobody removed", async () => {
    const { db, calls } = fakeDb({ plan: "FREE", members: 5, invitations: [], conversations: [] });
    const seats = await getSeatDecision(db, limitsFor, "ws_1", NOW);
    assert.equal(seats.allowed, false);
    assert.equal(seats.members, 5);
    assert.ok(
      calls.every((c) => c.method === "count" || c.method === "findUnique"),
      "the check only reads",
    );
  });

  it("treats a missing workspace as FREE", async () => {
    const { db } = fakeDb({ plan: "PRO", members: 2, invitations: [], conversations: [] });
    const seats = await getSeatDecision(db, limitsFor, "ws_other", NOW);
    assert.equal(seats.plan, "FREE");
  });

  it("explains the limit in plain words", async () => {
    const { db } = fakeDb({
      plan: "FREE",
      members: 1,
      invitations: [{ status: "PENDING", expiresAt: NEXT_WEEK }],
      conversations: [],
    });
    const message = seatLimitMessage(await getSeatDecision(db, limitsFor, "ws_1", NOW));
    assert.equal(
      message,
      "The Free plan includes 2 seats, and this workspace is using 2 (members and pending invites). Upgrade to Pro to invite more people.",
    );
    assert.ok(!message.includes("\u2014"), "no em dash");
  });
});

describe("accepting invitations", () => {
  it("accepts a pending invitation even when the workspace is at or over the limit", async () => {
    const { db } = fakeDb({ plan: "FREE", members: 3, invitations: [], conversations: [] });
    assert.equal((await getSeatDecision(db, limitsFor, "ws_1", NOW)).allowed, false);
    assert.equal(canAcceptInvitation({ status: "PENDING", expiresAt: NEXT_WEEK }, NOW), true);
  });

  it("rejects used or expired invitations", () => {
    assert.equal(canAcceptInvitation({ status: "ACCEPTED", expiresAt: NEXT_WEEK }, NOW), false);
    assert.equal(canAcceptInvitation({ status: "PENDING", expiresAt: YESTERDAY }, NOW), false);
  });
});

describe("monthly conversation count", () => {
  it("starts the month at 00:00 UTC on the 1st", () => {
    assert.equal(monthStartUtc(NOW).toISOString(), "2026-10-01T00:00:00.000Z");
    assert.equal(
      monthStartUtc(new Date("2026-10-01T00:00:00.000Z")).toISOString(),
      "2026-10-01T00:00:00.000Z",
    );
    assert.equal(
      monthStartUtc(new Date("2026-09-30T23:59:59.999Z")).toISOString(),
      "2026-09-01T00:00:00.000Z",
    );
    // UTC is used whatever the server timezone is.
    assert.equal(
      monthStartUtc(new Date("2026-11-01T03:30:00Z")).toISOString(),
      "2026-11-01T00:00:00.000Z",
    );
    assert.equal(monthStartUtc(new Date("2027-01-15T12:00:00Z")).toISOString(), "2027-01-01T00:00:00.000Z");
    assert.equal(monthKeyUtc(NOW), "2026-10");
  });

  it("counts only conversations created since the UTC month start", async () => {
    const conversations = [
      new Date("2026-09-30T23:59:59.999Z"),
      new Date("2026-10-01T00:00:00.000Z"),
      new Date("2026-10-19T10:00:00Z"),
    ];
    // 400 this month (the 80% line) plus one from September.
    for (let i = 0; i < 398; i++) conversations.push(new Date("2026-10-10T00:00:00Z"));
    const { db, calls } = fakeDb({ plan: "FREE", members: 1, invitations: [], conversations });
    const banner = await getConversationBanner(db, limitsFor, "ws_1", NOW);
    assert.deepEqual(banner, { level: "warning", count: 400, limit: 500, monthKey: "2026-10" });
    const countCall = calls.find((c) => c.model === "conversation");
    assert.deepEqual(countCall?.where, {
      workspaceId: "ws_1",
      createdAt: { gte: new Date("2026-10-01T00:00:00.000Z") },
    });
  });

  it("doesn't run the count for PRO", async () => {
    const { db, calls } = fakeDb({ plan: "PRO", members: 1, invitations: [], conversations: [] });
    assert.equal(await getConversationBanner(db, limitsFor, "ws_1", NOW), null);
    assert.equal(calls.some((c) => c.model === "conversation"), false);
  });
});

describe("conversation banner thresholds", () => {
  it("shows nothing below 80%", () => {
    assert.equal(conversationBanner(500, 0, "2026-10"), null);
    assert.equal(conversationBanner(500, 399, "2026-10"), null);
  });

  it("warns from 80% up to and including the limit", () => {
    assert.equal(conversationBanner(500, 400, "2026-10")?.level, "warning");
    assert.equal(conversationBanner(500, 500, "2026-10")?.level, "warning");
  });

  it("is over only above the limit", () => {
    assert.equal(conversationBanner(500, 501, "2026-10")?.level, "over");
    assert.equal(conversationBanner(500, 5000, "2026-10")?.count, 5000);
  });

  it("never shows for unlimited plans", () => {
    assert.equal(conversationBanner(Infinity, 10_000, "2026-10"), null);
  });
});
