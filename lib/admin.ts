import { prisma } from "@/lib/db";
import { monthStartUtc } from "@/lib/plan-limits";

export async function getPlatformStats() {
  const [
    totalUsers,
    totalWorkspaces,
    activeConversations,
    proWorkspaces,
    freeWorkspaces,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.conversation.count({ where: { status: "OPEN" } }),
    prisma.workspace.count({ where: { plan: "PRO" } }),
    prisma.workspace.count({ where: { plan: "FREE" } }),
  ]);

  return {
    totalUsers,
    totalWorkspaces,
    activeConversations,
    proWorkspaces,
    freeWorkspaces,
    // Rough MRR estimate — replace with actual price per PRO workspace
    estimatedMrr: proWorkspaces * 29,
  };
}

export async function getPlatformGrowth(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const [users, workspaces] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workspace.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build daily buckets
  const buckets: Record<string, { users: number; workspaces: number }> = {};
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { users: 0, workspaces: 0 };
  }

  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (buckets[key]) buckets[key].users++;
  }
  for (const w of workspaces) {
    const key = w.createdAt.toISOString().slice(0, 10);
    if (buckets[key]) buckets[key].workspaces++;
  }

  return Object.entries(buckets).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

export async function getUsersList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  filter?: { role?: "ADMIN" | "USER"; status?: "active" | "banned" },
) {
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (filter?.role) {
    where.role = filter.role;
  }
  if (filter?.status === "banned") {
    where.isBanned = true;
  } else if (filter?.status === "active") {
    where.isBanned = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        createdAt: true,
        _count: { select: { workspaceMembers: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  };
}

export async function getWorkspacesList(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  filter?: { plan?: "FREE" | "PRO" },
) {
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (filter?.plan) {
    where.plan = filter.plan;
  }

  const monthStart = monthStartUtc(new Date());

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            conversations: { where: { createdAt: { gte: monthStart } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.workspace.count({ where }),
  ]);

  return {
    workspaces,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  };
}

export async function getWorkspaceDetail(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      slackIntegration: { select: { id: true, slackTeamName: true, channelName: true } },
      widgetSettings: { select: { id: true } },
      helpCenterSettings: { select: { id: true } },
    },
  });

  if (!workspace) return null;

  const monthStart = monthStartUtc(new Date());

  const [conversationsThisMonth, totalMessages, totalVisitors, aiTokens] =
    await Promise.all([
      prisma.conversation.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
      prisma.message.count({
        where: { conversation: { workspaceId } },
      }),
      prisma.visitor.count({ where: { workspaceId } }),
      prisma.aiUsageLog.aggregate({
        where: { workspaceId },
        _sum: { inputTokens: true, outputTokens: true },
      }),
    ]);

  return {
    ...workspace,
    usage: {
      conversationsThisMonth,
      totalMessages,
      totalVisitors,
      totalAiTokens:
        (aiTokens._sum.inputTokens ?? 0) +
        (aiTokens._sum.outputTokens ?? 0),
    },
  };
}

export async function getAiUsageStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const logs = await prisma.aiUsageLog.findMany({
    where: { createdAt: { gte: startDate } },
    select: {
      feature: true,
      inputTokens: true,
      outputTokens: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by day and feature
  const buckets: Record<
    string,
    Record<string, number>
  > = {};

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = {};
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    if (!buckets[key]) buckets[key] = {};
    const tokens = log.inputTokens + log.outputTokens;
    buckets[key][log.feature] = (buckets[key][log.feature] ?? 0) + tokens;
  }

  return Object.entries(buckets).map(([date, features]) => ({
    date,
    ...features,
  }));
}

export async function getPlatformConversationStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Aggregate from analytics snapshots across all workspaces
  const snapshots = await prisma.analyticsSnapshot.findMany({
    where: { date: { gte: startDate } },
    select: {
      date: true,
      newConversations: true,
      closedConversations: true,
      totalMessages: true,
    },
    orderBy: { date: "asc" },
  });

  // Group by date (multiple workspaces may have snapshots on same day)
  const buckets: Record<
    string,
    { newConversations: number; closedConversations: number; totalMessages: number }
  > = {};

  for (const s of snapshots) {
    const key = s.date.toISOString().slice(0, 10);
    if (!buckets[key]) {
      buckets[key] = { newConversations: 0, closedConversations: 0, totalMessages: 0 };
    }
    buckets[key].newConversations += s.newConversations;
    buckets[key].closedConversations += s.closedConversations;
    buckets[key].totalMessages += s.totalMessages;
  }

  return Object.entries(buckets).map(([date, data]) => ({
    date,
    ...data,
  }));
}

