"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { gudBotSettingsSchema } from "@/lib/validations/gudbot";
import { requireWorkspaceRole } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function updateGudBotSettings(
  workspaceId: string,
  data: unknown,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Unauthorized" };
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const validated = gudBotSettingsSchema.parse(data);

    await prisma.gudBotSettings.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        enabled: validated.enabled,
        confidenceThreshold: validated.confidenceThreshold,
        maxTurns: validated.maxTurns,
        handoffMessage: validated.handoffMessage,
        channels: validated.channels,
      },
      update: {
        enabled: validated.enabled,
        confidenceThreshold: validated.confidenceThreshold,
        maxTurns: validated.maxTurns,
        handoffMessage: validated.handoffMessage,
        channels: validated.channels,
      },
    });

    revalidatePath("/workspace");
    return { status: "success" as const };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Failed to save GudBot settings" };
  }
}
