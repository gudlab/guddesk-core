import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACCEPT_FAILED_MESSAGE,
  ALREADY_MEMBER_MESSAGE,
  INVITATION_EXPIRED_MESSAGE,
  INVITATION_REVOKED_MESSAGE,
  INVITATION_TTL_MS,
  INVITATION_USED_MESSAGE,
  acceptInvitationErrorMessage,
  closedInvitationMessage,
  expireInvitation,
  type ExpireInvitationDb,
  acceptInvitationWithLock,
  canManageInvitations,
  createInvitationWithSeatLock,
  normalizeInviteEmail,
  revokePendingInvitation,
  splitInvitations,
  type InvitationDb,
  type InvitationTx,
  pendingInvitationLink,
} from "./invitations";
import type { LimitsForPlan } from "./plan-limits";

const limitsFor: LimitsForPlan = (plan) =>
  plan === "PRO"
    ? { maxSeats: Infinity, maxConversationsPerMonth: Infinity }
    : { maxSeats: 2, maxConversationsPerMonth: 500 };

const NOW = new Date("2026-10-20T08:00:00Z");
const NEXT_WEEK = new Date("2026-10-27T08:00:00Z");
const YESTERDAY = new Date("2026-10-19T08:00:00Z");

type Invite = {
  id: string;
  workspaceId: string;
  email: string;
  status: string;
  expiresAt: Date;
  token: string;
};
type Member = { workspaceId: string; userId: string };
type User = { id: string; email: string };

/** Lets other pending async work run, like a database round trip. */
const roundTrip = () => new Promise<void>((resolve) => setImmediate(resolve));

/**
 * In-memory Prisma stand-in with a working advisory lock. `$executeRaw`
 * with pg_advisory_xact_lock waits until no other transaction holds the
 * same key and keeps it until the transaction callback finishes. Every
 * query yields first, so parallel transactions interleave the way they
 * would against Postgres. `lockWorks: false` turns the lock into a no-op
 * to show the test catches the race.
 */
