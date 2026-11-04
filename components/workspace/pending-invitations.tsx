"use client";

import { useState, useTransition } from "react";
import { getInvitationLink } from "@/actions/get-invitation-link";
import { revokeWorkspaceInvitation } from "@/actions/revoke-workspace-invitation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableLink } from "@/components/workspace/invite-panel";

export interface PendingInvitationRow {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
  /** "Expires in 7 days" (see lib/invitation-expiry.ts). */
  expiresLabel: string;
  /** Exact expiry, e.g. "1 Nov 2026, 23:03 UTC". */
  expiresTitle: string;
  expired: boolean;
}

interface PendingInvitationsProps {
  workspaceId: string;
  invitations: PendingInvitationRow[];
  canRevoke: boolean;
}

export function PendingInvitations({
  workspaceId,
  invitations,
  canRevoke,
}: PendingInvitationsProps) {
  const [isPending, startTransition] = useTransition();
  // Links fetched on request, by invitation id. Never in the page HTML.
  const [links, setLinks] = useState<Record<string, string>>({});

  function handleShowLink(invitationId: string) {
    startTransition(async () => {
      const result = await getInvitationLink(workspaceId, invitationId);
      if (result.status === "error") {
        toast.error(result.message || "Could not get the invite link");
        return;
      }
      setLinks((current) => ({ ...current, [invitationId]: result.inviteUrl }));
    });
  }

  function handleRevoke(invitationId: string) {
    startTransition(async () => {
      const result = await revokeWorkspaceInvitation(workspaceId, invitationId);
      if (result.status === "error") {
        toast.error(result.message || "Failed to revoke invitation");
        return;
      }
      toast.success("Invitation revoked");
    });
  }

  return (
    <div className="space-y-2">
      {invitations.map((inv) => (
        <div key={inv.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{inv.email}</p>
              <p className="text-muted-foreground text-xs">
                Invited as {inv.role} by {inv.invitedBy}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {inv.expired ? (
                <Badge variant="secondary">Expired</Badge>
              ) : (
                <time
                  dateTime={inv.expiresAt}
                  title={inv.expiresTitle}
                  className="text-muted-foreground text-xs"
                >
                  {inv.expiresLabel}
                </time>
              )}
              {canRevoke && !inv.expired && !links[inv.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleShowLink(inv.id)}
                  disabled={isPending}
                >
                  Get link
                </Button>
              )}
              {canRevoke && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={isPending}
                >
                  {inv.expired ? "Remove" : "Revoke"}
                </Button>
              )}
            </div>
          </div>
          {links[inv.id] && <CopyableLink url={links[inv.id]} />}
        </div>
      ))}
    </div>
  );
}
