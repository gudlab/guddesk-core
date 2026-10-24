import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { createVisitorToken, verifyVisitorToken } from "@/lib/visitor-auth";
import { resolveWidgetAuthVisitor } from "@/lib/widget-visitor";

// POST /api/widget/auth
// Return a visitor token for an anonymous visitor. A valid token for this
// workspace (body `visitorToken` or the `x-visitor-token` header) is reused
// instead of creating a new visitor. The current widget no longer calls this
// on load; it gets a visitor on the first message or identify().
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId: rawAppId } = body;

    if (!rawAppId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 },
      );
    }

    // Strip cosmetic gd_pub_ prefix before DB lookup
    const appId = rawAppId.replace(/^gd_pub_/, "");

    const workspace = await prisma.workspace.findUnique({
      where: { appId },
      select: { id: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Invalid App ID" }, { status: 401 });
    }

    const presentedToken =
      (typeof body.visitorToken === "string" && body.visitorToken) ||
      req.headers.get("x-visitor-token");

    const { visitorId } = await resolveWidgetAuthVisitor(workspace.id, presentedToken, {
      verifyToken: verifyVisitorToken,
      findVisitor: (id, workspaceId) =>
        prisma.visitor.findFirst({ where: { id, workspaceId }, select: { id: true } }),
      createVisitor: (workspaceId) =>
        prisma.visitor.create({
          data: { workspaceId, lastSeenAt: new Date() },
          select: { id: true },
        }),
      touchVisitor: (id) =>
        prisma.visitor.update({ where: { id }, data: { lastSeenAt: new Date() } }),
    });

    const token = createVisitorToken(visitorId, workspace.id);

    return NextResponse.json({
      visitorId,
      visitorToken: token,
    });
  } catch (error) {
    console.error("Widget auth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 },
    );
  }
}