export async function getTopWorkspaces(limit: number = 10) {
  const monthStart = monthStartUtc(new Date());

  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      _count: {
        select: {
          conversations: { where: { createdAt: { gte: monthStart } } },
          members: true,
        },
      },
    },
    orderBy: {
      conversations: { _count: "desc" },
    },
    take: limit,
  });

  return workspaces;
}

export async function getRecentAuditLogs(limit: number = 10) {
  return prisma.adminAuditLog.findMany({
    include: {
      admin: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getIntegrationsList(
  search?: string,
  filter?: { type?: "slack" | "widget" | "help-center" },
) {
  const workspaceWhere: any = {};
  if (search) {
    workspaceWhere.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  const workspaces = await prisma.workspace.findMany({
    where: workspaceWhere,
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      slackIntegration: {
        select: {
          id: true,
          webhookUrl: true,
          slackTeamName: true,
          channelName: true,
          notifyOnNew: true,
          notifyOnClose: true,
          notifyOnAssign: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      widgetSettings: {
        select: {
          id: true,
          primaryColor: true,
          position: true,
          welcomeMessage: true,
          showBranding: true,
          requireEmail: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      helpCenterSettings: {
        select: {
          id: true,
          title: true,
          primaryColor: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Flatten into integration rows
  type IntegrationRow = {
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    workspacePlan: string;
    type: "slack" | "widget" | "help-center";
    id: string;
    details: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  };

  const integrations: IntegrationRow[] = [];

  for (const workspace of workspaces) {
    if (workspace.slackIntegration && (!filter?.type || filter.type === "slack")) {
      integrations.push({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        workspacePlan: workspace.plan,
        type: "slack",
        id: workspace.slackIntegration.id,
        details: {
          webhookUrl: workspace.slackIntegration.webhookUrl
            ? `${workspace.slackIntegration.webhookUrl.slice(0, 40)}...`
            : "—",
          slackTeamName: workspace.slackIntegration.slackTeamName ?? "—",
          channelName: workspace.slackIntegration.channelName ?? "—",
          notifyOnNew: workspace.slackIntegration.notifyOnNew,
          notifyOnClose: workspace.slackIntegration.notifyOnClose,
          notifyOnAssign: workspace.slackIntegration.notifyOnAssign,
        },
        createdAt: workspace.slackIntegration.createdAt,
        updatedAt: workspace.slackIntegration.updatedAt,
      });
    }
    if (workspace.widgetSettings && (!filter?.type || filter.type === "widget")) {
      integrations.push({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        workspacePlan: workspace.plan,
        type: "widget",
        id: workspace.widgetSettings.id,
        details: {
          primaryColor: workspace.widgetSettings.primaryColor,
          position: workspace.widgetSettings.position,
          showBranding: workspace.widgetSettings.showBranding,
          requireEmail: workspace.widgetSettings.requireEmail,
        },
        createdAt: workspace.widgetSettings.createdAt,
        updatedAt: workspace.widgetSettings.updatedAt,
      });
    }
    if (workspace.helpCenterSettings && (!filter?.type || filter.type === "help-center")) {
      integrations.push({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        workspacePlan: workspace.plan,
        type: "help-center",
        id: workspace.helpCenterSettings.id,
        details: {
          title: workspace.helpCenterSettings.title,
          primaryColor: workspace.helpCenterSettings.primaryColor,
        },
        createdAt: workspace.helpCenterSettings.createdAt,
        updatedAt: workspace.helpCenterSettings.updatedAt,
      });
    }
  }

  // Count totals
  const stats = {
    totalSlack: workspaces.filter((w) => w.slackIntegration).length,
    totalWidget: workspaces.filter((w) => w.widgetSettings).length,
    totalHelpCenter: workspaces.filter((w) => w.helpCenterSettings).length,
    totalWorkspaces: workspaces.length,
  };

  return { integrations, stats };
}
