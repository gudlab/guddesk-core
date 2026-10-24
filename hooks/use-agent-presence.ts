"use client";

import { useState, useCallback } from "react";

import {
  applyAvailabilityEvent,
  resolveAvailability,
  seedAgentStatuses,
  type AgentStatus,
  type Availability,
  type StoredAvailability,
} from "@/lib/agent-presence";
import { usePusher } from "./use-pusher";

export type { AgentStatus } from "@/lib/agent-presence";

/**
 * Track agent availability across the workspace.
 * Starts from each member's stored availability, then listens for
 * `agent:availability-changed` events on the workspace channel.
 */
export function useAgentPresence(
  workspaceId: string,
  initialMembers?: readonly StoredAvailability[],
) {
  const [agentStatuses, setAgentStatuses] = useState<Map<string, AgentStatus>>(
    () => seedAgentStatuses(initialMembers),
  );

  const handleAvailabilityChanged = useCallback((data: unknown) => {
    setAgentStatuses((prev) => applyAvailabilityEvent(prev, data));
  }, []);

  usePusher(
    `private-workspace-${workspaceId}`,
    "agent:availability-changed",
    handleAvailabilityChanged,
  );

  /**
   * Get the availability for a specific user: the latest Pusher event, then
   * the stored value, then `fallback`, then OFFLINE.
   */
  const getAvailability = useCallback(
    (userId: string, fallback?: Availability): Availability =>
      resolveAvailability(agentStatuses, userId, fallback),
    [agentStatuses],
  );

  return { agentStatuses, getAvailability };
}
