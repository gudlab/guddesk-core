import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { env } from "@/env.mjs";
import { parseWidgetAppId } from "@/lib/widget-app-id";

// GET /api/widget/config?appId=xxx
// Public endpoint — returns widget settings for a workspace
export async function GET(req: NextRequest) {
  const parsed = parseWidgetAppId(req.nextUrl.searchParams.get("appId"));
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status },
    );
  }
  const { appId } = parsed;

  const workspace = await prisma.workspace.findUnique({
    where: { appId },
    select: {
      id: true,
      name: true,
      plan: true,
      widgetSettings: {
        select: {
          primaryColor: true,
          position: true,
          welcomeMessage: true,
          workspaceName: true,
          workspaceAvatarUrl: true,
          showBranding: true,
          requireEmail: true,
          suggestArticles: true,
          offlineFormTimeout: true,
          pageVisibilityMode: true,
          pageVisibilityPatterns: true,
        },
      },
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Invalid App ID" }, { status: 401 });
  }

  return NextResponse.json({
    workspaceId: workspace.id,
    workspaceName: workspace.widgetSettings?.workspaceName ?? workspace.name,
    workspaceAvatarUrl: workspace.widgetSettings?.workspaceAvatarUrl ?? null,
    primaryColor: workspace.widgetSettings?.primaryColor ?? "#3ECF8E",
    position: workspace.widgetSettings?.position ?? "bottom-right",
    welcomeMessage:
      workspace.widgetSettings?.welcomeMessage ?? "Hi! How can we help you?",
    showBranding:
      workspace.plan !== "PRO"
        ? true
        : (workspace.widgetSettings?.showBranding ?? true),
    requireEmail: workspace.widgetSettings?.requireEmail ?? false,
    suggestArticles: workspace.widgetSettings?.suggestArticles ?? true,
    offlineFormTimeout: workspace.widgetSettings?.offlineFormTimeout ?? null,
    pageVisibilityMode: workspace.widgetSettings?.pageVisibilityMode ?? "exclude",
    pageVisibilityPatterns: workspace.widgetSettings?.pageVisibilityPatterns ?? [],
    // Pusher credentials for real-time messaging (public keys only)
    pusherKey: env.NEXT_PUBLIC_PUSHER_KEY || null,
    pusherCluster: env.NEXT_PUBLIC_PUSHER_CLUSTER || null,
  });
}
