"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/outbound-email";
import { emailFrom } from "@/lib/email/from";
import { requireWorkspaceRole } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/feature-flags";
import {
  createInvitationWithSeatLock,
  normalizeInviteEmail,
  type InvitationDb,
} from "@/lib/invitations";
import { seatLimitMessage } from "@/lib/plan-limits";
import { workspaceInviteSchema } from "@/lib/validations/workspace";
import { env } from "@/env.mjs";
import WorkspaceInvitationEmail from "@/emails/workspace-invitation-email";
import { revalidatePath } from "next/cache";
import { getAppUrl } from "@/lib/app-url";

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

    // Stored trimmed and lowercased; lookups are case-insensitive because
    // older rows may be mixed case.
    const { email, role } = workspaceInviteSchema.parse({
      ...data,
      email: normalizeInviteEmail(data.email ?? ""),
    });

    // Member check, duplicate check, seat count and create run in one transaction behind
    // a per-workspace advisory lock, so parallel invites can't go past the
    // seat limit or send two live invites to one email. Expired pending
    // invites don't block a new one. Existing members are never removed; a
    // workspace at or over the limit just can't invite more.
    const result = await createInvitationWithSeatLock(
      prisma as unknown as InvitationDb,
      getPlanLimits,
      { workspaceId, email, role, invitedById: session.user.id },
    );

    if (result.status === "already_member") {
      return { status: "error", message: "This user is already a workspace member" };
    }

    if (result.status === "duplicate") {
      return { status: "error", message: "An invitation has already been sent to this email" };
    }

    if (result.status === "seat_limit") {
      return {
        status: "error",
        code: "SEAT_LIMIT",
        message: seatLimitMessage(result.decision),
      };
    }

    const invitation = { token: result.token };

    // Send invitation email via Resend
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    const appUrl = getAppUrl();
    const inviteUrl = `${appUrl}/invitation?token=${invitation.token}`;

    // "sent", "skipped" (the gate blocked it on this environment) or
    // "failed". When the email did not go out, the form shows the link.
    let emailStatus: "sent" | "skipped" | "failed" = "sent";
    try {
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
      // A Resend error is returned, not thrown; sendEmail logs it redacted.
      if (sent.status === "skipped") emailStatus = "skipped";
      else if (sent.status === "failed") emailStatus = "failed";
    } catch {
      // The invitation exists; the link can still be shared by hand.
      emailStatus = "failed";
    }

    revalidatePath(`/workspace`);
    if (emailStatus !== "sent") {
      return { status: "success", token: invitation.token, emailStatus, inviteUrl };
    }
    return { status: "success", token: invitation.token, emailStatus };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to send invitation" };
  }
}
