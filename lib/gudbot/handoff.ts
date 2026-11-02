import type { Citation } from "./citations";
import type { HandoffReason } from "./gate";

export function formatHandoffNote(input: {
  reason: HandoffReason;
  confidence?: number;
  citations: Citation[];
  suggestedReply?: string;
}): string {
  const lines = [
    "GudBot handed this conversation to the team.",
    "",
    `Reason: ${reasonLabel(input.reason)}`,
  ];
  if (typeof input.confidence === "number") {
    lines.push(`Confidence: ${input.confidence.toFixed(2)}`);
  }
  if (input.citations.length > 0) {
    lines.push("", "Cited articles:");
    for (const citation of input.citations) {
      lines.push(
        citation.url
          ? `- ${citation.title} (${citation.url})`
          : `- ${citation.title}`,
      );
    }
  } else {
    lines.push("", "Cited articles: none");
  }
  if (input.suggestedReply?.trim()) {
    lines.push("", "Suggested reply:", input.suggestedReply.trim());
  }
  return lines.join("\n");
}

function reasonLabel(reason: HandoffReason): string {
  switch (reason) {
    case "low_confidence":
      return "low confidence";
    case "max_turns":
      return "max turns";
    case "explicit":
      return "explicit handoff";
    case "no_evidence":
      return "no matching knowledge base articles";
  }
}
