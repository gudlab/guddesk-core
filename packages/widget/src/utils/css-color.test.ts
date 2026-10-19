import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_WIDGET_COLOR,
  isSafeCssColor,
  safeCssColor,
} from "./css-color";

describe("isSafeCssColor", () => {
  it("accepts hex colors of length 3, 4, 6, and 8", () => {
    for (const color of [
      "#abc",
      "#ABCD",
      "#3ECF8E",
      "#3ecf8e80",
      " #6366F1 ",
    ]) {
      assert.equal(isSafeCssColor(color), true, color);
    }
  });

  it("accepts rgb() and rgba() with numeric arguments", () => {
    for (const color of [
      "rgb(0, 0, 0)",
      "rgb(255,99,71)",
      "RGBA(255, 99, 71, 0.5)",
      "rgba(100%, 50%, 0%, .25)",
    ]) {
      assert.equal(isSafeCssColor(color), true, color);
    }
  });

  it("rejects names, bad hex, and anything that could inject CSS", () => {
    for (const color of [
      "",
      "red",
      "#ab",
      "#abcde",
      "#ggg",
      "3ECF8E",
      "rgb(0, 0)",
      "rgb(a, b, c)",
      "rgb(0, 0, 0, 0, 0)",
      "#fff; } body { display: none",
      "red;background:url(https://evil.test/x)",
      "rgb(0,0,0)}*{color:red",
      "var(--x)",
      "expression(alert(1))",
      undefined,
      null,
      42,
    ]) {
      assert.equal(isSafeCssColor(color), false, String(color));
    }
  });
});

describe("safeCssColor", () => {
  it("returns the trimmed color when safe", () => {
    assert.equal(safeCssColor(" #6366F1 "), "#6366F1");
  });

  it("falls back to the default color when unsafe", () => {
    assert.equal(safeCssColor("red;}"), DEFAULT_WIDGET_COLOR);
    assert.equal(safeCssColor(undefined), DEFAULT_WIDGET_COLOR);
  });

  it("uses a safe fallback and ignores an unsafe one", () => {
    assert.equal(safeCssColor("nope", "#123456"), "#123456");
    assert.equal(safeCssColor("nope", "also;bad"), DEFAULT_WIDGET_COLOR);
  });
});
