"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { billingHref } from "@/lib/billing-workspace";
import { Icons } from "@/components/shared/icons";

interface ConversationLimitBannerProps {
  workspaceId: string;
  level: "warning" | "over";
  count: number;
  limit: number;
  monthKey: string;
  /** Only the owner can upgrade. Others are told to ask the owner. */
  canUpgrade: boolean;
}

export function conversationLimitCopy(
  level: "warning" | "over",
  count: number,
  limit: number,
): string {
  return level === "over"
    ? `This workspace has had ${count} conversations this month, more than the ${limit} included in the Free plan. Visitors can still start chats.`
    : `This workspace has used ${count} of the ${limit} conversations included in the Free plan this month.`;
}

/**
 * Free plan conversation allowance banner. Dismissing hides it for the rest
 * of the browser session. The key includes the month and the level, so it
 * shows again when the warning turns into "over" or a new month starts.
 */
export function ConversationLimitBanner({
  workspaceId,
  level,
  count,
  limit,
  monthKey,
  canUpgrade,
}: ConversationLimitBannerProps) {
  const storageKey = `guddesk:conversation-limit:${workspaceId}:${monthKey}:${level}`;
  // Start hidden so a dismissed banner doesn't flash before sessionStorage is read.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(window.sessionStorage.getItem(storageKey) === "1");
    } catch {
      setHidden(false);
    }
  }, [storageKey]);

  if (hidden) return null;

  function dismiss() {
    setHidden(true);
    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Private mode or storage disabled: hide for this page view only.
    }
  }

  const tone =
    level === "over"
      ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100";

  return (
    <div
      role="status"
      className={`mb-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${tone}`}
    >
      <p className="flex-1">
        {conversationLimitCopy(level, count, limit)}{" "}
        {canUpgrade ? (
          <>
            <Link href={billingHref(workspaceId)} className="font-medium underline">
              Upgrade to Pro
            </Link>{" "}
            for unlimited conversations.
          </>
        ) : (
          "Ask the workspace owner to upgrade."
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded p-0.5 opacity-70 hover:opacity-100"
      >
        <Icons.close className="size-4" />
      </button>
    </div>
  );
}
