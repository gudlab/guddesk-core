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

describe("README copy", () => {
  it("does not claim automation rules run", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const row = readme.split("\n").find((line) => /^\|\s*Automation rules\s*\|/.test(line));
    assert.ok(row, "expected an Automation rules table row");
    assert.doesNotMatch(row, /\|\s*Yes\s*\|?\s*$/i);
    assert.match(row, /Not yet|Planned|don't run yet|do not run yet/i);
  });
});

describe("in-app automations copy", () => {
  it("dashboard and Automations header say saved rules do not run", () => {
    const dashboard = readFileSync(join(process.cwd(), "app/(protected)/dashboard/page.tsx"), "utf8");
    const page = readFileSync(
      join(process.cwd(), "app/(protected)/workspace/[workspaceSlug]/automations/page.tsx"),
      "utf8",
    );
    const showcase = readFileSync(
      join(process.cwd(), "components/sections/automations-showcase.tsx"),
      "utf8",
    );
    assert.match(dashboard, /Save automation rules\. They do not run yet\./);
    assert.doesNotMatch(dashboard, /Set up rules and workflows/);
    assert.match(page, /Save rules with a trigger and an action\. Saved rules do not run yet\./);
    assert.doesNotMatch(page, /automatically handle conversations/);
    assert.match(showcase, /Planned triggers/);
    assert.match(showcase, /Planned actions/);
    assert.doesNotMatch(showcase, /Supported triggers|Available actions/);
  });
});

describe("terms copy", () => {
  it("Free plan matches the lock", () => {
    const terms = readFileSync(join(process.cwd(), "content/pages/terms.mdx"), "utf8");
    assert.match(
      terms,
      /up to 3 members, unlimited conversations, 50 GudBot answers a month/,
    );
    assert.doesNotMatch(terms, /2 members, 500 conversations/);
  });
});

describe("ROADMAP copy", () => {
  it("lists CSAT and NPS surveys as planned", () => {
    const md = readFileSync(join(process.cwd(), "ROADMAP.md"), "utf8");
    assert.match(md, /^- \[ \] \*\*CSAT surveys\*\*:/m);
    assert.match(md, /^- \[ \] \*\*NPS surveys\*\*:/m);
    assert.doesNotMatch(md, /^- \[x\] \*\*CSAT surveys\*\*:/m);
    assert.doesNotMatch(md, /^- \[x\] \*\*NPS surveys\*\*:/m);
  });
});
