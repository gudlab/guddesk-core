import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { deferGudBot } from "./defer";

const widgetMessageRoute = readFileSync(
  join(
    process.cwd(),
    "app",
    "api",
    "widget",
    "conversations",
    "[conversationId]",
    "messages",
    "route.ts",
  ),
  "utf8",
);

const widgetCreateRoute = readFileSync(
  join(process.cwd(), "app", "api", "widget", "conversations", "route.ts"),
  "utf8",
);

describe("widget GudBot wiring", () => {
  it("defers GudBot after a visitor message on an existing conversation", () => {
    assert.match(
      widgetMessageRoute,
      /import \{ scheduleGudBotTurn \} from "@\/lib\/gudbot\/run";/,
    );
    assert.match(
      widgetMessageRoute,
      /scheduleGudBotTurn\(\{\s*workspaceId: conversation\.workspaceId,\s*conversationId,\s*visitorMessage: message,\s*\}\)/,
    );
  });

  it("defers GudBot after the first widget message", () => {
    assert.match(
      widgetCreateRoute,
      /import \{ scheduleGudBotTurn \} from "@\/lib\/gudbot\/run";/,
    );
    assert.match(
      widgetCreateRoute,
      /scheduleGudBotTurn\(\{\s*workspaceId: workspace\.id,\s*conversationId: conversation\.id,\s*visitorMessage: message,\s*\}\)/,
    );
  });
});

describe("deferGudBot", () => {
  it("does not start the job before the response", () => {
    const scheduled: Array<() => Promise<void>> = [];
    let started = false;
    deferGudBot(
      (task) => scheduled.push(task),
      async () => {
        started = true;
      },
    );
    assert.equal(scheduled.length, 1);
    assert.equal(started, false);
  });

  it("still runs the job if after() cannot be used", async () => {
    let ran = false;
    deferGudBot(
      () => {
        throw new Error("after() outside a request");
      },
      async () => {
        ran = true;
      },
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(ran, true);
  });
});
