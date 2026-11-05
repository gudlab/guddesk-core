import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { GET } from "../app/api/health/route";
import { HEALTH_HEADERS, HEALTH_OK } from "./health";

const read = (...p: string[]) =>
  readFileSync(join(process.cwd(), ...p), "utf8");

describe("GET /api/health", () => {
  it("returns 200 JSON { ok: true, status: ok } with Cache-Control no-store", async () => {
    const res = await GET();
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), HEALTH_OK);
    assert.deepEqual(HEALTH_OK, { ok: true, status: "ok" });
    assert.equal(
      res.headers.get("Cache-Control"),
      HEALTH_HEADERS["Cache-Control"],
    );
    assert.equal(HEALTH_HEADERS["Cache-Control"], "no-store");
  });

  it("the route is GET-only, public, and does not touch prisma or env", () => {
    const src = read("app", "api", "health", "route.ts");
    assert.match(src, /export function GET\(/);
    assert.match(src, /HEALTH_OK/);
    assert.match(src, /HEALTH_HEADERS/);
    assert.equal(src.includes("export const POST"), false);
    assert.equal(src.includes("export async function POST"), false);
    assert.equal(src.includes("prisma"), false);
    assert.equal(src.includes("env.mjs"), false);
    assert.equal(/from ["']auth["']/.test(src), false);
  });

  it("Compose probes /api/health instead of the homepage", () => {
    const src = read("docker-compose.yml");
    assert.match(src, /127\.0\.0\.1:3000\/api\/health/);
    assert.equal(src.includes("fetch('http://127.0.0.1:3000')"), false);
  });
});
