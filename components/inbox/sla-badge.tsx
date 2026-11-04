"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

interface Props {
  firstResponseDueAt?: string | Date | null;
  resolutionDueAt?: string | Date | null;
  firstResponseAt?: string | Date | null;
  slaBreachedAt?: string | Date | null;
  status?: string;
}

/**
 * SLA status badge for conversation list and detail sidebar.
 *
 * Shows the most relevant SLA deadline:
 * - If first response hasn't happened yet → show first response countdown
 * - If first response happened but not resolved → show resolution countdown
 * - If breached → show red "SLA Breached"
 *
 * Color coding:
 * - Green: > 25% time remaining
 * - Yellow: < 25% time remaining
 * - Red: breached (past deadline)
 */
export function SlaBadge({
  firstResponseDueAt,
  resolutionDueAt,
  firstResponseAt,
  slaBreachedAt,
  status,
}: Props) {
  const [, setTick] = useState(0);

  // Re-render every 30 seconds to keep countdown fresh
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Conversation is closed — no SLA tracking needed
  if (status === "CLOSED") return null;

  // Already breached
  if (slaBreachedAt) {
    return (
      <Badge variant="destructive" className="text-xs">
        SLA Breached
      </Badge>
    );
  }

  // Determine which deadline to show
  const now = Date.now();
  let dueAt: Date | null = null;
  let label = "";

  if (!firstResponseAt && firstResponseDueAt) {
    dueAt = new Date(firstResponseDueAt);
    label = "Response";
  } else if (resolutionDueAt) {
    dueAt = new Date(resolutionDueAt);
    label = "Resolution";
  }

  if (!dueAt) return null;

  const remaining = dueAt.getTime() - now;
  const isBreached = remaining <= 0;

  if (isBreached) {
    const overdue = formatDuration(Math.abs(remaining));
    return (
      <Badge variant="destructive" className="text-xs">
        {label} overdue {overdue}
      </Badge>
    );
  }

  // Calculate how urgent (what percentage of time has elapsed)
  // We estimate start time as "creation time" but we don't have it here,
  // so we use a heuristic: if < 25% remaining of the deadline, it's urgent
  const totalEstimate = remaining < 15 * 60 * 1000 ? remaining : remaining; // simplified
  const isWarning = remaining < 15 * 60 * 1000; // less than 15 min

  const timeStr = formatDuration(remaining);

  if (isWarning) {
    return (
      <Badge
        variant="outline"
        className="border-amber-800 bg-amber-50 text-xs text-amber-950 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100"
      >
        {label} {timeStr}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-emerald-800 bg-emerald-50 text-xs text-emerald-950 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100"
    >
      {label} {timeStr}
    </Badge>
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
