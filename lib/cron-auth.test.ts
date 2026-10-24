import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { NextRequest } from "next/server";

import { isAuthorizedCronRequest, withCronAuth } from "./cron-auth";

const SECRET = "test-cron-secret";
const ROUTES = [
  "agent-performance",
  "analytics",
  "automations",
  "sla-check",
  "surveys",
  "webhook-cleanup",
  "webhook-retry",
] as const;

function request(method: "GET" | "POST", authorization?: string) {
  const headers = new Headers();
  if (authorization !== undefined) headers.set("authorization", authorization);
  return new NextRequest("https://www.guddesk.com/api/cron/test", { method, headers });
}

let savedSecret: string | undefined;
beforeEach(() => {
  savedSecret = process.env.CRON_SECRET;
});
afterEach(() => {
  if (savedSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = savedSecret;
});

describe("isAuthorizedCronRequest", () => {
  it("accepts the exact bearer header", () => {
    assert.equal(isAuthorizedCronRequest(`Bearer ${SECRET}`, SECRET), true);
  });

  it("rejects a wrong secret, a missing header and other schemes", () => {
    assert.equal(isAuthorizedCronRequest("Bearer wrong", SECRET), false);
    assert.equal(isAuthorizedCronRequest(`Bearer ${SECRET}x`, SECRET), false);
    assert.equal(isAuthorizedCronRequest(SECRET, SECRET), false);
    assert.equal(isAuthorizedCronRequest(null, SECRET), false);
    assert.equal(isAuthorizedCronRequest(undefined, SECRET), false);
  });

  it("rejects everything when the secret is missing or empty", () => {
    assert.equal(isAuthorizedCronRequest("Bearer undefined", undefined), false);
    assert.equal(isAuthorizedCronRequest("Bearer ", ""), false);
    assert.equal(isAuthorizedCronRequest(null, undefined), false);
  });
});

describe("withCronAuth", () => {
  for (const method of ["GET", "POST"] as const) {
    it(`runs the job for ${method} with the right secret`, async () => {
      process.env.CRON_SECRET = SECRET;
      let calls = 0;
      const handler = withCronAuth(async () => {
        calls++;
        return Response.json({ ok: true });
      });
      const res = await handler(request(method, `Bearer ${SECRET}`));
      assert.equal(res.status, 200);
      assert.equal(calls, 1);
    });

    it(`returns 401 for ${method} with a wrong secret and skips the job`, async () => {
      process.env.CRON_SECRET = SECRET;
      let calls = 0;
      const handler = withCronAuth(async () => {
        calls++;
        return Response.json({ ok: true });
      });
      const res = await handler(request(method, "Bearer wrong"));
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "Unauthorized" });
      assert.equal(calls, 0);
    });

    it(`returns 401 for ${method} when CRON_SECRET is not set`, async () => {
      delete process.env.CRON_SECRET;
      let calls = 0;
      const handler = withCronAuth(async () => {
        calls++;
        return Response.json({ ok: true });
      });
      for (const header of [undefined, "Bearer undefined", "Bearer "]) {
        const res = await handler(request(method, header));
        assert.equal(res.status, 401);
      }
      assert.equal(calls, 0);
    });
  }
});

describe("cron routes", () => {
  for (const name of ROUTES) {
    it(`${name} exports GET and POST, and both reject bad or missing secrets`, async () => {
      const mod = await import(`../app/api/cron/${name}/route`);
      assert.equal(typeof mod.GET, "function", `${name} GET`);
      assert.equal(typeof mod.POST, "function", `${name} POST`);

      for (const method of ["GET", "POST"] as const) {
        process.env.CRON_SECRET = SECRET;
        assert.equal((await mod[method](request(method))).status, 401);
        assert.equal((await mod[method](request(method, "Bearer wrong"))).status, 401);

        delete process.env.CRON_SECRET;
        assert.equal((await mod[method](request(method, "Bearer undefined"))).status, 401);
      }
    });
  }
});
