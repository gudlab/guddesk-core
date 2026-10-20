"use server";

import { auth } from "@/auth";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireWorkspaceRole } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import type { WeekSchedule } from "@/lib/sla/business-hours";
import { saveBusinessHours } from "@/lib/sla/save-business-hours";

export async function upsertBusinessHours(
  workspaceId: string,
  data: {
    timezone: string;
    schedule: WeekSchedule;
    holidays: string[];
  },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: "error" as const, message: "Unauthorized" };
    }
    await requireWorkspaceRole(workspaceId, session.user.id, ["OWNER", "ADMIN"]);

    const result = await saveBusinessHours(
      {
        async upsert(id, value) {
          const fields = {
            timezone: value.timezone,
            schedule: value.schedule as unknown as Prisma.InputJsonValue,
            holidays: value.holidays as unknown as Prisma.InputJsonValue,
          };
          await prisma.businessHours.upsert({
            where: { workspaceId: id },
            create: { workspaceId: id, ...fields },
            update: fields,
          });
        },
      },
      workspaceId,
      data,
    );

    if (result.status === "success") revalidatePath("/workspace");
    return result;
  } catch (error) {
    console.error("Upsert business hours error:", error);
    return { status: "error" as const, message: "Failed to save business hours" };
  }
}
