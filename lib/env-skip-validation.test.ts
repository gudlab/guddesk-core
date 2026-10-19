import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

/**
 * env.mjs validates when it is imported, so each case loads it in a fresh
 * Node process with a controlled env. None of the required app vars are set,
 * so validation fails unless the skip is honoured.
 */
const repoRoot = path.resolve(__dirname, "..");
const envModule = pathToFileURL(path.join(repoRoot, "env.mjs")).href;

function loadEnv(extra: Record<string, string>) {
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `await import(${JSON.stringify(envModule)}); console.log("env loaded");`,
    ],
    {
      cwd: repoRoot,
      env: { PATH: process.env.PATH ?? "", ...extra } as unknown as NodeJS.ProcessEnv,
      encoding: "utf8",
    },
  );
  return {
    loaded: child.status === 0 && child.stdout.includes("env loaded"),
    output: `${child.stdout}${child.stderr}`,
  };
}

describe("env.mjs SKIP_ENV_VALIDATION", () => {
  it("validates by default", () => {
    const result = loadEnv({});
    assert.equal(result.loaded, false);
    assert.match(result.output, /Invalid environment variables/);
  });

  it("skips validation for local scripts such as the MCP stdio server", () => {
    const result = loadEnv({ SKIP_ENV_VALIDATION: "1" });
    assert.equal(result.loaded, true, result.output);
  });

  it("ignores the skip on Vercel", () => {
    const result = loadEnv({ SKIP_ENV_VALIDATION: "1", VERCEL: "1" });
    assert.equal(result.loaded, false);
    assert.match(result.output, /Invalid environment variables/);
  });

  it("ignores the skip when NODE_ENV is production", () => {
    const result = loadEnv({
      SKIP_ENV_VALIDATION: "1",
      NODE_ENV: "production",
    });
    assert.equal(result.loaded, false);
    assert.match(result.output, /Invalid environment variables/);
  });

  it("only accepts the exact value 1", () => {
    for (const value of ["true", "yes", "0", ""]) {
      const result = loadEnv({ SKIP_ENV_VALIDATION: value });
      assert.equal(result.loaded, false, value);
    }
  });
});
