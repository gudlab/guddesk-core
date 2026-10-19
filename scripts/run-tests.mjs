#!/usr/bin/env node
/**
 * Node 20's test runner does not expand globs and ignores .ts files when
 * `tsx --test` is given no paths. Collect lib/ and packages/ *.test.ts
 * files and pass them explicitly.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["lib", "packages"];

function collectTestFiles(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === ".git"
    ) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTestFiles(path, acc);
    } else if (entry.name.endsWith(".test.ts")) {
      acc.push(path);
    }
  }
  return acc;
}

const files = ROOTS.flatMap((root) => collectTestFiles(root)).sort();
if (files.length === 0) {
  console.error(
    "No test files matched lib/**/*.test.ts or packages/**/*.test.ts",
  );
  process.exit(1);
}

const tsxCli = join("node_modules", "tsx", "dist", "cli.mjs");
const result = spawnSync(
  process.execPath,
  [tsxCli, "--test", "--test-reporter=tap", "--test-timeout=5000", ...files],
  { encoding: "utf8" },
);

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const match = result.stdout?.match(/^# tests (\d+)/m);
const count = match ? Number(match[1]) : 0;
if (!Number.isFinite(count) || count < 1) {
  console.error(
    `FAIL: expected at least 1 test, TAP reported ${match ? count : "no # tests line"}`,
  );
  process.exit(1);
}

process.exit(result.status === 0 ? 0 : (result.status ?? 1));
