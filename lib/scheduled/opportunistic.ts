/**
 * Opportunistic scheduled jobs. Vercel Hobby only runs crons once a day,
 * so relevant inbox and API requests also run per-workspace jobs (the SLA
 * check today) at most once every 5 minutes per workspace. The job runs
 * after the response is sent, never blocks or fails the request, and
 * catches its own errors.
 *
 * Shared byte-for-byte between flowchat and guddesk-core.
 */
import { claimThrottle, throttleKey, type ThrottleDb } from "@/lib/throttle";

export const OPPORTUNISTIC_WINDOW_MS = 5 * 60 * 1000;

export interface WorkspaceJob {
  /** Throttle key part, e.g. "sla-check". */
  name: string;
  run: (workspaceId: string) => Promise<unknown>;
}

export interface OpportunisticDeps {
  db: ThrottleDb;
  /** next/server after() in the app; called with the work to do later. */
  after: (task: () => Promise<void>) => void;
  jobs: WorkspaceJob[];
  now?: () => Date;
  log?: (message: string, error: unknown) => void;
}

/** Runs each job for the workspace if its 5-minute window is free. */
export async function runWorkspaceJobs(workspaceId: string, deps: OpportunisticDeps): Promise<void> {
  for (const job of deps.jobs) {
    try {
      const claimed = await claimThrottle(
        deps.db,
        throttleKey(job.name, workspaceId),
        OPPORTUNISTIC_WINDOW_MS,
        deps.now?.() ?? new Date(),
      );
      if (claimed) await job.run(workspaceId);
    } catch (error) {
      (deps.log ?? console.error)(`[scheduled] ${job.name} failed for workspace ${workspaceId}`, error);
    }
  }
}

/** Schedules runWorkspaceJobs after the response. Never throws. */
export function scheduleWorkspaceJobs(workspaceId: string | null | undefined, deps: OpportunisticDeps): void {
  if (!workspaceId) return;
  try {
    deps.after(() => runWorkspaceJobs(workspaceId, deps));
  } catch (error) {
    (deps.log ?? console.error)("[scheduled] could not schedule workspace jobs", error);
  }
}
