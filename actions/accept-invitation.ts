"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ALREADY_MEMBER_MESSAGE,
  INVITATION_REVOKED_MESSAGE,
  acceptInvitationErrorMessage,
  acceptInvitationWithLock,
  closedInvitationMessage,
  expireInvitation,
  normalizeInviteEmail,
  type ExpireInvitationDb,
  type InvitationDb,
} from "@/lib/invitations";
import { revalidatePath } from "next/cache";

export async function acceptInvitation(token: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      throw new Error("Unauthorized");
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: { select: { name: true, slug: true } } },
    });

    if (!invitation) {
      return { status: "error", message: "This invitation was revoked or doesn't exist" };
    }

    // Verify the email matches (stored emails may be mixed case)
    if (
      normalizeInviteEmail(invitation.email) !== normalizeInviteEmail(session.user.email)
    ) {
      return {
        status: "error",
        message: "This invitation was sent to a different email address",
      };
    }

    if (invitation.status !== "PENDING") {
      // Second click after the first one went through.
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.workspaceId,
            userId: session.user.id,
          },
        },
        select: { id: true },
      });
      if (member) {
        return {
          status: "success",
          alreadyMember: true,
          message: ALREADY_MEMBER_MESSAGE,
          workspaceSlug: invitation.workspace.slug,
        };
      }
      return { status: "error", message: closedInvitationMessage(invitation) };
    }

    if (invitation.expiresAt < new Date()) {
      const message = await expireInvitation(prisma as unknown as ExpireInvitationDb, token);
      return { status: "error", message };
    }

    // Seats are not checked here on purpose. A pending invitation already
    // holds a seat, and invitations sent before limits were enforced stay
    // valid (see canAcceptInvitation in lib/plan-limits.ts). The status
    // re-check, membership check and writes run under the workspace lock so
    // a double click can't accept twice.
    const accepted = await acceptInvitationWithLock(
      prisma as unknown as InvitationDb,
      {
        token,
        workspaceId: invitation.workspaceId,
        userId: session.user.id,
        role: invitation.role,
      },
    );

    if (accepted.status === "revoked") {
      return { status: "error", message: INVITATION_REVOKED_MESSAGE };
    }
    if (accepted.status === "invalid") {
      return { status: "error", message: "This invitation is no longer valid" };
    }

    revalidatePath("/dashboard");
    if (accepted.status === "already_member") {
      return {
        status: "success",
        alreadyMember: true,
        message: ALREADY_MEMBER_MESSAGE,
        workspaceSlug: invitation.workspace.slug,
      };
    }
    return { status: "success", workspaceSlug: invitation.workspace.slug };
  } catch (error) {
    console.error("acceptInvitation failed:", error);
    return { status: "error", message: acceptInvitationErrorMessage(error) };
  }
}
