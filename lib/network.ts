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

/**
 * Offline, a click on a dashboard link can't fetch the next page, and the
 * browser falls back to a full load that ends on its own offline page. The
 * dashboard holds such a click instead and opens the page once the browser
 * is back online.
 */
export const OFFLINE_NAV_MESSAGE = "You're offline. We'll open that page when you're back online.";

interface ClickLike {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

interface AnchorLike {
  href: string;
  target: string;
  hasAttribute(name: string): boolean;
}

/** The same-origin page a plain link click would open, or null when the click should go through untouched. */
export function heldNavigationTarget(
  click: ClickLike,
  anchor: AnchorLike | null,
  location: Pick<Location, "origin" | "pathname" | "search">,
): string | null {
  if (!anchor || click.defaultPrevented || click.button !== 0) return null;
  if (click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  let url: URL;
  try {
    url = new URL(anchor.href, location.origin);
  } catch {
    return null;
  }
  if (url.origin !== location.origin) return null;
  // Same page, maybe another #hash: nothing to fetch.
  if (url.pathname === location.pathname && url.search === location.search) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
