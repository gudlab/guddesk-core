import { prisma } from "@/lib/db";

/**
 * Plan limits. Self-host (GUDDESK_HOSTED unset) is uncapped.
 * Hosted guddesk.com sets GUDDESK_HOSTED=true and enforces Free / Pro.
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

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxSeats: 2,
    maxConversationsPerMonth: 500,
    maxWorkspaces: 1,
    aiEnabled: false,
    removeBranding: false,
  },
  PRO: {
    maxSeats: Infinity,
    maxConversationsPerMonth: Infinity,
    maxWorkspaces: Infinity,
    aiEnabled: true,
    removeBranding: true,
  },
};

/** Hosted guddesk.com sets GUDDESK_HOSTED=true. Self-host leaves it unset. */
export function isHostedPlanEnforcement(): boolean {
  return process.env.GUDDESK_HOSTED === "true";
}

export function getPlanLimits(plan?: string): PlanLimits {
  if (!isHostedPlanEnforcement()) {
    return UNLIMITED;
  }
  return PLAN_LIMITS[plan ?? "FREE"] ?? PLAN_LIMITS.FREE;
}

export async function canUserCreateWorkspace(userId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  reason?: string;
}> {
  if (!isHostedPlanEnforcement()) {
    return { allowed: true, currentCount: 0, maxAllowed: Infinity };
  }

  const ownedWorkspaces = await prisma.workspaceMember.findMany({
    where: { userId, role: "OWNER" },
    select: { workspace: { select: { plan: true } } },
  });

  const currentCount = ownedWorkspaces.length;

  const hasProWorkspace = ownedWorkspaces.some(
    (m) => m.workspace.plan === "PRO",
  );

  if (hasProWorkspace) {
    return { allowed: true, currentCount, maxAllowed: Infinity };
  }

  const maxAllowed = PLAN_LIMITS.FREE.maxWorkspaces;
  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed,
      reason:
        "Free plan is limited to 1 workspace. Upgrade to Pro for unlimited workspaces.",
    };
  }

  return { allowed: true, currentCount, maxAllowed };
}

export async function checkWorkspaceLimits(workspaceId: string): Promise<{
  plan: string;
  limits: PlanLimits;
  currentSeats: number;
  currentMonthConversations: number;
  canAddSeat: boolean;
  canCreateConversation: boolean;
}> {
  if (!isHostedPlanEnforcement()) {
    return {
      plan: "CORE",
      limits: UNLIMITED,
      currentSeats: 0,
      currentMonthConversations: 0,
      canAddSeat: true,
      canCreateConversation: true,
    };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });

  const plan = workspace?.plan ?? "FREE";
  const limits = getPlanLimits(plan);

  const [memberCount, conversationCount] = await Promise.all([
    prisma.workspaceMember.count({ where: { workspaceId } }),
    prisma.conversation.count({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    plan,
    limits,
    currentSeats: memberCount,
    currentMonthConversations: conversationCount,
    canAddSeat: memberCount < limits.maxSeats,
    canCreateConversation: conversationCount < limits.maxConversationsPerMonth,
  };
}
