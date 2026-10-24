import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimThrottle, throttleKey, type ThrottleDb } from "../throttle";
import {
  OPPORTUNISTIC_WINDOW_MS,
  runWorkspaceJobs,
  scheduleWorkspaceJobs,
} from "./opportunistic";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const T0 = new Date("2026-10-24T12:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);

/**
 * In-memory verification_tokens with Postgres-like semantics: writes to
 * one row are serialized, and create throws P2002 on a duplicate token.
 */
function fakeDb() {
  const rows = new Map<string, { identifier: string; token: string; expires: Date }>();
  let writes = 0;
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const db: ThrottleDb = {
    verificationToken: {
      async updateMany({ where, data }) {
        await tick();
        writes++;
        const row = rows.get(where.token);
        if (row && row.identifier === where.identifier && row.expires <= where.expires.lte) {
          row.expires = data.expires;
          return { count: 1 };
        }
        return { count: 0 };
      },
      async create({ data }) {
        await tick();
        writes++;
        if (rows.has(data.token)) throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
        rows.set(data.token, { ...data });
        return data;
      },
    },
  };
  return { db, rows, writes: () => writes };
}

describe("claimThrottle", () => {
  const key = throttleKey("sla-check", "ws_1");

  it("uses a throttle: key that can't be an email identifier", () => {
    assert.equal(key, "throttle:sla-check:ws_1");
    assert.ok(!key.includes("@"));
  });

  it("first claim wins and stores the window end", async () => {
    const { db, rows } = fakeDb();
    assert.equal(await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0), true);
    assert.equal(rows.get(key)?.expires.getTime(), at(OPPORTUNISTIC_WINDOW_MS).getTime());
  });

  it("a second claim inside 5 minutes loses", async () => {
    const { db } = fakeDb();
    await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0);
    assert.equal(await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, at(60_000)), false);
    assert.equal(await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, at(OPPORTUNISTIC_WINDOW_MS - 1)), false);
  });

  it("a claim once the window has passed wins again", async () => {
    const { db } = fakeDb();
    await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0);
    assert.equal(await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, at(OPPORTUNISTIC_WINDOW_MS)), true);
    assert.equal(await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, at(OPPORTUNISTIC_WINDOW_MS + 1000)), false);
  });

  it("10 concurrent claims (no row yet) give exactly one winner", async () => {
    const { db } = fakeDb();
    const results = await Promise.all(
      Array.from({ length: 10 }, () => claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0)),
    );
    assert.equal(results.filter(Boolean).length, 1);
  });

  it("10 concurrent claims on an expired row give exactly one winner", async () => {
    const { db } = fakeDb();
    await claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0);
    const later = at(OPPORTUNISTIC_WINDOW_MS * 3);
    const results = await Promise.all(
      Array.from({ length: 10 }, () => claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, later)),
    );
    assert.equal(results.filter(Boolean).length, 1);
  });

  it("workspaces and jobs are throttled separately", async () => {
    const { db } = fakeDb();
    assert.equal(await claimThrottle(db, throttleKey("sla-check", "ws_1"), OPPORTUNISTIC_WINDOW_MS, T0), true);
    assert.equal(await claimThrottle(db, throttleKey("sla-check", "ws_2"), OPPORTUNISTIC_WINDOW_MS, T0), true);
    assert.equal(await claimThrottle(db, throttleKey("other", "ws_1"), OPPORTUNISTIC_WINDOW_MS, T0), true);
  });

  it("rethrows database errors other than a unique violation", async () => {
    const db: ThrottleDb = {
      verificationToken: {
        updateMany: async () => ({ count: 0 }),
        create: async () => {
          throw new Error("connection lost");
        },
      },
    };
    await assert.rejects(claimThrottle(db, key, OPPORTUNISTIC_WINDOW_MS, T0), /connection lost/);
  });
});

describe("runWorkspaceJobs / scheduleWorkspaceJobs", () => {
  it("runs the job once per workspace per 5 minutes", async () => {
    const { db } = fakeDb();
    const ran: string[] = [];
    let now = T0;
    const deps = {
      db,
      after: () => undefined,
      jobs: [{ name: "sla-check", run: async (ws: string) => void ran.push(ws) }],
      now: () => now,
    };
    await runWorkspaceJobs("ws_1", deps);
    await runWorkspaceJobs("ws_1", deps);
    now = at(OPPORTUNISTIC_WINDOW_MS);
    await runWorkspaceJobs("ws_1", deps);
    assert.deepEqual(ran, ["ws_1", "ws_1"]);
  });

  it("defers the work to after() and does nothing synchronously", async () => {
    const { db, writes } = fakeDb();
    const tasks: Array<() => Promise<void>> = [];
    let ran = 0;
    scheduleWorkspaceJobs("ws_1", {
      db,
      after: (task) => void tasks.push(task),
      jobs: [{ name: "sla-check", run: async () => void ran++ }],
      now: () => T0,
    });
    assert.equal(tasks.length, 1);
    assert.equal(writes(), 0);
    assert.equal(ran, 0);
    await tasks[0]();
    assert.equal(ran, 1);
  });

  it("a failing job is logged and does not stop the next job or throw", async () => {
    const { db } = fakeDb();
    const logged: string[] = [];
    let second = 0;
    await runWorkspaceJobs("ws_1", {
      db,
      after: () => undefined,
      jobs: [
        { name: "a", run: async () => { throw new Error("boom"); } },
        { name: "b", run: async () => void second++ },
      ],
      now: () => T0,
      log: (message) => void logged.push(message),
    });
    assert.equal(second, 1);
    assert.deepEqual(logged, ["[scheduled] a failed for workspace ws_1"]);
  });

  it("a throwing after() or a missing workspace never throws to the request", () => {
    const { db } = fakeDb();
    const logged: string[] = [];
    const deps = {
      db,
      after: () => {
        throw new Error("outside a request");
      },
      jobs: [],
      log: (message: string) => void logged.push(message),
    };
    assert.doesNotThrow(() => scheduleWorkspaceJobs("ws_1", deps));
    assert.doesNotThrow(() => scheduleWorkspaceJobs(null, deps));
    assert.equal(logged.length, 1);
  });
});

describe("wiring", () => {
  it("the inbox list and every v1 API request schedule the jobs", () => {
    assert.match(read("app/api/inbox/conversations/route.ts"), /scheduleOpportunisticJobs\(workspaceId\)/);
    assert.match(read("lib/api-utils.ts"), /scheduleOpportunisticJobs\(wsResult\.workspaceId\)/);
  });

  it("the app wiring uses next/server after() and the SLA job", () => {
    const index = read("lib/scheduled/index.ts");
    assert.match(index, /import \{ after \} from "next\/server"/);
    assert.match(index, /name: "sla-check", run: \(workspaceId\) => processSlaBreaches\(workspaceId\)/);
  });

});
