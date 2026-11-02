import { z } from "zod";

import { clamp01 } from "./confidence";

const submitResponseSchema = z.object({
  text: z.string().min(1),
  confidence: z.number(),
  reasoning: z.string().optional(),
  citationIds: z.array(z.string()).default([]),
});

const requestHandoffSchema = z.object({
  reason: z.string().min(1),
  suggestedReply: z.string().optional(),
});

export type ParsedSubmitResponse = {
  kind: "submit_response";
  text: string;
  confidence: number;
  reasoning?: string;
  citationIds: string[];
};

export type ParsedHandoff = {
  kind: "request_handoff";
  reason: string;
  suggestedReply?: string;
};

export type ParsedToolUse = ParsedSubmitResponse | ParsedHandoff;

export interface RawToolUse {
  name: string;
  input: unknown;
}

export function parseToolUses(toolUses: RawToolUse[]): ParsedToolUse | null {
  const handoff = toolUses.find((use) => use.name === "request_handoff");
  if (handoff) {
    const parsed = requestHandoffSchema.safeParse(handoff.input);
    if (!parsed.success) return null;
    return {
      kind: "request_handoff",
      reason: parsed.data.reason.trim(),
      suggestedReply: parsed.data.suggestedReply?.trim() || undefined,
    };
  }

  const submit = toolUses.find((use) => use.name === "submit_response");
  if (!submit) return null;
  const parsed = submitResponseSchema.safeParse(submit.input);
  if (!parsed.success) return null;
  return {
    kind: "submit_response",
    text: parsed.data.text.trim(),
    confidence: clamp01(parsed.data.confidence),
    reasoning: parsed.data.reasoning?.trim() || undefined,
    citationIds: parsed.data.citationIds,
  };
}
