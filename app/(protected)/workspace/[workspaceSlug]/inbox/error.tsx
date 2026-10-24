"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { onBackOnline } from "@/lib/network";

/**
 * The inbox's error boundary. Anything the inbox didn't handle itself (for
 * example the page failing to load while offline) lands here instead of
 * the app-wide error page, and the inbox reloads once the connection is
 * back.
 */
export default function InboxError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  useEffect(() => onBackOnline(retry));

  return (
    <div role="alert" className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
      <Icons.warning className="size-8 text-muted-foreground" />
      <h2 className="text-base font-semibold">The inbox couldn&apos;t load</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        GudDesk can&apos;t be reached right now. Check your connection. The inbox reloads by itself when you&apos;re back
        online.
      </p>
      <Button type="button" variant="outline" onClick={retry} disabled={isPending}>
        {isPending ? <Icons.spinner className="mr-2 size-4 animate-spin" /> : null}
        Try again
      </Button>
    </div>
  );
}
