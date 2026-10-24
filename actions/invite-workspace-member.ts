"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { emailFrom } from "@/lib/email/from";
import { sendEmail } from "@/lib/email/send";
import { requireWorkspaceRole } from "@/lib/workspace";
import { workspaceInviteSchema } from "@/lib/validations/workspace";
import { env } from "@/env.mjs";
import WorkspaceInvitationEmail from "@/emails/workspace-invitation-email";
import { revalidatePath } from "next/cache";

export async function inviteWorkspaceMember(
  workspaceId: string,
  data: { email: string; role: "ADMIN" | "AGENT" | "VIEWER" },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const { email, role } = workspaceInviteSchema.parse(data);

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: existingUser.id },
        },
      });

      if (existingMember) {
        return { status: "error", message: "This user is already a workspace member" };
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: { workspaceId, email, status: "PENDING" },
    });

    if (existingInvitation) {
      return { status: "error", message: "An invitation has already been sent to this email" };
    }

    // Create invitation (expires in 7 days)
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send invitation email via Resend
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    const appUrl = env.NEXT_PUBLIC_APP_URL;
    const inviteUrl = `${appUrl}/invitation?token=${invitation.token}`;

    const sent = await sendEmail("workspace-invitation", {
      from: emailFrom(),
      to: email,
      subject: `You've been invited to join ${workspace?.name ?? "a workspace"} on GudDesk`,
      react: WorkspaceInvitationEmail({
        inviterName: session.user.name ?? "A workspace member",
        workspaceName: workspace?.name ?? "a workspace",
        role: role,
        actionUrl: inviteUrl,
      }),
    });

    revalidatePath(`/workspace`);
    // The invitation exists either way. When its email did not go out, the
    // form shows the link so it can be shared by hand.
    if (sent.status === "failed") {
      return {
        status: "success",
        token: invitation.token,
        emailStatus: "failed",
        inviteUrl,
      } as const;
    }
    return {
      status: "success",
      token: invitation.token,
      emailStatus: "sent",
    } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message } as const;
    }
    return { status: "error", message: "Failed to send invitation" } as const;
  }
}
