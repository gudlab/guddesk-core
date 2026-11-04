"use server";

import { auth } from "@/auth";
import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import {
  INVITATION_MANAGER_ROLES,
  pendingInvitationLink,
  type InvitationLinkDb,
} from "@/lib/invitations";
import { requireWorkspaceRole } from "@/lib/workspace";

/** Read only. Owners and admins get the link for a live pending invite. */
export async function getInvitationLink(workspaceId: string, invitationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, [
      ...INVITATION_MANAGER_ROLES,
    ]);

    const result = await pendingInvitationLink(
      prisma as unknown as InvitationLinkDb,
      workspaceId,
      invitationId,
      getAppUrl(),
    );
    if (result.status === "expired") {
      return { status: "error" as const, message: "This invitation has expired. Remove it and invite again." };
    }
    if (result.status === "not_found") {
      return { status: "error" as const, message: "Invitation not found" };
    }
    return { status: "success" as const, inviteUrl: result.inviteUrl };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Could not get the invite link" };
  }
}
