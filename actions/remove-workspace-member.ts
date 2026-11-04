"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function removeWorkspaceMember(workspaceId: string, memberId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.workspaceId !== workspaceId) {
      return { status: "error", message: "Member not found" };
    }

    // Cannot remove yourself if you're the only OWNER
    if (member.role === "OWNER") {
      const ownerCount = await prisma.workspaceMember.count({
        where: { workspaceId, role: "OWNER" },
      });

      if (ownerCount <= 1) {
        return {
          status: "error",
          message: "Cannot remove the last owner. Transfer ownership first.",
        };
      }
    }

    // Prevent ADMIN from removing OWNER
    const requester = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (requester?.role === "ADMIN" && member.role === "OWNER") {
      return { status: "error", message: "Admins cannot remove owners" };
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });

    revalidatePath(`/workspace`);
    return { status: "success" };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to remove member" };
  }
}
