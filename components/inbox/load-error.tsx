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
        className="flex items-center justify-between gap-2 border-b bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground"
      >
        <span>Can&apos;t reach GudDesk. Showing the last loaded {what}.</span>
        <button type="button" onClick={onRetry} className="font-medium text-foreground underline-offset-2 hover:underline">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <Icons.warning className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium">Couldn&apos;t load {what}</p>
      <p className="text-xs text-muted-foreground">
        Check your connection. We&apos;ll try again when you&apos;re back online.
      </p>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
