import { NextRequest, NextResponse } from "next/server";

import { autoAssignCompany } from "@/lib/company-matching";
import { trackCustomerEvent } from "@/lib/customer-events";
import { prisma } from "@/lib/db";
import { createVisitorToken, verifyVisitorToken } from "@/lib/visitor-auth";
import { hasIdentityChanges } from "@/lib/widget-identify-changes";
import { resolveWidgetIdentity } from "@/lib/widget-identity";

// POST /api/widget/visitors
// Identify a visitor (set name, email, externalId, metadata)
// Used when the host application identifies a logged-in user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appId: rawAppId,
      visitorToken,
      externalId,
      name,
      email,
      metadata,
      userHash,
    } = body;

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

    // ── Identity verification (HMAC-SHA256) ─────────────────────────────
    // Never look up or merge an existing externalId visitor without a
    // valid HMAC (BUG-001). No secret → treat as anonymous. Secret set
    // → missing/invalid hash is still 403.
    let verifiedExternalId: string | null = null;
    if (externalId) {
      const widgetSettings = await prisma.widgetSettings.findUnique({
        where: { workspaceId: workspace.id },
        select: { identitySecret: true },
      });

      const identity = resolveWidgetIdentity({
        externalId,
        userHash,
        identitySecret: widgetSettings?.identitySecret,
      });

      if (!identity.ok) {
        return NextResponse.json({ error: identity.error }, { status: 403 });
      }

      verifiedExternalId = identity.externalId;
    }

    // If we have a verified externalId, try to find an existing visitor
    if (verifiedExternalId) {
      const existingVisitor = await prisma.visitor.findUnique({
        where: {
          workspaceId_externalId: {
            workspaceId: workspace.id,
            externalId: verifiedExternalId,
          },
        },
      });

      if (existingVisitor) {
        // Only add a timeline event and rerun company matching when the
        // identity actually changed. Repeat identify calls still refresh
        // lastSeenAt and metadata.
        const changed = hasIdentityChanges(existingVisitor, { name, email });

        // Update existing visitor
        await prisma.visitor.update({
          where: { id: existingVisitor.id },
          data: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(metadata !== undefined && { metadata }),
            lastSeenAt: new Date(),
          },
        });

        if (changed) {
          // Auto-assign company by email domain (fire-and-forget)
          const visitorEmail = email ?? existingVisitor.email;
          if (visitorEmail) {
            autoAssignCompany(workspace.id, existingVisitor.id, visitorEmail);
          }

          // Track identify event
          trackCustomerEvent(
            workspace.id,
            existingVisitor.id,
            "customer.identified",
            `Identified via widget${email ? ` as ${email}` : ""}`,
            { externalId: verifiedExternalId, name, email },
          );
        }

        const token = createVisitorToken(existingVisitor.id, workspace.id);
        return NextResponse.json({
          visitorId: existingVisitor.id,
          visitorToken: token,
        });
      }
    }

    // If we have a visitorToken, update that visitor
    if (visitorToken) {
      const payload = verifyVisitorToken(visitorToken);
      if (payload && payload.workspaceId === workspace.id) {
        const current = await prisma.visitor.findUnique({
          where: { id: payload.visitorId },
          select: { externalId: true, name: true, email: true },
        });
        const changed = hasIdentityChanges(current, {
          externalId: verifiedExternalId,
          name,
          email,
        });

        await prisma.visitor.update({
          where: { id: payload.visitorId },
          data: {
            ...(verifiedExternalId && { externalId: verifiedExternalId }),
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(metadata !== undefined && { metadata }),
            lastSeenAt: new Date(),
          },
        });

        // Auto-assign company by email domain (fire-and-forget)
        if (changed && email) {
          autoAssignCompany(workspace.id, payload.visitorId, email);
        }

        // Track identify event only when something changed
        if (changed && (verifiedExternalId || email || name)) {
          trackCustomerEvent(
            workspace.id,
            payload.visitorId,
            "customer.identified",
            `Identified via widget${email ? ` as ${email}` : ""}`,
            { externalId: verifiedExternalId, name, email },
          );
        }

        return NextResponse.json({
          visitorId: payload.visitorId,
          visitorToken,
        });
      }
    }

    // Create a new visitor
    const visitor = await prisma.visitor.create({
      data: {
        workspaceId: workspace.id,
        externalId: verifiedExternalId,
        name: name ?? null,
        email: email ?? null,
        metadata: metadata ?? null,
        lastSeenAt: new Date(),
      },
    });

    // Auto-assign company by email domain (fire-and-forget)
    if (email) {
      autoAssignCompany(workspace.id, visitor.id, email);
    }

    // Track new customer identified
    trackCustomerEvent(
      workspace.id,
      visitor.id,
      "customer.identified",
      `New customer identified${email ? ` as ${email}` : ""}`,
      { externalId: verifiedExternalId, name, email, isNew: true },
    );

    const token = createVisitorToken(visitor.id, workspace.id);
    return NextResponse.json({
      visitorId: visitor.id,
      visitorToken: token,
    });
  } catch (error) {
    console.error("Widget visitor error:", error);
    return NextResponse.json(
      { error: "Failed to identify visitor" },
      { status: 500 },
    );
  }
}
