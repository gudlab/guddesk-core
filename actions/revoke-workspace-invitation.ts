"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  INVITATION_MANAGER_ROLES,
  revokePendingInvitation,
  type InvitationDb,
} from "@/lib/invitations";
import { requireWorkspaceRole } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function revokeWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Owners and admins only, checked on the server.
    await requireWorkspaceRole(workspaceId, session.user.id, [
      ...INVITATION_MANAGER_ROLES,
    ]);

    const result = await revokePendingInvitation(
      prisma as unknown as InvitationDb,
      workspaceId,
      invitationId,
    );
    if (result.status === "already_accepted") {
      return {
        status: "error",
        message: "This invitation was already accepted. Remove the member instead.",
      };
    }
    if (result.status === "not_found") {
      return { status: "error", message: "Invitation not found" };
    }

    revalidatePath(`/workspace`);
    return { status: "success" };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to revoke invitation" };
  }
}
