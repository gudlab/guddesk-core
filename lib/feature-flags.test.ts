import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
  prisma: {
    workspaceMember: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    workspace: {
      findUnique: vi.fn(),
    },
    conversation: {
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ prisma }));

import {
  canUserCreateWorkspace,
  checkWorkspaceLimits,
  getPlanLimits,
  isHostedPlanEnforcement,
} from "./feature-flags";

function setHosted(value: string | undefined) {
  if (value === undefined) {
    delete process.env.GUDDESK_HOSTED;
  } else {
    process.env.GUDDESK_HOSTED = value;
  }
}

describe("self-host (GUDDESK_HOSTED unset)", () => {
  beforeEach(() => {
    setHosted(undefined);
    vi.clearAllMocks();
  });

  it("does not treat the process as hosted", () => {
    expect(isHostedPlanEnforcement()).toBe(false);
  });

  it("returns unlimited limits for every plan", () => {
    for (const plan of [undefined, "FREE", "PRO", "CORE", "UNKNOWN"]) {
      const limits = getPlanLimits(plan);
      expect(limits.maxSeats).toBe(Infinity);
      expect(limits.maxConversationsPerMonth).toBe(Infinity);
      expect(limits.maxWorkspaces).toBe(Infinity);
      expect(limits.aiEnabled).toBe(true);
      expect(limits.removeBranding).toBe(true);
    }
  });

  it("allows creating a workspace without querying the database", async () => {
    const result = await canUserCreateWorkspace("user_1");
    expect(result).toEqual({
      allowed: true,
      currentCount: 0,
      maxAllowed: Infinity,
    });
    expect(prisma.workspaceMember.findMany).not.toHaveBeenCalled();
  });

  it("reports plan CORE and unlimited usage without querying the database", async () => {
    const result = await checkWorkspaceLimits("ws_1");
    expect(result.plan).toBe("CORE");
    expect(result.limits.aiEnabled).toBe(true);
    expect(result.currentSeats).toBe(0);
    expect(result.currentMonthConversations).toBe(0);
    expect(result.canAddSeat).toBe(true);
    expect(result.canCreateConversation).toBe(true);
    expect(prisma.workspace.findUnique).not.toHaveBeenCalled();
    expect(prisma.workspaceMember.count).not.toHaveBeenCalled();
    expect(prisma.conversation.count).not.toHaveBeenCalled();
  });

  it("treats GUDDESK_HOSTED=false like unset", () => {
    setHosted("false");
    expect(isHostedPlanEnforcement()).toBe(false);
    expect(getPlanLimits("FREE").maxSeats).toBe(Infinity);
  });
});

describe("hosted (GUDDESK_HOSTED=true)", () => {
  beforeEach(() => {
    setHosted("true");
    vi.clearAllMocks();
  });

  it("enables hosted enforcement", () => {
    expect(isHostedPlanEnforcement()).toBe(true);
  });

  it("applies FREE limits", () => {
    expect(getPlanLimits("FREE")).toEqual({
      maxSeats: 2,
      maxConversationsPerMonth: 500,
      maxWorkspaces: 1,
      aiEnabled: false,
      removeBranding: false,
    });
  });

  it("applies PRO limits", () => {
    const limits = getPlanLimits("PRO");
    expect(limits.maxSeats).toBe(Infinity);
    expect(limits.maxConversationsPerMonth).toBe(Infinity);
    expect(limits.maxWorkspaces).toBe(Infinity);
    expect(limits.aiEnabled).toBe(true);
    expect(limits.removeBranding).toBe(true);
  });

  it("falls back to FREE for missing or unknown plans", () => {
    expect(getPlanLimits()).toEqual(getPlanLimits("FREE"));
    expect(getPlanLimits("BUSINESS")).toEqual(getPlanLimits("FREE"));
  });

  it("allows a first workspace for a free user", async () => {
    prisma.workspaceMember.findMany.mockResolvedValue([]);
    const result = await canUserCreateWorkspace("user_1");
    expect(result).toEqual({
      allowed: true,
      currentCount: 0,
      maxAllowed: 1,
    });
  });

  it("blocks a second workspace for a free user", async () => {
    prisma.workspaceMember.findMany.mockResolvedValue([
      { workspace: { plan: "FREE" } },
    ]);
    const result = await canUserCreateWorkspace("user_1");
    expect(result.allowed).toBe(false);
    expect(result.currentCount).toBe(1);
    expect(result.maxAllowed).toBe(1);
    expect(result.reason).toMatch(/1 workspace/i);
  });

  it("allows unlimited workspaces when the user owns a PRO workspace", async () => {
    prisma.workspaceMember.findMany.mockResolvedValue([
      { workspace: { plan: "FREE" } },
      { workspace: { plan: "PRO" } },
    ]);
    const result = await canUserCreateWorkspace("user_1");
    expect(result).toEqual({
      allowed: true,
      currentCount: 2,
      maxAllowed: Infinity,
    });
  });

  it("blocks a third seat and 501st conversation on FREE", async () => {
    prisma.workspace.findUnique.mockResolvedValue({ plan: "FREE" });
    prisma.workspaceMember.count.mockResolvedValue(2);
    prisma.conversation.count.mockResolvedValue(500);

    const result = await checkWorkspaceLimits("ws_1");
    expect(result.plan).toBe("FREE");
    expect(result.currentSeats).toBe(2);
    expect(result.currentMonthConversations).toBe(500);
    expect(result.canAddSeat).toBe(false);
    expect(result.canCreateConversation).toBe(false);
    expect(result.limits.aiEnabled).toBe(false);
    expect(result.limits.removeBranding).toBe(false);
  });

  it("allows another seat and conversation under FREE caps", async () => {
    prisma.workspace.findUnique.mockResolvedValue({ plan: "FREE" });
    prisma.workspaceMember.count.mockResolvedValue(1);
    prisma.conversation.count.mockResolvedValue(10);

    const result = await checkWorkspaceLimits("ws_1");
    expect(result.canAddSeat).toBe(true);
    expect(result.canCreateConversation).toBe(true);
  });

  it("does not cap seats or conversations on PRO", async () => {
    prisma.workspace.findUnique.mockResolvedValue({ plan: "PRO" });
    prisma.workspaceMember.count.mockResolvedValue(50);
    prisma.conversation.count.mockResolvedValue(10_000);

    const result = await checkWorkspaceLimits("ws_1");
    expect(result.plan).toBe("PRO");
    expect(result.canAddSeat).toBe(true);
    expect(result.canCreateConversation).toBe(true);
    expect(result.limits.aiEnabled).toBe(true);
  });

  it("treats a missing workspace as FREE", async () => {
    prisma.workspace.findUnique.mockResolvedValue(null);
    prisma.workspaceMember.count.mockResolvedValue(0);
    prisma.conversation.count.mockResolvedValue(0);

    const result = await checkWorkspaceLimits("missing");
    expect(result.plan).toBe("FREE");
    expect(result.limits.maxSeats).toBe(2);
  });
});
