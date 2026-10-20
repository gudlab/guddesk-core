"use client";

import { useEffect, useRef } from "react";

import { documentVisibility, startPollingFallback } from "@/lib/inbox-polling";
import { getPusherClient } from "@/lib/pusher-client";

/**
 * Calls poll every intervalMs while the tab is visible, whenever Pusher
 * can't deliver updates: it isn't configured, it hasn't connected within 8s,
 * or it reports "failed" or "unavailable". Once Pusher connects, polling
 * stops, so the realtime path is unchanged. Stops on unmount or when
 * enabled is false.
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
      realtime: getPusherClient()?.connection ?? null,
      visibility: documentVisibility,
    });
    return () => handle.stop();
  }, [enabled, intervalMs]);
}
