/**
 * Visitor lookup for POST /api/widget/auth.
 *
 * A valid token for this workspace whose visitor still exists is reused, so
 * a reload does not add a Visitor row. Anything else (no token, a bad or
 * expired token, a token from another workspace, a deleted visitor) gets a
 * new anonymous visitor, as before.
 */

/**
 * Error code for a valid token whose visitor no longer exists. The widget
 * (packages/widget/src/api/first-message.ts) drops the token and retries
 * once when it sees it.
 */
export const VISITOR_NOT_FOUND = "VISITOR_NOT_FOUND";

export interface VisitorTokenClaims {
  visitorId: string;
  workspaceId: string;
}

export interface WidgetVisitorDeps {
  verifyToken: (token: string) => VisitorTokenClaims | null;
  /** Must only match a visitor in `workspaceId`. */
  findVisitor: (visitorId: string, workspaceId: string) => Promise<{ id: string } | null>;
  createVisitor: (workspaceId: string) => Promise<{ id: string }>;
  touchVisitor?: (visitorId: string) => Promise<unknown>;
}

export interface WidgetVisitorResult {
  visitorId: string;
  reused: boolean;
}

export async function resolveWidgetAuthVisitor(
  workspaceId: string,
  token: string | null | undefined,
  deps: WidgetVisitorDeps,
): Promise<WidgetVisitorResult> {
  if (typeof token === "string" && token.length > 0) {
    const claims = deps.verifyToken(token);
    if (claims && claims.workspaceId === workspaceId) {
      const existing = await deps.findVisitor(claims.visitorId, workspaceId);
      if (existing) {
        await deps.touchVisitor?.(existing.id);
        return { visitorId: existing.id, reused: true };
      }
    }
  }

  const visitor = await deps.createVisitor(workspaceId);
  return { visitorId: visitor.id, reused: false };
}
