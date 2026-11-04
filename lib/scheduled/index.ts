import { after } from "next/server";

import { prisma } from "@/lib/db";
import { processSlaBreaches } from "@/lib/sla/process";
import { scheduleWorkspaceJobs, type WorkspaceJob } from "@/lib/scheduled/opportunistic";

/**
 * The per-workspace jobs that inbox and API requests run opportunistically.
 * Hook: add the automations "unassigned for" job here once it exists, next
 * to its line in .github/workflows/cron.yml.
 */
export const WORKSPACE_JOBS: WorkspaceJob[] = [
  { name: "sla-check", run: (workspaceId) => processSlaBreaches(workspaceId) },
];

/** Call from a request handler once the workspace is known. Never throws. */
export function scheduleOpportunisticJobs(workspaceId: string | null | undefined): void {
  scheduleWorkspaceJobs(workspaceId, { db: prisma, after, jobs: WORKSPACE_JOBS });
}
