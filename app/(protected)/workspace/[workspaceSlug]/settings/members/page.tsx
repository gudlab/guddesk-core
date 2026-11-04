import { redirect } from "next/navigation";

import { checkSeatAvailability } from "@/lib/feature-flags";
import {
  invitationExpiryLabel,
  invitationExpiryTitle,
} from "@/lib/invitation-expiry";
import { splitInvitations } from "@/lib/invitations";
import { getCurrentUser } from "@/lib/session";
import {
  getWorkspaceBySlug,
  getWorkspaceInvitations,
  getWorkspaceMembers,
  requireWorkspaceRole,
} from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { InviteMemberForm } from "@/components/workspace/invite-member-form";
import { MembersTable } from "@/components/workspace/members-table";
import { PendingInvitations } from "@/components/workspace/pending-invitations";

export default async function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  const membership = await requireWorkspaceRole(workspace.id, user.id!, [
    "OWNER",
    "ADMIN",
  ]);
  const members = await getWorkspaceMembers(workspace.id);
  const invitations = await getWorkspaceInvitations(workspace.id);
  const seats = await checkSeatAvailability(workspace.id);
  // Only live invites hold a seat. Expired ones are listed as expired.
  // One clock for the split and the labels, so they can't disagree.
  const now = new Date();
  const { active, expired } = splitInvitations(invitations, now);
  const invitationRows = [...active, ...expired].map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    invitedBy: inv.invitedBy.name ?? inv.invitedBy.email ?? "a teammate",
    expiresAt: inv.expiresAt.toISOString(),
    // Worded on the server: "Expires in 7 days", like the invite email.
    expiresLabel: invitationExpiryLabel(inv.expiresAt, now),
    expiresTitle: invitationExpiryTitle(inv.expiresAt),
    expired: expired.includes(inv),
  }));

  return (
    <>
      <DashboardHeader
        heading="Workspace Members"
        text="Manage members and send invitations."
      />

      <div className="space-y-8">
        {/* Invite form */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-sm font-medium">Invite a new member</h2>
          <InviteMemberForm
            workspaceId={workspace.id}
            seatLimit={
              seats.allowed ? null : { used: seats.used, max: seats.maxSeats }
            }
            canUpgrade={membership.role === "OWNER"}
          />
        </div>

        {/* Members list */}
        <div>
          <h2 className="mb-4 text-sm font-medium">
            Members ({members.length})
          </h2>
          <MembersTable
            workspaceId={workspace.id}
            members={members}
            currentUserId={user.id!}
            currentUserRole={membership.role}
          />
        </div>

        {/* Pending invitations */}
        {invitationRows.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-medium">
              Pending invitations ({active.length})
            </h2>
            <PendingInvitations
              workspaceId={workspace.id}
              invitations={invitationRows}
              canRevoke={
                membership.role === "OWNER" || membership.role === "ADMIN"
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
