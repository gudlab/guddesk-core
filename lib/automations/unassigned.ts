/**
 * "Unassigned for N minutes". Called by the automations cron route and by
 * the opportunistic per-workspace job (lib/scheduled). For each enabled
 * rule it finds OPEN conversations with no assignee that have been
 * unassigned for at least the rule's minutes, and runs that rule once per
 * conversation. The event key includes when the conversation became
 * unassigned, so it fires again only after being assigned and unassigned.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import { unassignedMinutes } from "@/lib/automations/conditions";
import { runAutomationEvent, type EngineDeps } from "@/lib/automations/engine";
import { origin, unassignedEventKey } from "@/lib/automations/events";
import type { UnassignedStore } from "@/lib/automations/prisma-store";

/** Conversations per rule per run; the next run picks up the rest. */
export const UNASSIGNED_BATCH = 100;

export interface UnassignedResult {
  rules: number;
  conversations: number;
  succeeded: number;
  failed: number;
}

export async function processUnassignedFor(
  deps: EngineDeps & { store: EngineDeps["store"] & UnassignedStore },
  workspaceId?: string,
): Promise<UnassignedResult> {
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? ((m: string) => console.warn(m));
  const result: UnassignedResult = { rules: 0, conversations: 0, succeeded: 0, failed: 0 };

  const rules = await deps.store.listUnassignedRules(workspaceId);
  for (const rule of rules) {
    const minutes = unassignedMinutes(rule.conditions);
    if (!minutes) continue;
    result.rules++;
    try {
      const cutoff = new Date(now().getTime() - minutes * 60 * 1000);
      const candidates = await deps.store.findUnassignedCandidates(rule, cutoff, UNASSIGNED_BATCH);
      for (const candidate of candidates) {
        result.conversations++;
        const outcomes = await runAutomationEvent(
          {
            trigger: "CONVERSATION_UNASSIGNED_FOR",
            workspaceId: rule.workspaceId,
            conversationId: candidate.conversationId,
            eventKey: unassignedEventKey(candidate.conversationId, candidate.since),
            ruleId: rule.id,
            origin: origin("system"),
          },
          deps,
        );
        for (const outcome of outcomes) {
          if (outcome.status === "succeeded") result.succeeded++;
          if (outcome.status === "failed") result.failed++;
        }
      }
    } catch (error) {
      log(`[automations] unassigned-for rule ${rule.id} failed: ${error instanceof Error ? error.name : "error"}`);
    }
  }
  return result;
}
