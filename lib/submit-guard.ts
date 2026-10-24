/**
 * A synchronous in-flight flag for send buttons and Enter-to-send. React's
 * isPending only flips after a re-render, so two keydowns in the same tick
 * would both pass an isPending check; a ref flips at once.
 */
export interface InFlightRef {
  current: boolean;
}

/** True if this call may submit (and marks it in flight); false if one is already running. */
export function claimSubmit(ref: InFlightRef): boolean {
  if (ref.current) return false;
  ref.current = true;
  return true;
}

export function releaseSubmit(ref: InFlightRef): void {
  ref.current = false;
}
