import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getPlanLimits, isHostedPlanEnforcement } from "@/lib/feature-flags";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
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

  if (isHostedPlanEnforcement()) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: opts.workspaceId },
      select: { plan: true },
    });
    if (!getPlanLimits(workspace?.plan).aiEnabled) return null;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: opts.messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : null;

    // Log usage
    await prisma.aiUsageLog.create({
      data: {
        workspaceId: opts.workspaceId,
        feature: opts.feature,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        conversationId: opts.conversationId,
      },
    });

    return text;
  } catch (error) {
    console.error("Claude API error:", error);
    return null;
  }
}