function fakeDb(
  state: { plan: string; members: Member[]; invites: Invite[]; users?: User[] },
  options: { lockWorks?: boolean } = {},
) {
  const lockWorks = options.lockWorks ?? true;
  const log: string[] = [];
  const held = new Map<string, Promise<void>>();
  let nextId = 1;

  const matches = (row: Record<string, unknown>, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, cond]) => {
      const value = row[key];
      if (cond && typeof cond === "object" && !(cond instanceof Date)) {
        const c = cond as { gt?: Date; lte?: Date; equals?: string; mode?: string };
        if (c.equals !== undefined) {
          // Prisma's mode: "insensitive" compares without case.
          return c.mode === "insensitive"
            ? String(value).toLowerCase() === c.equals.toLowerCase()
            : value === c.equals;
        }
        if (c.gt && !((value as Date) > c.gt)) return false;
        if (c.lte && !((value as Date) <= c.lte)) return false;
        return true;
      }
      return value === cond;
    });

  function makeTx(txId: number, release: { fn: (() => void) | null; key?: string }) {
    const step = async (name: string) => {
      log.push(`${txId}:${name}`);
      await roundTrip();
    };
    const tx: InvitationTx = {
      async $executeRaw(strings, ...values) {
        await step("lock");
        const sql = strings.join("?");
        assert.match(sql, /^SELECT pg_advisory_xact_lock\(hashtext\(\?\)\)$/);
        const key = String(values[0]);
        if (!lockWorks) return 1;
        while (held.has(key)) await held.get(key);
        let done!: () => void;
        held.set(key, new Promise<void>((resolve) => (done = resolve)));
        release.key = key;
        release.fn = () => {
          held.delete(key);
          done();
        };
        return 1;
      },
      user: {
        async findFirst({ where }) {
          await step("user.findFirst");
          const found = (state.users ?? []).find((u) => matches(u, where));
          return found ? { id: found.id } : null;
        },
      },
      workspace: {
        async findUnique() {
          await step("workspace.findUnique");
          return { plan: state.plan };
        },
      },
      conversation: {
        async count() {
          await step("conversation.count");
          return 0;
        },
      },
      workspaceMember: {
        async count({ where }) {
          await step("member.count");
          return state.members.filter((m) => matches(m, where)).length;
        },
        async findUnique({ where }) {
          await step("member.findUnique");
          const { workspaceId, userId } = where.workspaceId_userId;
          const found = state.members.find((m) => m.workspaceId === workspaceId && m.userId === userId);
          return found ? { id: `${workspaceId}:${userId}` } : null;
        },
        async create({ data }) {
          await step("member.create");
          if (state.members.some((m) => m.workspaceId === data.workspaceId && m.userId === data.userId)) {
            throw new Error("Unique constraint failed on (workspaceId, userId)");
          }
          state.members.push({ workspaceId: data.workspaceId, userId: data.userId });
          return {};
        },
      },
      workspaceInvitation: {
        async count({ where }) {
          await step("invite.count");
          return state.invites.filter((i) => matches(i, where)).length;
        },
        async findFirst({ where }) {
          await step("invite.findFirst");
          const found = state.invites.find((i) => matches(i, where));
          return found ? { id: found.id, status: found.status } : null;
        },
        async deleteMany({ where }) {
          await step("invite.deleteMany");
          const before = state.invites.length;
          state.invites = state.invites.filter((i) => !matches(i, where));
          return { count: before - state.invites.length };
        },
        async findUnique({ where }) {
          await step("invite.findUnique");
          const found = state.invites.find((i) => i.token === where.token);
          return found ? { id: found.id, status: found.status, expiresAt: found.expiresAt } : null;
        },
        async create({ data }) {
          await step("invite.create");
          const id = `inv_${nextId++}`;
          state.invites.push({ ...data, id, status: "PENDING", token: `tok_${id}` });
          return { token: `tok_${id}` };
        },
        async updateMany({ where, data }) {
          await step("invite.updateMany");
          const rows = state.invites.filter((i) => matches(i, where));
          for (const row of rows) row.status = data.status;
          return { count: rows.length };
        },
      },
    };
    return tx;
  }

  let txCount = 0;
  const db: InvitationDb = {
    async $transaction(fn) {
      const txId = ++txCount;
      const release: { fn: (() => void) | null } = { fn: null };
      try {
        return await fn(makeTx(txId, release));
      } finally {
        log.push(`${txId}:end`);
        release.fn?.();
      }
    },
  };
  return { db, log, state };
}

const invite = (n: number, workspaceId = "ws_1") => ({
  workspaceId,
  email: `person${n}@example.com`,
  role: "AGENT",
  invitedById: "user_owner",
});

const livePending = (state: { invites: Invite[] }) =>
  state.invites.filter((i) => i.status === "PENDING" && i.expiresAt > NOW);

