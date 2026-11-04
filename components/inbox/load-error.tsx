"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface LoadErrorProps {
  /** What failed to load, for example "conversations". */
  what: string;
  onRetry: () => void;
  /** A slim bar above content that is still shown, instead of a full panel. */
  compact?: boolean;
}

/** Shown in place of (or above) inbox content that couldn't be loaded. */
export function LoadError({ what, onRetry, compact = false }: LoadErrorProps) {
  if (compact) {
    return (
      <div
        role="status"
        className="bg-muted/60 flex items-center justify-between gap-2 border-b px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300"
      >
        <span>Can&apos;t reach GudDesk. Showing the last loaded {what}.</span>
        <button
          type="button"
          onClick={onRetry}
          className="text-foreground font-medium underline-offset-2 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 p-8 text-center"
    >
      <Icons.warning className="size-6 text-neutral-600 dark:text-neutral-300" />
      <p className="text-sm font-medium">Couldn&apos;t load {what}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Check your connection. We&apos;ll try again when you&apos;re back
        online.
      </p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
