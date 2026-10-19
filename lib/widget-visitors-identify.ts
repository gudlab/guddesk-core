import type { autoAssignCompany } from "./company-matching";
import type { trackCustomerEvent } from "./customer-events";
import type { createVisitorToken, verifyVisitorToken } from "./visitor-auth";
import { hasIdentityChanges } from "./widget-identify-changes";
import { resolveWidgetIdentity } from "./widget-identity";

/**
 * Core of POST /api/widget/visitors (identify a visitor: name, email,
 * externalId, metadata). The route passes in Prisma and the side-effect
 * helpers, so tests can drive this with in-memory fakes.
 */

export type WidgetIdentifyBody = {
  appId?: unknown;
  visitorToken?: unknown;
  externalId?: unknown;
  name?: unknown;
  email?: unknown;
  metadata?: unknown;
  userHash?: unknown;
};

export type StoredVisitor = {
  id: string;
  externalId: string | null;
  name: string | null;
  email: string | null;
};

export type VisitorWrite = {
  externalId?: string | null;
  name?: unknown;
  email?: unknown;
  metadata?: unknown;
  lastSeenAt: Date;
};

export type WidgetIdentifyDeps = {
  db: {
    findWorkspaceIdByAppId(appId: string): Promise<string | null>;
    findIdentitySecret(workspaceId: string): Promise<string | null>;
    findVisitorByExternalId(
      workspaceId: string,
      externalId: string,
    ): Promise<StoredVisitor | null>;
    findVisitorById(id: string): Promise<StoredVisitor | null>;
    updateVisitor(id: string, data: VisitorWrite): Promise<void>;
    createVisitor(
      data: VisitorWrite & { workspaceId: string },
    ): Promise<{ id: string }>;
  };
  autoAssignCompany: typeof autoAssignCompany;
  trackCustomerEvent: typeof trackCustomerEvent;
  createVisitorToken: typeof createVisitorToken;
  verifyVisitorToken: typeof verifyVisitorToken;
};

export type WidgetIdentifyResult = {
  status: number;
  body: Record<string, unknown>;
};

export async function identifyWidgetVisitor(
  body: WidgetIdentifyBody,
  deps: WidgetIdentifyDeps,
): Promise<WidgetIdentifyResult> {
  const { db } = deps;
  const { visitorToken, externalId, metadata, userHash } = body;
  const name = body.name as string | null | undefined;
  const email = body.email as string | null | undefined;

  if (typeof body.appId !== "string" || !body.appId) {
    return { status: 400, body: { error: "App ID is required" } };
  }

  // Strip cosmetic gd_pub_ prefix before DB lookup
  const appId = body.appId.replace(/^gd_pub_/, "");
  const workspaceId = await db.findWorkspaceIdByAppId(appId);
  if (!workspaceId) {
    return { status: 401, body: { error: "Invalid App ID" } };
  }

  // Identity verification (HMAC-SHA256). Never look up or merge an
  // existing externalId visitor without a valid HMAC (BUG-001). No secret
  // means anonymous. Secret set means a missing or invalid hash is a 403.
  let verifiedExternalId: string | null = null;
  if (externalId) {
    const identity = resolveWidgetIdentity({
      externalId,
      userHash,
      identitySecret: await db.findIdentitySecret(workspaceId),
    });
    if (!identity.ok) {
      return { status: 403, body: { error: identity.error } };
    }
    verifiedExternalId = identity.externalId;
  }

  // Verified externalId: update the existing visitor if there is one
  if (verifiedExternalId) {
    const existing = await db.findVisitorByExternalId(
      workspaceId,
      verifiedExternalId,
    );
    if (existing) {
      // Only add a timeline event and rerun company matching when the
      // identity actually changed. Repeat identify calls still refresh
      // lastSeenAt and metadata.
      const changed = hasIdentityChanges(existing, { name, email });

      await db.updateVisitor(existing.id, {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(metadata !== undefined && { metadata }),
        lastSeenAt: new Date(),
      });

      if (changed) {
        // Auto-assign company by email domain (fire-and-forget)
        const visitorEmail = email ?? existing.email;
        if (visitorEmail) {
          deps.autoAssignCompany(workspaceId, existing.id, visitorEmail);
        }

        deps.trackCustomerEvent(
          workspaceId,
          existing.id,
          "customer.identified",
          `Identified via widget${email ? ` as ${email}` : ""}`,
          { externalId: verifiedExternalId, name, email },
        );
      }

      return {
        status: 200,
        body: {
          visitorId: existing.id,
          visitorToken: deps.createVisitorToken(existing.id, workspaceId),
        },
      };
    }
  }

  // Visitor token: update that visitor
  if (typeof visitorToken === "string" && visitorToken) {
    const payload = deps.verifyVisitorToken(visitorToken);
    if (payload && payload.workspaceId === workspaceId) {
      const current = await db.findVisitorById(payload.visitorId);
      const changed = hasIdentityChanges(current, {
        externalId: verifiedExternalId,
        name,
        email,
      });

      await db.updateVisitor(payload.visitorId, {
        ...(verifiedExternalId && { externalId: verifiedExternalId }),
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(metadata !== undefined && { metadata }),
        lastSeenAt: new Date(),
      });

      // Auto-assign company by email domain (fire-and-forget)
      if (changed && email) {
        deps.autoAssignCompany(workspaceId, payload.visitorId, email);
      }

      // Track identify event only when something changed
      if (changed && (verifiedExternalId || email || name)) {
        deps.trackCustomerEvent(
          workspaceId,
          payload.visitorId,
          "customer.identified",
          `Identified via widget${email ? ` as ${email}` : ""}`,
          { externalId: verifiedExternalId, name, email },
        );
      }

      return {
        status: 200,
        body: { visitorId: payload.visitorId, visitorToken },
      };
    }
  }

  // Create a new visitor
  const visitor = await db.createVisitor({
    workspaceId,
    externalId: verifiedExternalId,
    name: name ?? null,
    email: email ?? null,
    metadata: metadata ?? null,
    lastSeenAt: new Date(),
  });

  if (email) {
    deps.autoAssignCompany(workspaceId, visitor.id, email);
  }

  deps.trackCustomerEvent(
    workspaceId,
    visitor.id,
    "customer.identified",
    `New customer identified${email ? ` as ${email}` : ""}`,
    { externalId: verifiedExternalId, name, email, isNew: true },
  );

  return {
    status: 200,
    body: {
      visitorId: visitor.id,
      visitorToken: deps.createVisitorToken(visitor.id, workspaceId),
    },
  };
}
