import { citationsFromRetrieved, type Citation } from "./citations";
import {
  belowThreshold,
  effectiveConfidence,
  passThroughEvidenceCheck,
  type EvidenceCheck,
} from "./confidence";
import { decideTurn, type HandoffReason, type SkipReason } from "./gate";
import { buildGudBotUserMessage, GUDBOT_SYSTEM, GUDBOT_TOOLS } from "./prompt";
import type { RankedArticle } from "./retrieve";
import type { GudBotSettings } from "./settings";
import { parseToolUses, type RawToolUse } from "./tools";

export type HistoryMessage = {
  role: "visitor" | "bot" | "agent" | "system";
  body: string;
};

export type GudBotOutcome =
  | { action: "skip"; reason: SkipReason }
  | {
      action: "handoff";
      reason: HandoffReason;
      suggestedReply?: string;
      confidence?: number;
      citations: Citation[];
    }
  | {
      action: "answer";
      text: string;
      confidence: number;
      evidenceScore: number;
      effective: number;
      citations: Citation[];
      reasoning?: string;
    };

export interface CompleteRequest {
  system: string;
  user: string;
  tools: typeof GUDBOT_TOOLS;
}

export interface GudBotLoopDeps {
  loadSettings: (workspaceId: string) => Promise<GudBotSettings>;
  loadConversation: (conversationId: string) => Promise<{
    workspaceId: string;
    status: string;
    channel: string | null;
    assigneeId: string | null;
    aiHandoffAt: Date | string | null;
    aiResolutionMethod: string | null;
    tags: string[];
  } | null>;
  countTurns: (conversationId: string) => Promise<number>;
  loadHistory: (conversationId: string) => Promise<HistoryMessage[]>;
  retrieve: (input: {
    workspaceId: string;
    query: string;
  }) => Promise<RankedArticle[]>;
  complete: (request: CompleteRequest) => Promise<RawToolUse[] | null>;
  evidenceCheck?: EvidenceCheck;
}

export async function runGudBotLoop(
  deps: GudBotLoopDeps,
  input: {
    workspaceId: string;
    conversationId: string;
    visitorMessage: string;
  },
): Promise<GudBotOutcome> {
  const settings = await deps.loadSettings(input.workspaceId);
  const conversation = await deps.loadConversation(input.conversationId);
  if (!conversation || conversation.workspaceId !== input.workspaceId) {
    return { action: "skip", reason: "disabled" };
  }

  const existingTurns = await deps.countTurns(input.conversationId);
  const turn = decideTurn({ settings, conversation, existingTurns });
  if (turn.kind === "skip") return { action: "skip", reason: turn.reason };
  if (turn.kind === "handoff") {
    return { action: "handoff", reason: turn.reason, citations: [] };
  }

  const retrieved = await deps.retrieve({
    workspaceId: input.workspaceId,
    query: input.visitorMessage,
  });
  if (retrieved.length === 0) {
    return { action: "handoff", reason: "no_evidence", citations: [] };
  }

  const history = await deps.loadHistory(input.conversationId);
  const toolUses = await deps.complete({
    system: GUDBOT_SYSTEM,
    user: buildGudBotUserMessage({
      visitorMessage: input.visitorMessage,
      history,
      articles: retrieved,
    }),
    tools: GUDBOT_TOOLS,
  });

  if (!toolUses) {
    // Model unavailable: leave the conversation in the existing unassigned queue.
    return { action: "skip", reason: "unavailable" };
  }

  const parsed = parseToolUses(toolUses);
  if (!parsed) {
    return { action: "handoff", reason: "explicit", citations: [] };
  }

  if (parsed.kind === "request_handoff") {
    return {
      action: "handoff",
      reason: "explicit",
      suggestedReply: parsed.suggestedReply,
      citations: [],
    };
  }

  const citations = citationsFromRetrieved(parsed.citationIds, retrieved);
  const evidenceCheck = deps.evidenceCheck ?? passThroughEvidenceCheck;
  const evidenceScore = await evidenceCheck({
    answer: parsed.text,
    citations,
    retrieved,
  });
  const effective = effectiveConfidence(parsed.confidence, evidenceScore);

  if (belowThreshold(effective, settings.confidenceThreshold)) {
    return {
      action: "handoff",
      reason: "low_confidence",
      suggestedReply: parsed.text,
      confidence: effective,
      citations,
    };
  }

  return {
    action: "answer",
    text: parsed.text,
    confidence: parsed.confidence,
    evidenceScore,
    effective,
    citations,
    reasoning: parsed.reasoning,
  };
}
