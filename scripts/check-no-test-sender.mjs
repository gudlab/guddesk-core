#!/usr/bin/env node
/**
 * Fails when Resend's shared test sender domain appears in any shipped
 * file: source, templates, docs and config, plus committed env files
 * (.env.example, .env.production, ...) and Dockerfiles. Tests, build
 * output, dependencies and the gitignored env files (*.local, and a .env
 * that git doesn't track: never committed, and they hold local secrets)
 * are skipped. A .env that is tracked is scanned. Matching ignores case
 * (domains do), so "Onboarding@Resend.Dev" is caught too. That sender only delivers to the Resend
 * account owner, so using it silently drops real users' email.
 *
 * Runs first in `pnpm build` (so a deploy fails) and from
 * lib/email/from.test.ts (so CI's test step fails). Prints file paths
 * only.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const TEST_SENDER_DOMAIN = ["resend", "dev"].join(".");

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".contentlayer", "dist", "public", "coverage", ".turbo"]);
const EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|html|yml|yaml)$/;
const SELF = "check-no-test-sender.mjs";

/** .env.<anything>, except the gitignored *.local ones. A bare .env counts only when git tracks it (see shippedFiles). */
export function isEnvFile(name) {
  return name.startsWith(".env.") && !name.endsWith(".local");
}

/** Paths (relative to root) of the bare .env files git tracks. Empty outside a git checkout. */
export function trackedDotEnvFiles(root) {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--", ".env", "**/.env"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(out.split("\0").filter(Boolean));
  } catch {
    return new Set();
  }
}

/** Dockerfile, Dockerfile.<x>, <x>.Dockerfile and <x>.dockerfile. */
export function isDockerfile(name) {
  return /^Dockerfile(\..+)?$/.test(name) || /\.[Dd]ockerfile$/.test(name);
}

function shippedFiles(dir, acc = [], root = dir, trackedEnv = trackedDotEnvFiles(root)) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      shippedFiles(path, acc, root, trackedEnv);
    } else if (name === ".env") {
      if (trackedEnv.has(relative(root, path).split("\\").join("/"))) acc.push(path);
    } else if (
      (EXTENSIONS.test(name) || isEnvFile(name) || isDockerfile(name)) &&
      !/\.test\.tsx?$/.test(name) &&
      !name.endsWith(".test-helper.ts") &&
      name !== "pnpm-lock.yaml" &&
      name !== "package-lock.json" &&
      name !== SELF
    ) {
      acc.push(path);
    }
  }
  return acc;
}

/** Paths, relative to root, of shipped files that mention the test sender. */
export function findTestSenderHits(root) {
  return shippedFiles(root)
    .filter((file) => readFileSync(file, "utf8").toLowerCase().includes(TEST_SENDER_DOMAIN))
    .map((file) => relative(root, file))
    .sort();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.argv[2] ?? process.cwd();
  const hits = findTestSenderHits(root);
  if (hits.length > 0) {
    console.error(`FAIL: Resend's test sender (${TEST_SENDER_DOMAIN}) is in ${hits.length} shipped file(s):`);
    for (const hit of hits) console.error(`  ${hit}`);
    console.error("Use emailFrom() from lib/email/from.ts and set RESEND_FROM instead.");
    process.exit(1);
  }
  console.log(`OK: no ${TEST_SENDER_DOMAIN} in shipped files`);
}