describe("createInvitationWithSeatLock", () => {
  it("takes the advisory lock first, before the duplicate check, the seat count and the create", async () => {
    const { db, log } = fakeDb({ plan: "FREE", members: [{ workspaceId: "ws_1", userId: "owner" }], invites: [] });
    const result = await createInvitationWithSeatLock(db, limitsFor, invite(1), NOW);
    assert.equal(result.status, "created");
    const steps = log.map((entry) => entry.split(":")[1]);
    assert.equal(steps[0], "lock");
    const at = (name: string) => steps.indexOf(name);
    assert.ok(at("lock") < at("invite.findFirst"));
    assert.ok(at("invite.findFirst") < at("member.count"));
    assert.ok(at("member.count") < at("invite.create"));
    assert.ok(at("invite.count") < at("invite.create"));
    assert.equal(steps.at(-1), "end", "everything ran inside the one transaction");
  });

  it("passes the workspace id as a bound parameter, not in the SQL text", async () => {
    let sql = "";
    let values: unknown[] = [];
    const { db } = fakeDb({ plan: "FREE", members: [], invites: [] });
    const spy: InvitationDb = {
      $transaction: (fn) =>
        db.$transaction((tx) =>
          fn({
            ...tx,
            $executeRaw: (strings, ...vals) => {
              sql = strings.join("$1");
              values = vals;
              return tx.$executeRaw(strings, ...vals);
            },
          }),
        ),
    };
    await createInvitationWithSeatLock(spy, limitsFor, invite(1, "ws_'; DROP TABLE x; --"), NOW);
    assert.equal(sql, "SELECT pg_advisory_xact_lock(hashtext($1))");
    assert.deepEqual(values, ["ws_'; DROP TABLE x; --"]);
  });

  for (const parallel of [5, 20, 50]) {
    it(`creates exactly 1 invite for ${parallel} parallel requests on a Free workspace with 1 member`, async () => {
      const { db, state } = fakeDb({
        plan: "FREE",
        members: [{ workspaceId: "ws_1", userId: "owner" }],
        invites: [],
      });
      const results = await Promise.all(
        Array.from({ length: parallel }, (_, n) =>
          createInvitationWithSeatLock(db, limitsFor, invite(n), NOW),
        ),
      );
      assert.equal(results.filter((r) => r.status === "created").length, 1);
      assert.equal(results.filter((r) => r.status === "seat_limit").length, parallel - 1);
      assert.equal(livePending(state).length, 1);
    });
  }

  it("sends one live invite when the same email is invited in parallel", async () => {
    const { db, state } = fakeDb({ plan: "PRO", members: [], invites: [] });
    const results = await Promise.all(
      Array.from({ length: 10 }, () => createInvitationWithSeatLock(db, limitsFor, invite(7), NOW)),
    );
    assert.equal(results.filter((r) => r.status === "created").length, 1);
    assert.equal(results.filter((r) => r.status === "duplicate").length, 9);
    assert.equal(livePending(state).length, 1);
  });

  it("would let the race through without the lock (the test can tell)", async () => {
    const { db, state } = fakeDb(
      { plan: "FREE", members: [{ workspaceId: "ws_1", userId: "owner" }], invites: [] },
      { lockWorks: false },
    );
    await Promise.all(
      Array.from({ length: 20 }, (_, n) => createInvitationWithSeatLock(db, limitsFor, invite(n), NOW)),
    );
    assert.ok(livePending(state).length > 1);
  });

  it("doesn't let one workspace's lock hold up another", async () => {
    const { db, state } = fakeDb({ plan: "FREE", members: [], invites: [] });
    const results = await Promise.all([
      createInvitationWithSeatLock(db, limitsFor, invite(1, "ws_a"), NOW),
      createInvitationWithSeatLock(db, limitsFor, invite(2, "ws_b"), NOW),
    ]);
    assert.deepEqual(results.map((r) => r.status), ["created", "created"]);
    assert.equal(state.invites.length, 2);
  });

  it("lets an expired pending invite be re-sent and marks the old one EXPIRED", async () => {
    const { db, state } = fakeDb({
      plan: "FREE",
      members: [{ workspaceId: "ws_1", userId: "owner" }],
      invites: [
        {
          id: "old",
          workspaceId: "ws_1",
          email: "person1@example.com",
          status: "PENDING",
          expiresAt: YESTERDAY,
          token: "tok_old",
        },
      ],
    });
    const result = await createInvitationWithSeatLock(db, limitsFor, invite(1), NOW);
    assert.equal(result.status, "created");
    assert.equal(state.invites.find((i) => i.id === "old")?.status, "EXPIRED");
    const fresh = state.invites.find((i) => i.id !== "old");
    assert.equal(fresh?.expiresAt.getTime(), NOW.getTime() + INVITATION_TTL_MS);
  });

  it("still blocks a live pending invite to the same email", async () => {
    const { db } = fakeDb({
      plan: "PRO",
      members: [],
      invites: [
        {
          id: "live",
          workspaceId: "ws_1",
          email: "person1@example.com",
          status: "PENDING",
          expiresAt: NEXT_WEEK,
          token: "tok_live",
        },
      ],
    });
    assert.equal((await createInvitationWithSeatLock(db, limitsFor, invite(1), NOW)).status, "duplicate");
  });

  it("returns the seat decision when the workspace is full, and writes nothing", async () => {
    const { db, state } = fakeDb({
      plan: "FREE",
      members: [
        { workspaceId: "ws_1", userId: "a" },
        { workspaceId: "ws_1", userId: "b" },
        { workspaceId: "ws_1", userId: "c" },
      ],
      invites: [],
    });
    const result = await createInvitationWithSeatLock(db, limitsFor, invite(1), NOW);
    assert.equal(result.status, "seat_limit");
    if (result.status === "seat_limit") assert.equal(result.decision.used, 3);
    assert.equal(state.invites.length, 0);
    assert.equal(state.members.length, 3, "nobody is removed");
  });
});

