import type { Citation } from "./citations";
import type { RankedArticle } from "./retrieve";

export type EvidenceCheckInput = {
  answer: string;
  citations: Citation[];
  retrieved: RankedArticle[];
};

/**
 * Second-signal verifier. v1 ships model-self confidence with a pass-through
 * evidence score of 1.0. Swap this for a Haiku "is this fully supported?"
 * check without changing the rest of the loop.
 */
export type EvidenceCheck = (input: EvidenceCheckInput) => Promise<number>;

export const passThroughEvidenceCheck: EvidenceCheck = async () => 1.0;

export function effectiveConfidence(
  modelSelf: number,
  evidenceScore: number,
): number {
  const self = clamp01(modelSelf);
  const evidence = clamp01(evidenceScore);
  return self * evidence;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function belowThreshold(
  effective: number,
  threshold: number,
): boolean {
  return effective < threshold;
}
