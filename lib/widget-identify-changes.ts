/**
 * Decide whether a widget identify call changes anything on the visitor.
 * The visitors route only adds a customer.identified timeline event and
 * reruns company matching when it does, so repeat identify calls with the
 * same data stay cheap and do not flood the timeline.
 */
export type StoredVisitorIdentity = {
  externalId: string | null;
  name: string | null;
  email: string | null;
};

export type IncomingVisitorIdentity = {
  externalId?: string | null;
  name?: unknown;
  email?: unknown;
};

export function hasIdentityChanges(
  current: StoredVisitorIdentity | null | undefined,
  incoming: IncomingVisitorIdentity,
): boolean {
  if (!current) return true;
  if (incoming.externalId && incoming.externalId !== current.externalId) {
    return true;
  }
  if (incoming.name !== undefined && incoming.name !== current.name) {
    return true;
  }
  if (incoming.email !== undefined && incoming.email !== current.email) {
    return true;
  }
  return false;
}
