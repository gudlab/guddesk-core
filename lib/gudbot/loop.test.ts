import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISABLED_GUDBOT_SETTINGS, type GudBotSettings } from "./settings";
import { runGudBotLoop, type GudBotLoopDeps } from "./loop";
import type { RankedArticle } from "./retrieve";
import type { RawToolUse } from "./tools";

const article: RankedArticle = {
  id: "art_1",
  title: "Refund policy",
  excerpt: "Refunds take 5 business days after we receive the item.",
  slug: "refund-policy",
  collectionSlug: "billing",
  score: 5,
};

const enabled: GudBotSettings = {
  ...DISABLED_GUDBOT_SETTINGS,
  enabled: true,
};

function conversation() {
  return {
    workspaceId: "ws_1",
    status: "OPEN",
    channel: "WIDGET" as const,
    assigneeId: null,
    aiHandoffAt: null,
    aiResolutionMethod: null,
    tags: [] as string[],
  };
}

function harness(opts: {
  settings?: GudBotSettings;
  retrieved?: RankedArticle[];
  toolUses?: RawToolUse[] | null;
}) {
  let completeCalls = 0;
  const deps: GudBotLoopDeps = {
    loadSettings: async () => opts.settings ?? enabled,
    loadConversation: async () => conversation(),
    countTurns: async () => 0,
    loadHistory: async () => [],
    retrieve: async () => opts.retrieved ?? [article],
    complete: async () => {
      completeCalls += 1;
      return opts.toolUses === undefined
        ? [
            {
              name: "submit_response",
              input: {
                text: "Refunds take 5 business days.",
                confidence: 0.9,
                citationIds: ["art_1"],
              },
            },
          ]
        : opts.toolUses;
    },
  };
  return {
    deps,
    completeCalls: () => completeCalls,
    run: () =>
      runGudBotLoop(deps, {
        workspaceId: "ws_1",
        conversationId: "conv_1",
        visitorMessage: "How do refunds work?",
      }),
  };
}

describe("runGudBotLoop", () => {
  it("never invokes the model when the workspace has GudBot disabled", async () => {
    const h = harness({ settings: DISABLED_GUDBOT_SETTINGS });
    const outcome = await h.run();
    assert.deepEqual(outcome, { action: "skip", reason: "disabled" });
    assert.equal(h.completeCalls(), 0);
  });

  it("hands off instead of posting a visitor BOT reply when confidence is below the threshold", async () => {
    const h = harness({
      toolUses: [
        {
          name: "submit_response",
          input: {
            text: "I think this might be a refund?",
            confidence: 0.2,
            citationIds: ["art_1"],
          },
        },
      ],
    });
    const outcome = await h.run();
    assert.equal(outcome.action, "handoff");
    if (outcome.action !== "handoff") return;
    assert.equal(outcome.reason, "low_confidence");
    assert.equal(outcome.suggestedReply, "I think this might be a refund?");
    assert.equal(h.completeCalls(), 1);
  });

  it("strips citation ids that were not in the retrieved set", async () => {
    const h = harness({
      toolUses: [
        {
          name: "submit_response",
          input: {
            text: "Refunds take 5 business days.",
            confidence: 0.9,
            citationIds: ["art_1", "hallucinated-article"],
          },
        },
      ],
    });
    const outcome = await h.run();
    assert.equal(outcome.action, "answer");
    if (outcome.action !== "answer") return;
    assert.deepEqual(
      outcome.citations.map((citation) => citation.id),
      ["art_1"],
    );
  });

  it("hands off when no published articles match", async () => {
    const h = harness({ retrieved: [] });
    const outcome = await h.run();
    assert.deepEqual(outcome, {
      action: "handoff",
      reason: "no_evidence",
      citations: [],
    });
    assert.equal(h.completeCalls(), 0);
  });

  it("posts an answer when confidence is at or above the threshold", async () => {
    const h = harness({});
    const outcome = await h.run();
    assert.equal(outcome.action, "answer");
    if (outcome.action !== "answer") return;
    assert.equal(outcome.text, "Refunds take 5 business days.");
    assert.ok(outcome.effective >= enabled.confidenceThreshold);
  });

  it("hands off at max turns without calling the model", async () => {
    const h = harness({ settings: { ...enabled, maxTurns: 1 } });
    h.deps.countTurns = async () => 1;
    const outcome = await h.run();
    assert.deepEqual(outcome, {
      action: "handoff",
      reason: "max_turns",
      citations: [],
    });
    assert.equal(h.completeCalls(), 0);
  });
});
