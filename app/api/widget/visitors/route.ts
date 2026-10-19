import { NextRequest, NextResponse } from "next/server";

import { autoAssignCompany } from "@/lib/company-matching";
import { trackCustomerEvent } from "@/lib/customer-events";
import { prisma } from "@/lib/db";
import { createVisitorToken, verifyVisitorToken } from "@/lib/visitor-auth";
import {
  identifyWidgetVisitor,
  type VisitorWrite,
  type WidgetIdentifyDeps,
} from "@/lib/widget-visitors-identify";

type VisitorUpdateData = Parameters<typeof prisma.visitor.update>[0]["data"];
type VisitorCreateData = Parameters<typeof prisma.visitor.create>[0]["data"];

const visitorSelect = {
  id: true,
  externalId: true,
  name: true,
  email: true,
} as const;

const deps: WidgetIdentifyDeps = {
  db: {
    async findWorkspaceIdByAppId(appId) {
      const workspace = await prisma.workspace.findUnique({
        where: { appId },
        select: { id: true },
      });
      return workspace?.id ?? null;
    },
    async findIdentitySecret(workspaceId) {
      const settings = await prisma.widgetSettings.findUnique({
        where: { workspaceId },
        select: { identitySecret: true },
      });
      return settings?.identitySecret ?? null;
    },
    findVisitorByExternalId(workspaceId, externalId) {
      return prisma.visitor.findUnique({
        where: { workspaceId_externalId: { workspaceId, externalId } },
        select: visitorSelect,
      });
    },
    findVisitorById(id) {
      return prisma.visitor.findUnique({
        where: { id },
        select: visitorSelect,
      });
    },
    async updateVisitor(id, data: VisitorWrite) {
      await prisma.visitor.update({
        where: { id },
        data: data as unknown as VisitorUpdateData,
      });
    },
    createVisitor(data) {
      return prisma.visitor.create({
        data: data as unknown as VisitorCreateData,
        select: { id: true },
      });
    },
  },
  autoAssignCompany,
  trackCustomerEvent,
  createVisitorToken,
  verifyVisitorToken,
};

// POST /api/widget/visitors
// Identify a visitor (set name, email, externalId, metadata)
// Used when the host application identifies a logged-in user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await identifyWidgetVisitor(body ?? {}, deps);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Widget visitor error:", error);
    return NextResponse.json(
      { error: "Failed to identify visitor" },
      { status: 500 },
    );
  }
}
