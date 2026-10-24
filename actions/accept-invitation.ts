"use server";

import { auth } from "@/auth";
import { normalizeEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
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
      return { status: "error", message: "Invitation not found" };
    }

    if (invitation.status !== "PENDING") {
      return { status: "error", message: "This invitation has already been used" };
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { token },
        data: { status: "EXPIRED" },
      });
      return { status: "error", message: "This invitation has expired" };
    }

    // Verify the email matches
    if (normalizeEmail(invitation.email) !== normalizeEmail(session.user.email)) {
      return {
        status: "error",
        message: "This invitation was sent to a different email address",
      };
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      await prisma.workspaceInvitation.update({
        where: { token },
        data: { status: "ACCEPTED" },
      });
      return { status: "success", workspaceSlug: invitation.workspace.slug };
    }

    // Accept: create membership and mark invitation as accepted
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: session.user.id,
          role: invitation.role,
        },
      }),
      prisma.workspaceInvitation.update({
        where: { token },
        data: { status: "ACCEPTED" },
      }),
    ]);

    revalidatePath("/dashboard");
    return { status: "success", workspaceSlug: invitation.workspace.slug };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to accept invitation" };
  }
}
