import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  findTestSenderHits,
  isDockerfile,
  isEnvFile,
  TEST_SENDER_DOMAIN,
  trackedDotEnvFiles,
} from "../../scripts/check-no-test-sender.mjs";
import { cleanDisplayName, DEFAULT_FROM, emailFrom, parseFrom, resetFromWarnings } from "./from";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("emailFrom", () => {
  it("defaults to GudDesk <notifications@guddesk.com>", () => {
    assert.equal(DEFAULT_FROM, "GudDesk <notifications@guddesk.com>");
    assert.equal(emailFrom(undefined, {}), "GudDesk <notifications@guddesk.com>");
  });

  it("uses RESEND_FROM, with its name or bare", () => {
    assert.equal(emailFrom(undefined, { RESEND_FROM: "Acme Support <help@acme.test>" }), "Acme Support <help@acme.test>");
    assert.equal(emailFrom(undefined, { RESEND_FROM: "help@acme.test" }), "GudDesk <help@acme.test>");
    assert.deepEqual(parseFrom(" Acme <help@acme.test> "), { name: "Acme", address: "help@acme.test" });
  });

  it("a display name replaces the configured name; the address stays", () => {
    assert.equal(emailFrom("Workspace A", { RESEND_FROM: "Acme <help@acme.test>" }), "Workspace A <help@acme.test>");
    assert.equal(emailFrom("Workspace A", {}), "Workspace A <notifications@guddesk.com>");
  });

  it("an invalid RESEND_FROM falls back to the default and logs once, without the value", () => {
    const lines: string[] = [];
    assert.equal(parseFrom("not an address"), null);
    assert.equal(emailFrom(undefined, { RESEND_FROM: "not an address" }, (l) => lines.push(l)), DEFAULT_FROM);
    emailFrom(undefined, { RESEND_FROM: "still bad" }, (l) => lines.push(l));
    assert.equal(lines.length, 1);
    assert.ok(!lines[0].includes("not an address"));
  });

  it("RESEND_FROM set to Resend's test sender falls back to the default and logs once, without the value", () => {
    resetFromWarnings();
    const lines: string[] = [];
    for (const value of [`onboarding@${TEST_SENDER_DOMAIN}`, `Acme <hi@mail.${TEST_SENDER_DOMAIN.toUpperCase()}>`]) {
      assert.equal(emailFrom(undefined, { RESEND_FROM: value }, (l) => lines.push(l)), DEFAULT_FROM);
    }
    // A display name still applies on the default address.
    assert.equal(emailFrom("Workspace A", { RESEND_FROM: `onboarding@${TEST_SENDER_DOMAIN}` }), "Workspace A <notifications@guddesk.com>");
    assert.equal(lines.length, 1);
    assert.match(lines[0], /test sender/);
    assert.ok(!lines[0].includes("onboarding"));
    // A look-alike domain is not the test sender.
    assert.equal(emailFrom(undefined, { RESEND_FROM: `help@not${TEST_SENDER_DOMAIN}.example` }), `GudDesk <help@not${TEST_SENDER_DOMAIN}.example>`);
    resetFromWarnings();
  });

  it("keeps workspace names from breaking the header", () => {
    assert.equal(cleanDisplayName('Acme <evil@x.com> "Ltd"\r\n'), "Acme evil@x.com Ltd");
    assert.equal(emailFrom("Acme, Inc.", {}), '"Acme, Inc." <notifications@guddesk.com>');
    assert.equal(emailFrom("", {}), "GudDesk <notifications@guddesk.com>");
  });

  it("every app email takes its From from emailFrom(), and RESEND_FROM is in env.mjs", () => {
    assert.match(read("actions/invite-workspace-member.ts"), /from: emailFrom\(\),/);
    assert.match(read("actions/forgot-password.ts"), /from: emailFrom\(\),/);
    assert.equal((read("lib/email-notifications.ts").match(/from: emailFrom\(conversation\.workspace\.name\),/g) ?? []).length, 2);
    assert.match(read("auth.config.ts"), /const MAGIC_LINK_FROM = emailFrom\(\);/);
    const envFile = read("env.mjs");
    assert.match(envFile, /RESEND_FROM: z\.string\(\)\.optional\(\)/);
    assert.match(envFile, /RESEND_FROM: process\.env\.RESEND_FROM/);
  });
});

