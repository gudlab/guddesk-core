import * as z from "zod";

import {
  DEFAULT_CHANNELS,
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_HANDOFF_MESSAGE,
  DEFAULT_MAX_TURNS,
  MAX_CONFIDENCE_THRESHOLD,
  MAX_MAX_TURNS,
  MIN_CONFIDENCE_THRESHOLD,
  MIN_MAX_TURNS,
} from "@/lib/gudbot/settings";

export const gudBotSettingsSchema = z.object({
  enabled: z.boolean(),
  confidenceThreshold: z
    .number()
    .min(MIN_CONFIDENCE_THRESHOLD)
    .max(MAX_CONFIDENCE_THRESHOLD)
    .default(DEFAULT_CONFIDENCE_THRESHOLD),
  maxTurns: z
    .number()
    .int()
    .min(MIN_MAX_TURNS)
    .max(MAX_MAX_TURNS)
    .default(DEFAULT_MAX_TURNS),
  handoffMessage: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .default(DEFAULT_HANDOFF_MESSAGE),
  channels: z
    .array(z.enum(["widget", "email"]))
    .min(1)
    .default([...DEFAULT_CHANNELS]),
});

export type GudBotSettingsInput = z.infer<typeof gudBotSettingsSchema>;
