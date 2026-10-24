import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { before, describe, it } from "node:test";

import jwt from "jsonwebtoken";

import { resolveWidgetAuthVisitor, type WidgetVisitorDeps } from "./widget-visitor";

const SECRET = "widget-visitor-test-secret";
const WS_A = "ws_a";
const WS_B = "ws_b";

// lib/visitor-auth.ts validates env.mjs on import, so set the required vars
// first and import it dynamically.
let createVisitorToken: (visitorId: string, workspaceId: string) => string;
let verifyVisitorToken: WidgetVisitorDeps["verifyToken"];

before(async () => {
  process.env.AUTH_SECRET = SECRET;
  process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
  process.env.GOOGLE_CLIENT_ID ??= "x";
  process.env.GOOGLE_CLIENT_SECRET ??= "x";
  process.env.DATABASE_URL ??= "postgresql://u:p@localhost:5432/db";
  process.env.RESEND_API_KEY ??= "x";
  const mod = await import("./visitor-auth");
  createVisitorToken = mod.createVisitorToken;
  verifyVisitorToken = mod.verifyVisitorToken;
});

/** In-memory visitors table. */
function fakeDb(rows: Array<{ id: string; workspaceId: string }> = []) {
  const visitors = [...rows];
  let seq = 0;
  const touched: string[] = [];
  const deps: WidgetVisitorDeps = {
    verifyToken: (token) => verifyVisitorToken(token),
    findVisitor: async (id, workspaceId) =>
      visitors.find((v) => v.id === id && v.workspaceId === workspaceId) ?? null,
    createVisitor: async (workspaceId) => {
      const row = { id: `v_new_${++seq}`, workspaceId };
      visitors.push(row);
      return { id: row.id };
    },
    touchVisitor: async (id) => {
      touched.push(id);
    },
  };
  return { deps, visitors, touched };
}

describe("POST /api/widget/auth visitor reuse", () => {
  it("creates a visitor when there is no token", async () => {
    const db = fakeDb();
    const result = await resolveWidgetAuthVisitor(WS_A, null, db.deps);
    assert.deepEqual(result, { visitorId: "v_new_1", reused: false });
    assert.equal(db.visitors.length, 1);
  });

  it("reuses the visitor on reload instead of adding a row", async () => {
    const db = fakeDb([{ id: "v_1", workspaceId: WS_A }]);
    const token = createVisitorToken("v_1", WS_A);
    for (let i = 0; i < 3; i++) {
      const result = await resolveWidgetAuthVisitor(WS_A, token, db.deps);
      assert.deepEqual(result, { visitorId: "v_1", reused: true });
    }
    assert.equal(db.visitors.length, 1);
    assert.deepEqual(db.touched, ["v_1", "v_1", "v_1"]);
  });

  it("rejects a token from another workspace and creates a new visitor", async () => {
    const db = fakeDb([{ id: "v_b", workspaceId: WS_B }]);
    const tokenForB = createVisitorToken("v_b", WS_B);
    const result = await resolveWidgetAuthVisitor(WS_A, tokenForB, db.deps);
    assert.equal(result.reused, false);
    assert.notEqual(result.visitorId, "v_b");
    assert.equal(db.visitors.find((v) => v.id === result.visitorId)?.workspaceId, WS_A);
  });

  it("does not reuse a visitor id from another workspace even inside a token for this one", async () => {
    // A token that names this workspace but a visitor that lives elsewhere.
    const db = fakeDb([{ id: "v_b", workspaceId: WS_B }]);
    const token = createVisitorToken("v_b", WS_A);
    const result = await resolveWidgetAuthVisitor(WS_A, token, db.deps);
    assert.equal(result.reused, false);
    assert.notEqual(result.visitorId, "v_b");
  });

  it("creates a new visitor for an invalid, expired or wrongly signed token", async () => {
    const db = fakeDb([{ id: "v_1", workspaceId: WS_A }]);
    const expired = jwt.sign({ visitorId: "v_1", workspaceId: WS_A }, SECRET, { expiresIn: -60 });
    const otherSecret = jwt.sign({ visitorId: "v_1", workspaceId: WS_A }, "not-the-secret");
    for (const token of ["garbage", "", expired, otherSecret]) {
      const result = await resolveWidgetAuthVisitor(WS_A, token, db.deps);
      assert.equal(result.reused, false, token);
    }
    assert.equal(db.visitors.length, 5);
    assert.deepEqual(db.touched, []);
  });

  it("creates a new visitor when the token's visitor was deleted", async () => {
    const db = fakeDb();
    const token = createVisitorToken("v_gone", WS_A);
    const result = await resolveWidgetAuthVisitor(WS_A, token, db.deps);
    assert.equal(result.reused, false);
  });
});

describe("widget loads without creating a visitor", () => {
  const root = join(__dirname, "..");
  const read = (path: string) => readFileSync(join(root, path), "utf8");

  it("the widget source and bundles never call /api/widget/auth", () => {
    for (const path of [
      "packages/widget/src/widget.tsx",
      "packages/widget/src/api/client.ts",
      "public/widget.js",
      "packages/widget/dist/guddesk.umd.cjs",
      "packages/widget/dist/guddesk.js",
    ]) {
      assert.equal(read(path).includes("/api/widget/auth"), false, path);
    }
  });

  it("identify still posts to /api/widget/visitors with the stored token and userHash", () => {
    const client = read("packages/widget/src/api/client.ts");
    assert.match(client, /"\/api\/widget\/visitors"/);
    assert.match(client, /buildIdentifyPayload\(appId, visitorToken\.value, info\)/);
    const payload = read("packages/widget/src/api/identify-payload.ts");
    assert.match(payload, /userHash: info\.userHash/);
    assert.match(payload, /externalId: info\.userId/);
  });

  it("the first message creates the visitor through /api/widget/conversations", () => {
    const client = read("packages/widget/src/api/client.ts");
    assert.match(client, /"\/api\/widget\/conversations"/);
    const route = read("app/api/widget/conversations/route.ts");
    assert.match(route, /prisma\.visitor\.create/);
    assert.match(route, /payload\.workspaceId === workspace\.id/);
  });
});
