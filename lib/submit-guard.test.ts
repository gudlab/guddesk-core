import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimSubmit, releaseSubmit } from "./submit-guard";

const read = (path: string) => readFileSync(join(__dirname, "..", path), "utf8");

describe("reply submit guard", () => {
  it("two submits in the same tick: only the first goes through", () => {
    const ref = { current: false };
    let sends = 0;
    const handle = () => {
      if (!claimSubmit(ref)) return;
      sends++;
    };
    handle();
    handle();
    assert.equal(sends, 1);
    releaseSubmit(ref);
    handle();
    assert.equal(sends, 2);
  });

  it("both reply boxes check isPending and the ref before sending, and free it when done", () => {
    for (const path of ["components/inbox/reply-box.tsx", "components/inbox/shared-draft-editor.tsx"]) {
      const source = read(path);
      assert.match(source, /if \(!trimmed \|\| isPending\) return;\s*if \(!claimSubmit\(inFlight\)\) return;/, path);
      assert.match(source, /finally \{\s*releaseSubmit\(inFlight\);/, path);
    }
    // Enter goes through the same guarded handler.
    assert.match(read("components/inbox/reply-box.tsx"), /e\.key === "Enter" && !e\.shiftKey\) \{\s*e\.preventDefault\(\);\s*handleSubmit\(\);/);
  });
});
