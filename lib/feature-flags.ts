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

export type SeatDecision = {
  allowed: boolean;
  plan: string;
  members: number;
  pendingInvites: number;
  used: number;
  maxSeats: number;
};

export type ConversationBanner = {
  level: "warning" | "over";
  count: number;
  limit: number;
  monthKey: string;
};

export async function checkSeatAvailability(
  _workspaceId: string,
): Promise<SeatDecision> {
  return {
    allowed: true,
    plan: "CORE",
    members: 0,
    pendingInvites: 0,
    used: 0,
    maxSeats: Infinity,
  };
}

export async function getConversationLimitBanner(
  _workspaceId: string,
): Promise<ConversationBanner | null> {
  return null;
}

export async function canUserCreateWorkspace(_userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
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
