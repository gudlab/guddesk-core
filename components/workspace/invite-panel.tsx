"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { billingHref } from "@/lib/billing-workspace";
import { seatLimitSummary } from "@/lib/plan-limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InvitePanelProps {
  workspaceId: string;
  seatLimit: { used: number; max: number } | null;
  canUpgrade: boolean;
  /** The link for the invite just created, when its email was not sent. */
  linkNotice: { message: string; inviteUrl: string } | null;
  /** The invite form, shown while a seat is free. */
  form: ReactNode;
}

/**
 * The invite area of the members page. The link notice is rendered in
 * both branches: on FREE (2 seats) the owner plus one pending invite fills
 * the workspace, so the invite that shows the link is also the one that
 * swaps the form for the seat-limit notice.
 */
export function InvitePanel({
  workspaceId,
  seatLimit,
  canUpgrade,
  linkNotice,
  form,
}: InvitePanelProps) {
  return (
    <div className="space-y-3">
      {seatLimit ? (
        <SeatLimitNotice
          workspaceId={workspaceId}
          seatLimit={seatLimit}
          canUpgrade={canUpgrade}
        />
      ) : (
        form
      )}
      {linkNotice && <InviteLinkNotice notice={linkNotice} />}
    </div>
  );
}

export function SeatLimitNotice({
  workspaceId,
  seatLimit,
  canUpgrade,
}: {
  workspaceId: string;
  seatLimit: { used: number; max: number };
  canUpgrade: boolean;
}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
      {seatLimitSummary(seatLimit.used, seatLimit.max)}{" "}
      {canUpgrade ? (
        <>
          <Link
            href={billingHref(workspaceId)}
            className="font-medium underline"
          >
            Upgrade to Pro
          </Link>{" "}
          to invite more people.
        </>
      ) : (
        "Ask the workspace owner to upgrade."
      )}
    </div>
  );
}

export function InviteLinkNotice({
  notice,
}: {
  notice: { message: string; inviteUrl: string };
}) {
  return (
    <div
      role="status"
      className="space-y-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p>{notice.message}</p>
      <CopyableLink url={notice.inviteUrl} />
    </div>
  );
}

export function CopyableLink({ url }: { url: string }) {
  return (
    <div className="flex gap-2">
      <Input
        readOnly
        value={url}
        aria-label="Invite link"
        onFocus={(e) => e.currentTarget.select()}
        className="bg-background font-mono text-xs"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          navigator.clipboard
            .writeText(url)
            .then(() => toast.success("Invite link copied"))
            .catch(() =>
              toast.error("Could not copy. Select the link and copy it."),
            );
        }}
      >
        Copy link
      </Button>
    </div>
  );
}