describe("no Resend test sender", () => {
  const script = join(ROOT, "scripts", "check-no-test-sender.mjs");

  it("'resend.dev' appears in no source, template, doc or config file outside tests", () => {
    assert.deepEqual(findTestSenderHits(ROOT), []);
  });

  it("the check fails on a planted file and passes on a clean tree", () => {
    const dir = mkdtempSync(join(tmpdir(), "sender-check-"));
    try {
      mkdirSync(join(dir, "lib"));
      writeFileSync(join(dir, "lib", "ok.ts"), 'export const from = "GudDesk <a@b.test>";\n');
      assert.equal(spawnSync(process.execPath, [script, dir]).status, 0);
      writeFileSync(join(dir, "lib", "bad.ts"), `export const from = "x@${TEST_SENDER_DOMAIN}";\n`);
      writeFileSync(join(dir, "lib", "bad.test.ts"), `// ${TEST_SENDER_DOMAIN} in a test is fine\n`);
      const failed = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
      assert.equal(failed.status, 1);
      assert.match(failed.stderr, /lib\/bad\.ts/);
      assert.doesNotMatch(failed.stderr, /bad\.test\.ts/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("also scans committed env files and Dockerfiles, never the gitignored .env and *.local", () => {
    for (const name of [".env.example", ".env.production", ".env.development"]) assert.ok(isEnvFile(name), name);
    for (const name of [".env", ".env.local", ".env.production.local", ".envrc", "env.ts"]) assert.ok(!isEnvFile(name), name);
    // Matches .gitignore: .env and .env*.local are never committed.
    const gitignore = read(".gitignore");
    assert.match(gitignore, /^\.env\*\.local$/m);
    assert.match(gitignore, /^\.env$/m);
    for (const name of ["Dockerfile", "Dockerfile.prod", "web.Dockerfile", "api.dockerfile"]) assert.ok(isDockerfile(name), name);
    assert.ok(!isDockerfile("docker-notes.txt"));

    const dir = mkdtempSync(join(tmpdir(), "sender-check-env-"));
    try {
      writeFileSync(join(dir, ".env.local"), `RESEND_FROM=x@${TEST_SENDER_DOMAIN}\n`);
      writeFileSync(join(dir, ".env"), `RESEND_FROM=x@${TEST_SENDER_DOMAIN}\n`);
      const script = join(ROOT, "scripts", "check-no-test-sender.mjs");
      assert.equal(spawnSync(process.execPath, [script, dir]).status, 0, "an untracked .env and .env.local are skipped");
      writeFileSync(join(dir, ".env.production"), `RESEND_FROM=x@${TEST_SENDER_DOMAIN}\n`);
      writeFileSync(join(dir, "Dockerfile"), `ENV RESEND_FROM=x@${TEST_SENDER_DOMAIN}\n`);
      const failed = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
      assert.equal(failed.status, 1);
      assert.match(failed.stderr, /\.env\.production/);
      assert.match(failed.stderr, /Dockerfile/);
      assert.doesNotMatch(failed.stderr, /\.env\.local/);
      assert.doesNotMatch(failed.stderr, /RESEND_FROM=/, "prints paths only");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("matches regardless of case, so a mixed-case sender is caught", () => {
    const dir = mkdtempSync(join(tmpdir(), "sender-check-case-"));
    try {
      mkdirSync(join(dir, "lib"));
      const mixed = TEST_SENDER_DOMAIN.split(".").map((part) => part[0].toUpperCase() + part.slice(1)).join(".");
      assert.notEqual(mixed, TEST_SENDER_DOMAIN);
      writeFileSync(join(dir, "lib", "mail.ts"), `export const from = "Onboarding@${mixed}";\n`);
      assert.deepEqual(findTestSenderHits(dir), ["lib/mail.ts"]);
      const script = join(ROOT, "scripts", "check-no-test-sender.mjs");
      const failed = spawnSync(process.execPath, [script, dir], { encoding: "utf8" });
      assert.equal(failed.status, 1);
      assert.match(failed.stderr, /lib\/mail\.ts/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("a bare .env is scanned only when git tracks it", () => {
    const dir = mkdtempSync(join(tmpdir(), "sender-check-dotenv-"));
    try {
      const git = (...args: string[]) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
      assert.equal(git("init", "-q").status, 0);
      writeFileSync(join(dir, ".env"), `RESEND_FROM=x@${TEST_SENDER_DOMAIN.toUpperCase()}\n`);
      mkdirSync(join(dir, "app"));
      writeFileSync(join(dir, "app", ".env"), `RESEND_FROM=x@${TEST_SENDER_DOMAIN}\n`);
      assert.deepEqual(findTestSenderHits(dir), [], "untracked .env files are skipped");
      assert.equal(git("add", "-f", ".env").status, 0);
      assert.deepEqual(findTestSenderHits(dir), [".env"], "a tracked .env is scanned; the untracked one isn't");
      assert.deepEqual([...trackedDotEnvFiles(dir)], [".env"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("runs first in pnpm build, so a deploy with it fails", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
    assert.match(pkg.scripts.build, /^node scripts\/check-no-test-sender\.mjs && /);
    // CI's Test step runs pnpm test, which collects this file.
    const ci = readFileSync(join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
    assert.match(ci, /pull_request:/);
    assert.match(ci, /pnpm test/);
    assert.match(readFileSync(join(ROOT, "scripts", "run-tests.mjs"), "utf8"), /const ROOTS = \["lib", "packages"\]/);
  });
});
