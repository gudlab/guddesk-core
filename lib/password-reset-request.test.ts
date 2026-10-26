import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { deferPasswordReset } from "./password-reset-request";

const action = readFileSync(join(process.cwd(), "actions", "forgot-password.ts"), "utf8");

/** The exported action's body, up to the next top-level function. */
function forgotPasswordBody(): string {
  const start = action.indexOf("export async function forgotPassword(");
  const end = action.indexOf("\nasync function ", start);
  assert.ok(start >= 0 && end > start);
  return action.slice(start, end);
}

describe("forgot-password timing", () => {
  it("known and unknown addresses take the same path: schedule once, return, nothing awaited", () => {
    for (const email of ["known@example.test", "unknown@example.test"]) {
      const scheduled: Array<() => Promise<void>> = [];
      let jobStarted = false;
      deferPasswordReset(
        email,
        (task) => scheduled.push(task),
        async () => {
          jobStarted = true;
          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      );
      assert.equal(scheduled.length, 1, email);
      assert.equal(jobStarted, false, "the lookup and send don't start before the response");
    }
  });

  it("the deferred job runs after the response, and a failure is logged without the address", async () => {
    const logs: string[] = [];
    const scheduled: Array<() => Promise<void>> = [];
    const seen: string[] = [];
    deferPasswordReset(
      "jane@example.test",
      (task) => scheduled.push(task),
      async (email) => {
        seen.push(email);
        throw new TypeError("db down for jane@example.test");
      },
      (line) => logs.push(line),
    );
    await scheduled[0]();
    assert.deepEqual(seen, ["jane@example.test"]);
    assert.deepEqual(logs, ["[password-reset] deferred reset failed: TypeError"]);
  });

  it("still runs the job, unawaited, if after() can't be used", async () => {
    let ran = false;
    deferPasswordReset(
      "a@b.test",
      () => {
        throw new Error("after() outside a request");
      },
      async () => {
        ran = true;
      },
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(ran, true);
  });

  it("the action defers through next/server after() and awaits nothing before answering", () => {
    assert.match(action, /import \{ after \} from "next\/server";/);
    const body = forgotPasswordBody();
    assert.match(body, /deferPasswordReset\(normalizedEmail, after, sendResetIfAccount\);/);
    assert.doesNotMatch(body, /\bawait\b/);
    assert.doesNotMatch(body, /prisma\.|sendEmail\(/);
    assert.equal((body.match(/return \{ success: PASSWORD_RESET_NEUTRAL_MESSAGE \}/g) ?? []).length, 1);
    const job = action.slice(action.indexOf("\nasync function sendResetIfAccount("));
    assert.match(job, /findUserByEmail\(prisma, normalizedEmail\)/);
    assert.match(job, /if \(!user \|\| !user\.password\) return;/);
    assert.match(job, /await sendEmail\("password-reset"/);
  });
});