describe("acceptInvitationWithLock", () => {
  const pending = (): Invite => ({
    id: "inv",
    workspaceId: "ws_1",
    email: "new@example.com",
    status: "PENDING",
    expiresAt: NEXT_WEEK,
    token: "tok",
  });
  const input = { token: "tok", workspaceId: "ws_1", userId: "new_user", role: "AGENT" };

  it("locks before re-reading the invitation and writing", async () => {
    const { db, log, state } = fakeDb({ plan: "FREE", members: [], invites: [pending()] });
    assert.equal((await acceptInvitationWithLock(db, input, NOW)).status, "accepted");
    const steps = log.map((entry) => entry.split(":")[1]);
    assert.deepEqual(steps.slice(0, 2), ["lock", "invite.findUnique"]);
    assert.ok(steps.indexOf("lock") < steps.indexOf("member.create"));
    assert.ok(
      steps.indexOf("invite.updateMany") < steps.indexOf("member.create"),
      "claims the invite before adding the member",
    );
    assert.equal(state.invites[0].status, "ACCEPTED");
    assert.equal(state.members.length, 1);
  });

  it("accepts a pending invite even when the workspace is over the seat limit", async () => {
    const { db, state } = fakeDb({
      plan: "FREE",
      members: [
        { workspaceId: "ws_1", userId: "a" },
        { workspaceId: "ws_1", userId: "b" },
      ],
      invites: [pending()],
    });
    assert.equal((await acceptInvitationWithLock(db, input, NOW)).status, "accepted");
    assert.equal(state.members.length, 3);
  });

  it("handles a double click: one accept, one no-op, no unique-constraint error", async () => {
    const { db, state } = fakeDb({ plan: "FREE", members: [], invites: [pending()] });
    const results = await Promise.all([
      acceptInvitationWithLock(db, input, NOW),
      acceptInvitationWithLock(db, input, NOW),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), ["accepted", "already_member"]);
    assert.equal(state.members.length, 1);
  });

  it("refuses an invitation that expired, and reports one revoked in the meantime", async () => {
    const expired = { ...pending(), expiresAt: YESTERDAY };
    assert.equal(
      (await acceptInvitationWithLock(fakeDb({ plan: "FREE", members: [], invites: [expired] }).db, input, NOW)).status,
      "invalid",
    );
    assert.equal(
      (await acceptInvitationWithLock(fakeDb({ plan: "FREE", members: [], invites: [] }).db, input, NOW)).status,
      "revoked",
    );
  });

  it("has a plain 'already a member' message for the second click", () => {
    assert.equal(ALREADY_MEMBER_MESSAGE, "You're already a member of this workspace.");
  });
});

