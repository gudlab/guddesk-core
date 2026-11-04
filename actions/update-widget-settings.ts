"use server";

import { randomBytes } from "crypto";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const widgetSettingsSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  position: z.enum(["bottom-right", "bottom-left"]).optional(),
  welcomeMessage: z.string().min(1).max(500).optional(),
  workspaceName: z.string().max(100).optional().nullable(),
  workspaceAvatarUrl: z.string().url().optional().nullable(),
  showBranding: z.boolean().optional(),
  requireEmail: z.boolean().optional(),
  suggestArticles: z.boolean().optional(),
  offlineFormTimeout: z.number().int().min(1).max(30).optional().nullable(),
  pageVisibilityMode: z.enum(["exclude", "include"]).optional(),
  pageVisibilityPatterns: z
    .array(z.string().min(1).max(200))
    .max(50)
    .optional(),
});

export async function updateWidgetSettings(
  workspaceId: string,
  data: z.infer<typeof widgetSettingsSchema>,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const validated = widgetSettingsSchema.parse(data);

    // Enforce branding for free plan workspaces
    if (validated.showBranding === false) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { plan: true },
      });
      if (workspace?.plan !== "PRO") {
        validated.showBranding = true;
      }
    }

    await prisma.widgetSettings.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        ...validated,
      },
      update: validated,
    });

    revalidatePath(`/workspace`);
    return { status: "success" };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error", message: error.message };
    }
    return { status: "error", message: "Failed to update widget settings" };
  }
}

// ---------------------------------------------------------------------------
// Identity Verification
// ---------------------------------------------------------------------------

/**
 * Generate and store a new HMAC-SHA256 secret for identity verification.
 * When set, the widget visitors endpoint will require a valid userHash
 * for identify() calls that include a userId (externalId).
 */
export async function generateIdentitySecret(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const secret = randomBytes(32).toString("hex");

    await prisma.widgetSettings.upsert({
      where: { workspaceId },
      create: { workspaceId, identitySecret: secret },
      update: { identitySecret: secret },
    });

    revalidatePath(`/workspace`);
    return { status: "success" as const, secret };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Failed to generate identity secret" };
  }
}

/**
 * Disable identity verification by clearing the secret.
 */
export async function disableIdentityVerification(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    await prisma.widgetSettings.upsert({
      where: { workspaceId },
      create: { workspaceId, identitySecret: null },
      update: { identitySecret: null },
    });

    revalidatePath(`/workspace`);
    return { status: "success" as const };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Failed to disable identity verification" };
  }
}
