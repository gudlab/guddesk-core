"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { OFFLINE_NAV_MESSAGE, heldNavigationTarget, onBackOnline } from "@/lib/network";

const TOAST_ID = "offline-navigation";

/**
 * Offline, a dashboard link click would end on the browser's own offline
 * page. Hold it, say so, and open the page when the connection is back.
 */
export function OfflineNavGuard() {
  const router = useRouter();

  useEffect(() => {
    let pending: string | null = null;

    function onClick(event: MouseEvent) {
      if (navigator.onLine) return;
      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[href]") ?? null;
      const target = heldNavigationTarget(event, anchor, window.location);
      if (!target) return;
      // Capture phase, before next/link: it skips a click that is already
      // defaultPrevented.
      event.preventDefault();
      pending = target;
      toast.info(OFFLINE_NAV_MESSAGE, { id: TOAST_ID });
    }

    const stopOnline = onBackOnline(() => {
      if (!pending) return;
      const target = pending;
      pending = null;
      toast.dismiss(TOAST_ID);
      router.push(target);
    });

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      stopOnline();
    };
  }, [router]);

  return null;
}