describe("revoking invitations", () => {
  it("only owners and admins can manage invitations", () => {
    assert.equal(canManageInvitations("OWNER"), true);
    assert.equal(canManageInvitations("ADMIN"), true);
    assert.equal(canManageInvitations("AGENT"), false);
    assert.equal(canManageInvitations("VIEWER"), false);
  });

  const pending = (): Invite => ({
    id: "inv",
    workspaceId: "ws_1",
    email: "new@example.com",
    status: "PENDING",
    expiresAt: NEXT_WEEK,
    token: "tok",
  });
  const acceptInput = { token: "tok", workspaceId: "ws_1", userId: "new_user", role: "AGENT" };

  it("deletes only a pending invite in the same workspace", async () => {
    const { db, state } = fakeDb({ plan: "FREE", members: [], invites: [pending()] });
    assert.equal((await revokePendingInvitation(db, "ws_other", "inv")).status, "not_found");
    assert.equal(state.invites.length, 1, "another workspace can't delete it");
    assert.equal((await revokePendingInvitation(db, "ws_1", "inv")).status, "revoked");
    assert.equal(state.invites.length, 0);
    assert.equal((await revokePendingInvitation(db, "ws_1", "inv")).status, "not_found");
  });

  it("takes the workspace lock before deleting", async () => {
    const { db, log } = fakeDb({ plan: "FREE", members: [], invites: [pending()] });
    await revokePendingInvitation(db, "ws_1", "inv");
    const steps = log.map((entry) => entry.split(":")[1]);
    assert.deepEqual(steps.slice(0, 2), ["lock", "invite.deleteMany"]);
    assert.equal(steps.at(-1), "end");
  });

  it("won't revoke an accepted invitation and says so", async () => {
    const accepted = { ...pending(), status: "ACCEPTED" };
    const { db, state } = fakeDb({ plan: "FREE", members: [], invites: [accepted] });
    assert.equal((await revokePendingInvitation(db, "ws_1", "inv")).status, "already_accepted");
    assert.equal(state.invites.length, 1);
  });

  for (const first of ["revoke", "accept"] as const) {
    it(`revoke and accept racing (${first} starts first): one wins, the other gets a clear result`, async () => {
      const { db, state } = fakeDb({ plan: "FREE", members: [], invites: [pending()] });
      const revoke = () => revokePendingInvitation(db, "ws_1", "inv");
      const accept = () => acceptInvitationWithLock(db, acceptInput, NOW);
      const [r, a] =
        first === "revoke"
          ? await Promise.all([revoke(), accept()])
          : await Promise.all([accept(), revoke()]).then(([x, y]) => [y, x] as const);
      if (first === "revoke") {
        assert.equal(r.status, "revoked");
        assert.equal(a.status, "revoked", "accept sees the invite is gone");
        assert.equal(state.members.length, 0);
        assert.equal(state.invites.length, 0);
      } else {
        assert.equal(a.status, "accepted");
        assert.equal(r.status, "already_accepted", "revoke sees it was accepted");
        assert.equal(state.members.length, 1);
        assert.equal(state.invites[0].status, "ACCEPTED");
      }
    });
  }

  it("even if the lock failed, the atomic claim stops a revoke that lands mid-accept from adding a member", async () => {
    const { db, state, log } = fakeDb({ plan: "FREE", members: [], invites: [pending()] }, { lockWorks: false });
    const [a, r] = await Promise.all([
      acceptInvitationWithLock(db, acceptInput, NOW),
      revokePendingInvitation(db, "ws_1", "inv"),
    ]);
    // The revoke deleted the row after accept read it (the interleaving
    // the lock normally prevents).
    const steps = log.map((entry) => entry.split(":")[1]);
    assert.ok(steps.indexOf("invite.findUnique") < steps.indexOf("invite.deleteMany"));
    assert.equal(r.status, "revoked");
    assert.equal(a.status, "revoked", "the claim matched no PENDING row");
    assert.equal(state.members.length, 0, "no member without a claimed invite");
    assert.equal(state.invites.length, 0);
  });

  for (const status of ["ACCEPTED", "EXPIRED"]) {
    it(`claim requires exactly one PENDING row (${status} row is not claimed)`, async () => {
      const { db, state } = fakeDb({
        plan: "FREE",
        members: [],
        invites: [{ ...pending(), status }],
      });
      const result = await acceptInvitationWithLock(db, acceptInput, NOW);
      assert.notEqual(result.status, "accepted");
      assert.equal(state.members.length, 0);
    });
  }
});

