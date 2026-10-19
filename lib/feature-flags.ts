/**
 * Feature flags for GudDesk Core (public AGPL edition).
 * Self-host is uncapped. Cloud Free / Pro $29 / Business ~$99 live on guddesk.com.
 */

export type PlanLimits = {
  maxSeats: number;
  maxConversationsPerMonth: number;
  maxWorkspaces: number;
  aiEnabled: boolean;
  removeBranding: boolean;
};

const UNLIMITED: PlanLimits = {
  maxSeats: Infinity,
  maxConversationsPerMonth: Infinity,
  maxWorkspaces: Infinity,
  aiEnabled: true,
  removeBranding: true,
};

export function getPlanLimits(_plan?: string): PlanLimits {
  return UNLIMITED;
}

export async function canUserCreateWorkspace(_userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  reason?: string;
}> {
  return { allowed: true, currentCount: 0, maxAllowed: Infinity };
}

export async function checkWorkspaceLimits(_workspaceId: string): Promise<{
  plan: string;
  limits: PlanLimits;
  currentSeats: number;
  currentMonthConversations: number;
  canAddSeat: boolean;
  canCreateConversation: boolean;
}> {
  return {
    plan: "CORE",
    limits: UNLIMITED,
    currentSeats: 0,
    currentMonthConversations: 0,
    canAddSeat: true,
    canCreateConversation: true,
  };
}
