import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { VISITOR_NOT_FOUND as WIDGET_CODE } from "../packages/widget/src/api/first-message";
import { VISITOR_NOT_FOUND } from "./widget-visitor";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("POST /api/widget/conversations with a deleted visitor", () => {
  const route = read("app/api/widget/conversations/route.ts");

  it("checks the token's visitor exists in this workspace", () => {
    assert.match(
      route,
      /prisma\.visitor\.findFirst\(\{\s*where: \{ id: payload\.visitorId, workspaceId: workspace\.id \}/,
    );
  });

  it("returns 401 VISITOR_NOT_FOUND instead of hitting the FK with a 500", () => {
    assert.match(
      route,
      /if \(!exists\) \{\s*return NextResponse\.json\(\s*\{ error: "Visitor not found", code: VISITOR_NOT_FOUND \},\s*\{ status: 401 \},/,
    );
    // The check sits before the conversation is created.
    assert.ok(route.indexOf("if (!exists)") < route.indexOf("prisma.conversation.create"));
  });

  it("uses the same code the widget retries on", () => {
    assert.equal(VISITOR_NOT_FOUND, WIDGET_CODE);
  });
});
