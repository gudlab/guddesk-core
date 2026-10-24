import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";

// Every useConversations() instance runs its own list poller (and its own
// Pusher bindings). The inbox must mount exactly one, in InboxLayout, and
// hand the list to ConversationList as props.
// scripts/run-tests.mjs runs from the repo root.
const ROOT = process.cwd();

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(tsx?|jsx?)$/.test(name) && !name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

describe("conversation list poller", () => {
  it("is mounted once, in InboxLayout", () => {
    const callers = ["app", "components"]
      .flatMap((dir) => sourceFiles(join(ROOT, dir)))
      .filter((file) => /\buseConversations\s*\(/.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file).split("\\").join("/"));
    assert.deepEqual(callers, ["components/inbox/inbox-layout.tsx"]);
  });

  it("is called once inside InboxLayout", () => {
    const source = readFileSync(join(ROOT, "components/inbox/inbox-layout.tsx"), "utf8");
    assert.equal(source.match(/\buseConversations\s*\(/g)?.length, 1);
  });
});
