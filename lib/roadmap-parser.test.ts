import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { parseRoadmap } from "./roadmap-parser";

function countItems(phases: ReturnType<typeof parseRoadmap>) {
  return phases.reduce((sum, phase) => sum + phase.total, 0);
}

describe("parseRoadmap", () => {
  it("parses every checklist item in the Phase sections of ROADMAP.md", () => {
    const markdown = readFileSync(join(process.cwd(), "ROADMAP.md"), "utf8");
    const phases = parseRoadmap(markdown);

    // The parser only reads items under "## Phase" headings, so count the
    // checklist lines from the first Phase heading onwards.
    const fromFirstPhase = markdown.slice(markdown.search(/^## Phase \d+:/m));
    const expected = fromFirstPhase
      .split("\n")
      .filter((line) => /^- \[[ xX]\] /.test(line)).length;

    const parsed = countItems(phases);
    assert.ok(parsed > 100, `expected more than 100 items, got ${parsed}`);
    assert.equal(parsed, expected);
    assert.ok(phases.length >= 6);
  });

  it("accepts the colon and the older dash separator", () => {
    const md = [
      "## Phase 1: Test",
      "### Section",
      "- [x] **Colon item**: done with a colon",
      "- [ ] **Dash item** \u2014 done with a dash",
    ].join("\n");
    const [phase] = parseRoadmap(md);
    const items = phase.sections[0].items;
    assert.deepEqual(items, [
      { checked: true, title: "Colon item", description: "done with a colon" },
      { checked: false, title: "Dash item", description: "done with a dash" },
    ]);
    assert.equal(phase.checked, 1);
    assert.equal(phase.total, 2);
  });

  it("accepts a title with no description", () => {
    const md = ["## Phase 1: Test", "### Section", "- [X] **Bare title**"].join("\n");
    const [phase] = parseRoadmap(md);
    assert.deepEqual(phase.sections[0].items, [
      { checked: true, title: "Bare title", description: "" },
    ]);
  });
});
