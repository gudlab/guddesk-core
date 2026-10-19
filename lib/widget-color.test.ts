import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isSafeCssColor } from "../packages/widget/src/utils/css-color";
import {
  WIDGET_PRIMARY_COLOR_ERROR,
  widgetPrimaryColorError,
} from "./widget-color";

describe("widgetPrimaryColorError", () => {
  it("accepts #rrggbb in any case", () => {
    assert.equal(widgetPrimaryColorError("#3ECF8E"), null);
    assert.equal(widgetPrimaryColorError("#3ecf8e"), null);
  });

  it("rejects names, short or long hex, and CSS fragments", () => {
    for (const value of [
      "red",
      "",
      "#fff",
      "#3ECF8E80",
      "3ECF8E",
      " #3ECF8E",
      "#3ECF8E;}",
      "rgb(1,2,3)",
    ]) {
      assert.equal(
        widgetPrimaryColorError(value),
        WIDGET_PRIMARY_COLOR_ERROR,
        value,
      );
    }
  });

  it("only allows colors the widget also accepts", () => {
    for (const value of ["#3ECF8E", "#000000", "#abcdef"]) {
      assert.equal(widgetPrimaryColorError(value), null);
      assert.equal(isSafeCssColor(value), true);
    }
  });
});
