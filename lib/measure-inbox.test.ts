import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { percentile } from "../scripts/measure-inbox.mjs";

describe("inbox measure percentile", () => {
  it("returns the only sample", () => {
    assert.equal(percentile([12], 95), 12);
  });

  it("interpolates p95 on a short series", () => {
    const values = [10, 20, 30, 40, 50];
    assert.equal(percentile(values, 50), 30);
    assert.equal(percentile(values, 95), 48);
  });
});
