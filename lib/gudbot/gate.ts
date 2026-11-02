import {
  hasOptOutTag,
  settingsAllowChannel,
  type GudBotSettings,
} from "./settings";

export type HandoffReason =
  | "low_confidence"
  | "max_turns"
  | "explicit"
  | "no_evidence";

export type SkipReason =
  | "disabled"
  | "channel"
  | "handed_off"
  | "assigned"
  | "opted_out"
  | "closed"
  | "unavailable";

export interface ConversationGateInput {
  status: string;
  channel: string | null | undefined;
  assigneeId: string | null | undefined;
  aiHandoffAt: Date | string | null | undefined;
  aiResolutionMethod: string | null | undefined;
  tags: string[] | null | undefined;
}

export function skipReason(
  settings: GudBotSettings,
  conversation: ConversationGateInput,
): SkipReason | null {
  if (!settings.enabled) return "disabled";
  if (!settingsAllowChannel(settings, conversation.channel)) return "channel";
  if (conversation.status === "CLOSED") return "closed";
  if (conversation.aiHandoffAt || conversation.aiResolutionMethod === "HANDED_OFF") {
    return "handed_off";
  }
  if (conversation.assigneeId) return "assigned";
  if (hasOptOutTag(conversation.tags, settings.optOutTags)) return "opted_out";
  return null;
}

export type TurnDecision =
  | { kind: "skip"; reason: SkipReason }
  | { kind: "handoff"; reason: HandoffReason }
  | { kind: "complete" };

export function decideTurn(input: {
  settings: GudBotSettings;
  conversation: ConversationGateInput;
  existingTurns: number;
}): TurnDecision {
  const skipped = skipReason(input.settings, input.conversation);
  if (skipped) return { kind: "skip", reason: skipped };
  if (input.existingTurns >= input.settings.maxTurns) {
    return { kind: "handoff", reason: "max_turns" };
  }
  return { kind: "complete" };
}
