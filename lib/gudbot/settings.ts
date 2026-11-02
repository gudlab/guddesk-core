export const DEFAULT_HANDOFF_MESSAGE =
  "Connecting you with our team. They'll have full context.";

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
export const DEFAULT_MAX_TURNS = 4;
export const DEFAULT_CHANNELS = ["widget"] as const;

export const MIN_CONFIDENCE_THRESHOLD = 0.5;
export const MAX_CONFIDENCE_THRESHOLD = 0.95;
export const MIN_MAX_TURNS = 1;
export const MAX_MAX_TURNS = 10;

export type GudBotChannel = "widget" | "email";

export interface GudBotSettings {
  enabled: boolean;
  confidenceThreshold: number;
  maxTurns: number;
  handoffMessage: string;
  channels: GudBotChannel[];
  optOutTags: string[];
}

export const DISABLED_GUDBOT_SETTINGS: GudBotSettings = {
  enabled: false,
  confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
  maxTurns: DEFAULT_MAX_TURNS,
  handoffMessage: DEFAULT_HANDOFF_MESSAGE,
  channels: [...DEFAULT_CHANNELS],
  optOutTags: [],
};

export function clampConfidenceThreshold(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CONFIDENCE_THRESHOLD;
  return Math.min(
    MAX_CONFIDENCE_THRESHOLD,
    Math.max(MIN_CONFIDENCE_THRESHOLD, value),
  );
}

export function clampMaxTurns(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MAX_TURNS;
  return Math.min(MAX_MAX_TURNS, Math.max(MIN_MAX_TURNS, Math.round(value)));
}

function parseChannels(value: unknown): GudBotChannel[] {
  if (!Array.isArray(value)) return [...DEFAULT_CHANNELS];
  const channels = value.filter(
    (item): item is GudBotChannel => item === "widget" || item === "email",
  );
  return channels.length > 0 ? channels : [...DEFAULT_CHANNELS];
}

function parseOptOutTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export type GudBotSettingsRow = {
  enabled?: boolean;
  confidenceThreshold?: number;
  maxTurns?: number;
  handoffMessage?: string | null;
  channels?: string[] | null;
  optOutTags?: string[] | null;
};

/** Missing row (or a brand-new workspace) means GudBot stays off. */
export function resolveGudBotSettings(
  row: GudBotSettingsRow | null | undefined,
): GudBotSettings {
  if (!row) return { ...DISABLED_GUDBOT_SETTINGS };
  return {
    enabled: row.enabled === true,
    confidenceThreshold: clampConfidenceThreshold(
      row.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD,
    ),
    maxTurns: clampMaxTurns(row.maxTurns ?? DEFAULT_MAX_TURNS),
    handoffMessage:
      typeof row.handoffMessage === "string" && row.handoffMessage.trim()
        ? row.handoffMessage.trim()
        : DEFAULT_HANDOFF_MESSAGE,
    channels: parseChannels(row.channels),
    optOutTags: parseOptOutTags(row.optOutTags),
  };
}

export function channelKey(
  channel: string | null | undefined,
): GudBotChannel | null {
  if (channel === "WIDGET" || channel === "widget") return "widget";
  if (channel === "EMAIL" || channel === "email") return "email";
  return null;
}

export function settingsAllowChannel(
  settings: GudBotSettings,
  channel: string | null | undefined,
): boolean {
  const key = channelKey(channel) ?? "widget";
  return settings.channels.includes(key);
}

export function hasOptOutTag(
  conversationTags: string[] | null | undefined,
  optOutTags: string[],
): boolean {
  if (!conversationTags?.length || !optOutTags.length) return false;
  const opted = new Set(optOutTags.map((tag) => tag.toLowerCase()));
  return conversationTags.some((tag) => opted.has(tag.toLowerCase()));
}
