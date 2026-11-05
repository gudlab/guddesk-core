import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  findBareImports,
  gzipSizeOf,
  WIDGET_GZIP_BUDGET_BYTES,
} from "../scripts/check-widget-bundle.mjs";

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("built widget bundle", () => {
  it("public/widget.js does not import any package by name", () => {
    assert.deepEqual(findBareImports(read("public/widget.js")), []);
  });

  it("packages/widget/dist does not import any package by name", () => {
    assert.deepEqual(
      findBareImports(read("packages/widget/dist/guddesk.umd.cjs")),
      [],
    );
    assert.deepEqual(
      findBareImports(read("packages/widget/dist/guddesk.js")),
      [],
    );
  });

  it("public/widget.js matches the committed UMD build", () => {
    assert.equal(
      read("public/widget.js"),
      read("packages/widget/dist/guddesk.umd.cjs"),
    );
  });

  it("the hosted bundle keeps widget keystrokes inside the shadow root", () => {
    const bundle = read("public/widget.js");
    assert.match(bundle, /stopPropagation/);
    assert.match(bundle, /addEventListener\("keydown"/);
  });

  it("public/widget.js stays at or under the 50KB gzip budget", () => {
    const gzipBytes = gzipSizeOf(readFileSync(join(root, "public/widget.js")));
    assert.ok(
      gzipBytes <= WIDGET_GZIP_BUDGET_BYTES,
      `gzip ${gzipBytes} bytes exceeds budget ${WIDGET_GZIP_BUDGET_BYTES}`,
    );
  });
});

describe("findBareImports", () => {
  it("finds bare dynamic imports, static imports and requires", () => {
    assert.deepEqual(
      findBareImports('const{default:i}=await import("pusher-js");'),
      ["pusher-js"],
    );
    assert.deepEqual(findBareImports("import Pusher from 'pusher-js';"), [
      "pusher-js",
    ]);
    assert.deepEqual(findBareImports('import{h as a}from"preact";'), [
      "preact",
    ]);
    assert.deepEqual(findBareImports('import "side-effect";'), ["side-effect"]);
    assert.deepEqual(
      findBareImports('module.exports=t(require("pusher-js"))'),
      ["pusher-js"],
    );
  });

  it("ignores relative paths, URLs and non-import calls", () => {
    assert.deepEqual(
      findBareImports(
        [
          'import("./chunk.js")',
          'import("/static/a.js")',
          'import("https://cdn.example.com/a.js")',
          '__webpack_require__("x")',
          'obj.require("x")',
          'Array.from("abc")',
        ].join(";"),
      ),
      [],
    );
  });
});
