import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isZipBuffer, unzipTextFiles, zipTextFiles } from "./zip";

describe("zipTextFiles", () => {
  it("round-trips JSON files", () => {
    const zip = zipTextFiles({
      "contacts.json": '{"ok":true}',
      "nested/articles.json": "[1]",
    });
    assert.equal(isZipBuffer(zip), true);
    const { files } = unzipTextFiles(zip);
    assert.equal(files["contacts.json"], '{"ok":true}');
    assert.equal(files["articles.json"], "[1]");
  });

  it("skips binary names and reports zip64-style entries as warnings only via skip", () => {
    const zip = zipTextFiles({ "notes.txt": "hello" });
    const { files, warnings } = unzipTextFiles(zip);
    assert.equal(files["notes.txt"], "hello");
    assert.deepEqual(warnings, []);
  });
});