describe("invite email normalisation", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeInviteEmail("  Person@Example.COM "), "person@example.com");
  });

  it("stores the normalised email", async () => {
    const { db, state } = fakeDb({ plan: "PRO", members: [], invites: [] });
    const result = await createInvitationWithSeatLock(
      db,
      limitsFor,
      { ...invite(1), email: "  Person@Example.COM " },
      NOW,
    );
    assert.equal(result.status, "created");
    assert.equal(state.invites[0].email, "person@example.com");
  });

  it("treats an existing mixed-case pending invite as a duplicate", async () => {
    const old: Invite = {
      id: "old",
      workspaceId: "ws_1",
      email: "Person@Example.com",
      status: "PENDING",
      expiresAt: NEXT_WEEK,
      token: "tok_old",
    };
    const { db, state } = fakeDb({ plan: "PRO", members: [], invites: [old] });
    const result = await createInvitationWithSeatLock(
      db,
      limitsFor,
      { ...invite(1), email: "person@EXAMPLE.com" },
      NOW,
    );
    assert.equal(result.status, "duplicate");
    assert.equal(state.invites.length, 1);
  });

  it("expires a mixed-case expired invite so it doesn't block a re-send", async () => {
    const old: Invite = {
      id: "old",
      workspaceId: "ws_1",
      email: "PERSON@example.com",
      status: "PENDING",
      expiresAt: YESTERDAY,
      token: "tok_old",
    };
    const { db, state } = fakeDb({ plan: "PRO", members: [], invites: [old] });
    const result = await createInvitationWithSeatLock(
      db,
      limitsFor,
      { ...invite(1), email: "person@example.com" },
      NOW,
    );
    assert.equal(result.status, "created");
    assert.equal(state.invites[0].status, "EXPIRED");
  });

  it("finds an existing member whose account email is mixed case", async () => {
    const { db, state } = fakeDb({
      plan: "PRO",
      members: [{ workspaceId: "ws_1", userId: "u_bob" }],
      invites: [],
      users: [{ id: "u_bob", email: "Bob@Example.com" }],
    });
    const result = await createInvitationWithSeatLock(
      db,
      limitsFor,
      { ...invite(1), email: " bob@example.COM" },
      NOW,
    );
    assert.equal(result.status, "already_member");
    assert.equal(state.invites.length, 0);
  });

  it("invites a user who has an account but isn't in this workspace", async () => {
    const { db } = fakeDb({
      plan: "PRO",
      members: [{ workspaceId: "ws_other", userId: "u_bob" }],
      invites: [],
      users: [{ id: "u_bob", email: "Bob@Example.com" }],
    });
    const result = await createInvitationWithSeatLock(
      db,
      limitsFor,
      { ...invite(1), email: "bob@example.com" },
      NOW,
    );
    assert.equal(result.status, "created");
  });
});

describe("members list invitations", () => {
  it("splits live and expired pending invites so the list matches the seat count", () => {
    const rows = [
      { id: "a", expiresAt: NEXT_WEEK },
      { id: "b", expiresAt: YESTERDAY },
      { id: "c", expiresAt: NOW },
    ];
    const { active, expired } = splitInvitations(rows, NOW);
    assert.deepEqual(active.map((r) => r.id), ["a"]);
    assert.deepEqual(expired.map((r) => r.id), ["b", "c"]);
  });
});

