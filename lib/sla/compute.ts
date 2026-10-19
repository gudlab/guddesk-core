/**
 * SLA deadline computation.
 *
 * Loads the matching SLA policy for a workspace + priority,
 * applies business hours, and returns deadline timestamps.
 */

import { prisma } from "@/lib/db";
import {
  addBusinessMinutes,
  DEFAULT_SCHEDULE,
  type WeekSchedule,
} from "./business-hours";

export interface SlaDeadlines {
  slaPolicyId: string;
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
}

/**
 * Compute SLA deadlines for a new conversation.
 *
 * Looks up the matching SLA policy:
 *   1. Exact priority match (e.g. priority=2)
 *   2. Fall back to default policy (priority=null, isDefault=true)
 *
 * If no policy found, returns null (no SLA applies).
 */
export async function computeSlaDeadlines(
  workspaceId: string,
  priority: number = 0,
  startTime: Date = new Date(),
): Promise<SlaDeadlines | null> {
  // Find matching policy: exact priority first, then default
  const policies = await prisma.slaPolicy.findMany({
    where: {
      workspaceId,
      OR: [{ priority }, { priority: null, isDefault: true }],
    },
    orderBy: { priority: { sort: "asc", nulls: "last" } },
  });

  const policy =
    policies.find((p) => p.priority === priority) ??
    policies.find((p) => p.isDefault) ??
    null;

  if (!policy) return null;

  // Load business hours (or use defaults)
  const businessHours = await prisma.businessHours.findUnique({
    where: { workspaceId },
  });

  const schedule = (businessHours?.schedule as WeekSchedule) ?? DEFAULT_SCHEDULE;
  const holidays = (businessHours?.holidays as string[]) ?? [];
  const timezone = businessHours?.timezone ?? "UTC";

  const firstResponseDueAt = addBusinessMinutes(
    startTime,
    policy.firstResponseMinutes,
    schedule,
    holidays,
    timezone,
  );

  const resolutionDueAt = addBusinessMinutes(
    startTime,
    policy.resolutionMinutes,
    schedule,
    holidays,
    timezone,
  );

  return {
    slaPolicyId: policy.id,
    firstResponseDueAt,
    resolutionDueAt,
  };
}
