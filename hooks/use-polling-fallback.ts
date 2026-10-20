"use client";

import { useEffect, useRef } from "react";

import { documentVisibility, startPollingFallback } from "@/lib/inbox-polling";
import { getPusherClient } from "@/lib/pusher-client";

/**
 * Calls poll every intervalMs while the tab is visible, but only when Pusher
 * isn't configured. With Pusher configured this does nothing, so the
 * realtime path is unchanged. Stops on unmount or when enabled is false.
 */
export function usePollingFallback(
  poll: () => unknown,
  intervalMs: number,
  enabled: boolean = true,
) {
  const pollRef = useRef(poll);
  pollRef.current = poll;

  useEffect(() => {
    if (!enabled) return;
    const handle = startPollingFallback({
      intervalMs,
      poll: () => pollRef.current(),
      hasRealtime: () => getPusherClient() !== null,
      visibility: documentVisibility,
    });
    return () => handle?.stop();
  }, [enabled, intervalMs]);
}
