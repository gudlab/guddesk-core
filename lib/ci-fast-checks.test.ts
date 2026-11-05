import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  checkCiWorkflow,
  checkSchema,
  checkSettings,
  checkSyncOss,
  collectFailures,
  jobSection,
} from "../scripts/ci-fast-checks.mjs";

const ROOT = process.cwd();

describe("ci-fast-checks", () => {
  it("passes on this repo (GudBot default OFF, CI split, sync-oss keeps ci.yml)", () => {
    assert.deepEqual(collectFailures(ROOT), []);
  });

  it("flags GudBotSettings.enabled @default(true) and ignores Agent.isEnabled", () => {
    const schema = `
model Agent {
  isEnabled   Boolean   @default(true)
}
model GudBotSettings {
  enabled              Boolean  @default(true)
}
`;
    const failures = checkSchema(schema);
    assert.ok(failures.some((f) => /GudBotSettings\.enabled/.test(f)));
    assert.ok(failures.every((f) => !/\bAgent\b/.test(f)));
  });

  it("extracts the fast-gate job and rejects live eval or Next build there", () => {
    const ci = `
jobs:
  fast-gate:
    name: fast-gate
    steps:
      - run: node qa/ai-eval/live-runner.mjs
      - run: pnpm build
  migrations:
    name: Migrations (empty Postgres)
  full-build:
    name: full-build
    steps:
      - run: pnpm build
`;
    const fast = jobSection(ci, "fast-gate");
    assert.match(fast ?? "", /live-runner/);
    const failures = checkCiWorkflow(ci);
    assert.ok(failures.some((f) => /live-runner/.test(f)));
    assert.ok(failures.some((f) => /must not run pnpm build or lint/.test(f)));
  });

  it("requires sync-oss to keep and exclude core's ci.yml", () => {
    const failures = checkSyncOss("keep_dest_files = {}\nexclude_files = {}");
    assert.equal(failures.length, 2);
    assert.ok(failures.every((f) => f.includes(".github/workflows/ci.yml")));
  });

  it("requires DISABLED_GUDBOT_SETTINGS.enabled to be false", () => {
    const failures = checkSettings(
      "export const DISABLED_GUDBOT_SETTINGS = { enabled: true }\nenabled: row.enabled === true",
    );
    assert.ok(failures.some((f) => /DISABLED_GUDBOT_SETTINGS/.test(f)));
  });

  it("fails when the migrations directory is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "fast-checks-"));
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "jobs:\n");
    const failures = collectFailures(dir);
    assert.ok(failures.some((f) => /prisma\/migrations/.test(f)));
  });
});