describe("accept invitation messages (QA should-fixes)", () => {
  it("a second click on an expired link says it expired, not 'already been used'", () => {
    assert.equal(
      closedInvitationMessage({ status: "EXPIRED", expiresAt: YESTERDAY }, NOW),
      INVITATION_EXPIRED_MESSAGE,
    );
    assert.equal(
      closedInvitationMessage({ status: "ACCEPTED", expiresAt: NEXT_WEEK }, NOW),
      INVITATION_USED_MESSAGE,
    );
  });

  function expireDb(row: { status: string } | null, matches: number) {
    const calls: string[] = [];
    const db: ExpireInvitationDb = {
      workspaceInvitation: {
        updateMany: async () => {
          calls.push("updateMany");
          return { count: matches };
        },
        findUnique: async () => {
          calls.push("findUnique");
          return row;
        },
      },
    };
    return { db, calls };
  }

  it("marks a pending past-expiry invitation EXPIRED", async () => {
    const { db, calls } = expireDb({ status: "EXPIRED" }, 1);
    assert.equal(await expireInvitation(db, "tok"), INVITATION_EXPIRED_MESSAGE);
    assert.deepEqual(calls, ["updateMany"]);
  });

  it("expiry racing a revoke says revoked instead of throwing Prisma text", async () => {
    const { db } = expireDb(null, 0);
    assert.equal(await expireInvitation(db, "tok"), INVITATION_REVOKED_MESSAGE);
  });

  it("expiry racing another expiry or accept gives the matching message", async () => {
    assert.equal(await expireInvitation(expireDb({ status: "EXPIRED" }, 0).db, "tok"), INVITATION_EXPIRED_MESSAGE);
    assert.equal(await expireInvitation(expireDb({ status: "ACCEPTED" }, 0).db, "tok"), INVITATION_USED_MESSAGE);
  });

  it("never shows raw Prisma error text", () => {
    const prismaError = Object.assign(
      new Error("Invalid `prisma.workspaceInvitation.update()` invocation: An operation failed because it depends on one or more records that were required but not found. Record to update not found."),
      { code: "P2025" },
    );
    assert.equal(acceptInvitationErrorMessage(prismaError), ACCEPT_FAILED_MESSAGE);
    assert.doesNotMatch(acceptInvitationErrorMessage(prismaError), /prisma|P2025|Record/i);
    assert.equal(acceptInvitationErrorMessage("boom"), ACCEPT_FAILED_MESSAGE);
    assert.equal(acceptInvitationErrorMessage(new Error("Unauthorized")), "Unauthorized");
  });
});

describe("pendingInvitationLink", () => {
  const now = new Date("2026-10-24T12:00:00Z");
  function db(row: { token: string; expiresAt: Date } | null) {
    const calls: unknown[] = [];
    return {
      calls,
      workspaceInvitation: {
        async findFirst(args: unknown) {
          calls.push(args);
          return row;
        },
      },
    };
  }

  it("returns the link for a live pending invite, scoped to the workspace", async () => {
    const fake = db({ token: "tok_1", expiresAt: new Date("2026-10-30T00:00:00Z") });
    const result = await pendingInvitationLink(fake, "ws_1", "inv_1", "https://app.example.test", now);
    assert.deepEqual(result, {
      status: "ok",
      inviteUrl: "https://app.example.test/invitation?token=tok_1",
    });
    assert.deepEqual(fake.calls[0], {
      where: { id: "inv_1", workspaceId: "ws_1", status: "PENDING" },
      select: { token: true, expiresAt: true },
    });
  });

  it("gives no link for an expired invite", async () => {
    const fake = db({ token: "tok_1", expiresAt: new Date("2026-10-24T11:59:59Z") });
    assert.deepEqual(
      await pendingInvitationLink(fake, "ws_1", "inv_1", "https://app.example.test", now),
      { status: "expired" },
    );
  });

  it("gives no link for an accepted, revoked or other-workspace invite", async () => {
    assert.deepEqual(
      await pendingInvitationLink(db(null), "ws_1", "inv_1", "https://app.example.test", now),
      { status: "not_found" },
    );
  });
});
