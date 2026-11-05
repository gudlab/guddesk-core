import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  parseWidgetAppId,
  WIDGET_APP_ID_REQUIRED,
} from "./widget-app-id";

const ROOT = process.cwd();
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("parseWidgetAppId", () => {
  it("returns 400 when appId is missing", () => {
    for (const raw of [undefined, null, "", 0, false]) {
      assert.deepEqual(parseWidgetAppId(raw), {
        ok: false,
        status: 400,
        error: WIDGET_APP_ID_REQUIRED,
      });
    }
  });

  it("strips a leading gd_pub_ prefix before lookup", () => {
    assert.deepEqual(parseWidgetAppId("gd_pub_abc123"), {
      ok: true,
      appId: "abc123",
    });
    assert.deepEqual(parseWidgetAppId("abc123"), { ok: true, appId: "abc123" });
  });

  it("config and auth routes use parseWidgetAppId and return 400 when it fails", () => {
    for (const rel of [
      "app/api/widget/config/route.ts",
      "app/api/widget/auth/route.ts",
    ]) {
      const src = read(rel);
      assert.match(src, /parseWidgetAppId/, rel);
      assert.match(src, /status: parsed\.status/, rel);
      const parseAt = src.indexOf("parseWidgetAppId");
      const lookupAt = src.indexOf("prisma.workspace.findUnique");
      assert.ok(parseAt >= 0 && parseAt < lookupAt, rel);
    }
  });
});
