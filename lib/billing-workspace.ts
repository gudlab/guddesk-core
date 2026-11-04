/** Billing page link for one workspace. */
export function billingHref(workspaceId: string): string {
  return `/dashboard/billing?workspace=${encodeURIComponent(workspaceId)}`;
}

export interface BillingWorkspaceChoice<T> {
  /** The workspace to show, or null when the user owns none. */
  workspace: T | null;
  /** A workspace was asked for, the user is in it, but isn't its owner. */
  requestedNotOwned: boolean;
}

/**
 * Picks the workspace the billing page shows: the requested one when the
 * user owns it, otherwise the first workspace they own. When the user asked
 * for a workspace they're in but don't own, nothing is shown, so they don't
 * see an unrelated workspace's billing in its place.
 */
export function pickBillingWorkspace<T extends { id: string; role: string }>(
  workspaces: T[],
  requestedId: string | null | undefined,
): BillingWorkspaceChoice<T> {
  const owned = workspaces.filter((w) => w.role === "OWNER");
  if (requestedId) {
    const requested = workspaces.find((w) => w.id === requestedId);
    if (requested?.role === "OWNER") {
      return { workspace: requested, requestedNotOwned: false };
    }
    if (requested) return { workspace: null, requestedNotOwned: true };
    return { workspace: owned[0] ?? null, requestedNotOwned: false };
  }
  return { workspace: owned[0] ?? null, requestedNotOwned: false };
}
