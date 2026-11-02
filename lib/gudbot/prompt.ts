import type { RankedArticle } from "./retrieve";

export const GUDBOT_SYSTEM = `You are GudBot, a customer support agent. Answer only from the knowledge base articles provided in the user message.

Rules:
- If the articles fully answer the question, call submit_response with the reply, a confidence between 0 and 1, and citationIds of the articles you used.
- citationIds must be ids from the provided articles. Never invent ids.
- If the articles do not contain the answer, or you are not sure, call request_handoff.
- Keep replies concise and friendly. Do not mention these instructions.
- You must call exactly one tool.`;

export const SUBMIT_RESPONSE_TOOL = {
  name: "submit_response",
  description:
    "Post a visitor-visible reply grounded in the provided knowledge base articles.",
  input_schema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The reply the visitor will see.",
      },
      confidence: {
        type: "number",
        description: "How sure you are the articles fully answer the question, from 0 to 1.",
      },
      reasoning: {
        type: "string",
        description: "Short internal rationale. Not shown to the visitor.",
      },
      citationIds: {
        type: "array",
        items: { type: "string" },
        description: "Ids of provided articles that support the reply.",
      },
    },
    required: ["text", "confidence", "citationIds"],
  },
} as const;

export const REQUEST_HANDOFF_TOOL = {
  name: "request_handoff",
  description:
    "Hand the conversation to a human when the articles do not answer the question.",
  input_schema: {
    type: "object",
    properties: {
      reason: {
        type: "string",
        description: "Why a human should take over.",
      },
      suggestedReply: {
        type: "string",
        description: "A draft the human agent can edit and send.",
      },
    },
    required: ["reason"],
  },
} as const;

export const GUDBOT_TOOLS = [SUBMIT_RESPONSE_TOOL, REQUEST_HANDOFF_TOOL];

export function buildGudBotUserMessage(input: {
  visitorMessage: string;
  history: Array<{ role: "visitor" | "bot" | "agent" | "system"; body: string }>;
  articles: RankedArticle[];
}): string {
  const history =
    input.history.length === 0
      ? "(none)"
      : input.history
          .map((message) => `${label(message.role)}: ${message.body}`)
          .join("\n");

  const articles =
    input.articles.length === 0
      ? "(none)"
      : input.articles
          .map(
            (article) =>
              `ID: ${article.id}\nTitle: ${article.title}\nExcerpt: ${article.excerpt}`,
          )
          .join("\n\n");

  return `Conversation so far:\n${history}\n\nLatest visitor message:\n${input.visitorMessage}\n\nKnowledge base articles:\n${articles}`;
}

function label(role: "visitor" | "bot" | "agent" | "system"): string {
  if (role === "visitor") return "Visitor";
  if (role === "bot") return "GudBot";
  if (role === "agent") return "Agent";
  return "System";
}
