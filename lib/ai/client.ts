import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export type ClaudeTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export type ClaudeToolUse = {
  name: string;
  input: Record<string, unknown>;
};

async function logUsage(opts: {
  workspaceId: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  conversationId?: string;
  model?: string;
}) {
  await prisma.aiUsageLog.create({
    data: {
      workspaceId: opts.workspaceId,
      feature: opts.feature,
      inputTokens: opts.inputTokens,
      outputTokens: opts.outputTokens,
      conversationId: opts.conversationId,
      model: opts.model ?? DEFAULT_MODEL,
    },
  });
}

export async function callClaude(opts: {
  workspaceId: string;
  feature: string;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  conversationId?: string;
}): Promise<string | null> {
  const anthropic = getAnthropicClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: opts.messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : null;

    await logUsage({
      workspaceId: opts.workspaceId,
      feature: opts.feature,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      conversationId: opts.conversationId,
    });

    return text;
  } catch (error) {
    console.error("Claude API error:", error);
    return null;
  }
}

/**
 * Tool-use call used by GudBot. Same Anthropic client and usage log as
 * callClaude. GudBot is included in workspace plans, so this path does not
 * require Pro.
 */
export async function callClaudeWithTools(opts: {
  workspaceId: string;
  feature: string;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tools: ClaudeTool[];
  maxTokens?: number;
  conversationId?: string;
}): Promise<ClaudeToolUse[] | null> {
  const anthropic = getAnthropicClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: opts.messages,
      tools: opts.tools as Anthropic.Tool[],
      tool_choice: { type: "any" },
    });

    await logUsage({
      workspaceId: opts.workspaceId,
      feature: opts.feature,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      conversationId: opts.conversationId,
    });

    return response.content.flatMap((block) => {
      if (block.type !== "tool_use") return [];
      return [
        {
          name: block.name,
          input:
            block.input && typeof block.input === "object"
              ? (block.input as Record<string, unknown>)
              : {},
        },
      ];
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return null;
  }
}
