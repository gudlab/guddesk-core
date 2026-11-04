import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// GudDesk Cloud only: the GitHub Actions scheduler for the cron routes.
describe(".github/workflows/cron.yml", () => {
  it("cron.yml runs hourly, skips without the secret and fails on a final error", () => {
    const yml = read(".github/workflows/cron.yml");
    assert.match(yml, /cron: "7 \* \* \* \*"/);
    assert.doesNotMatch(yml, /\*\/5/);
    assert.match(yml, /workflow_dispatch:/);
    assert.match(yml, /CRON_SECRET: \$\{\{ secrets\.CRON_SECRET \}\}/);
    assert.match(yml, /if: env\.CRON_SECRET == ''/);
    assert.match(yml, /Authorization: Bearer \$\{CRON_SECRET\}/);
    assert.match(yml, /--max-time 20/);
    assert.match(yml, /CRON_PATHS: \/api\/cron\/sla-check/);
    assert.match(yml, /exit "\$failed"/);
    assert.match(yml, /https:\/\/www\.guddesk\.com/);
  });

  it("the worst-case retry time for every path fits inside the job timeout", () => {
    const yml = read(".github/workflows/cron.yml");
    const timeoutSeconds = Number(/timeout-minutes: (\d+)/.exec(yml)![1]) * 60;
    const maxTime = Number(/--max-time (\d+)/.exec(yml)![1]);
    const attempts = /for attempt in ([\d ]+); do/.exec(yml)![1].trim().split(/\s+/).length;
    // sleep $(( 5 * 2 ** (attempt - 1) )) between attempts.
    let backoff = 0;
    for (let a = 1; a < attempts; a++) backoff += 5 * 2 ** (a - 1);
    const paths = /CRON_PATHS: (.+)/.exec(yml)![1].trim().split(/\s+/).length;
    // Two paths once /api/cron/automations is added.
    const worst = Math.max(paths, 2) * (attempts * maxTime + backoff);
    assert.ok(worst < timeoutSeconds - 30, `${worst}s of retries vs a ${timeoutSeconds}s job timeout`);
  });
});
