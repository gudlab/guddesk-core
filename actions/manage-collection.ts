"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace";
import { collectionSchema } from "@/lib/validations/article";
import {
  HELP_SLUG_MAX,
  isReservedCollectionSlug,
  isUrlSafeSlug,
  nextStoredSlug,
} from "@/lib/help-center/slug";
import { revalidatePath } from "next/cache";

export async function createCollection(
  workspaceId: string,
  data: { name: string; slug: string; description?: string; icon?: string },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const validated = collectionSchema.parse(data);

    const existing = await prisma.collection.findUnique({
      where: { workspaceId_slug: { workspaceId, slug: validated.slug } },
    });
    if (existing) {
      return { status: "error" as const, message: "Collection slug already exists" };
    }

    const maxOrder = await prisma.collection.aggregate({
      where: { workspaceId },
      _max: { order: true },
    });

    const collection = await prisma.collection.create({
      data: {
        workspaceId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description ?? null,
        icon: validated.icon ?? null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    revalidatePath(`/workspace`);
    return { status: "success" as const, id: collection.id };
  } catch (error) {
    console.error("Create collection error:", error);
    return { status: "error" as const, message: "Failed to create collection" };
  }
}

export async function updateCollection(
  collectionId: string,
  data: { name?: string; slug?: string; description?: string; icon?: string; isPublished?: boolean },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { workspaceId: true, slug: true },
    });
    if (!collection) {
      return { status: "error" as const, message: "Collection not found" };
    }

    await requireWorkspaceRole(collection.workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    let nextSlug = collection.slug;
    if (data.slug !== undefined) {
      nextSlug = nextStoredSlug(data.slug, collection.slug, HELP_SLUG_MAX.collection);
      if (!isUrlSafeSlug(nextSlug) || isReservedCollectionSlug(nextSlug)) {
        return {
          status: "error" as const,
          message: isReservedCollectionSlug(nextSlug)
            ? "That slug is reserved for help center search"
            : "Slug must be lowercase letters, numbers, and hyphens",
        };
      }
      if (nextSlug !== collection.slug) {
        const existing = await prisma.collection.findUnique({
          where: { workspaceId_slug: { workspaceId: collection.workspaceId, slug: nextSlug } },
        });
        if (existing) {
          return { status: "error" as const, message: "Slug already in use" };
        }
      }
    }

    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: nextSlug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });

    revalidatePath(`/workspace`);
    revalidatePath(`/help`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Update collection error:", error);
    return { status: "error" as const, message: "Failed to update collection" };
  }
}

export async function deleteCollection(collectionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { workspaceId: true },
    });
    if (!collection) {
      return { status: "error" as const, message: "Collection not found" };
    }

    await requireWorkspaceRole(collection.workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    // Move articles to uncategorized
    await prisma.article.updateMany({
      where: { collectionId },
      data: { collectionId: null },
    });

    await prisma.collection.delete({ where: { id: collectionId } });

    revalidatePath(`/workspace`);
    revalidatePath(`/help`);
    return { status: "success" as const };
  } catch (error) {
    console.error("Delete collection error:", error);
    return { status: "error" as const, message: "Failed to delete collection" };
  }
}
