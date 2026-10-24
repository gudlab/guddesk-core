import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { PUSHER_TIMEOUT_MS, PusherTimeoutError, withPusherTimeout } from "./pusher-timeout";

describe("withPusherTimeout", () => {
  it("rejects when Pusher never answers, so a close can't hang", async () => {
    const started = Date.now();
    await assert.rejects(withPusherTimeout(new Promise(() => {}), 30), PusherTimeoutError);
    assert.ok(Date.now() - started < 1000);
  });

  it("passes a result or an error through", async () => {
    assert.equal(await withPusherTimeout(Promise.resolve("ok"), 30), "ok");
    await assert.rejects(withPusherTimeout(Promise.reject(new Error("boom")), 30), /boom/);
  });

  it("defaults to 5 seconds", () => {
    assert.equal(PUSHER_TIMEOUT_MS, 5000);
  });

  it("every server-side Pusher call goes through it, and the client has the same timeout", () => {
    const src = readFileSync(join(process.cwd(), "lib/pusher-server.ts"), "utf8");
    assert.match(src, /await withPusherTimeout\(pusher\.trigger\(channel, name, data\)\)/);
    assert.match(src, /await withPusherTimeout\(pusher\.triggerBatch\(chunk\)\)/);
    assert.match(src, /timeout: PUSHER_TIMEOUT_MS/);
    assert.equal((src.match(/pusher\.trigger(Batch)?\(/g) ?? []).length, 2);
  });
});
