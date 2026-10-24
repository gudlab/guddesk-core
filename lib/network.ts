/**
 * Keeping the inbox usable when the connection drops.
 *
 * A server action called while offline rejects instead of returning
 * { status: "error" }. Inside startTransition that rejection goes to the
 * nearest error boundary and replaces the page, so the inbox calls actions
 * through callAction, which turns it into a toast.
 */

export const OFFLINE_MESSAGE = "Couldn't reach GudDesk. Check your connection and try again.";

/** Run a server action; if it throws (dropped connection, server unreachable), report it and return null. */
export async function callAction<T>(
  action: () => Promise<T>,
  report: (message: string) => void,
): Promise<T | null> {
  try {
    return await action();
  } catch {
    report(OFFLINE_MESSAGE);
    return null;
  }
}

/** Call onOnline whenever the browser comes back online. Returns the unsubscribe. */
export function onBackOnline(
  onOnline: () => void,
  target: Pick<Window, "addEventListener" | "removeEventListener"> | undefined = typeof window === "undefined"
    ? undefined
    : window,
): () => void {
  if (!target) return () => {};
  target.addEventListener("online", onOnline);
  return () => target.removeEventListener("online", onOnline);
}
