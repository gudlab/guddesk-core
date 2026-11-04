"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canUserCreateWorkspace } from "@/lib/feature-flags";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { revalidatePath } from "next/cache";

export async function createWorkspace(data: { name: string; slug: string }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check workspace limit for free plan
    const limitCheck = await canUserCreateWorkspace(session.user.id);
    if (!limitCheck.allowed) {
      return { status: "error", message: "Workspace limit reached" };
    }

    const { name, slug } = createWorkspaceSchema.parse(data);

    // Check if slug is already taken
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      return { status: "error", message: "This URL slug is already taken" };
    }

    // Create workspace and add the creator as OWNER
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
        widgetSettings: {
          create: {
            workspaceName: name,
          },
        },
      },
    });

    revalidatePath("/dashboard");
    return { status: "success", workspaceSlug: workspace.slug };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { status: "error", message: "Unauthorized" };
    }
    return { status: "error", message: "Failed to create workspace" };
  }
}
