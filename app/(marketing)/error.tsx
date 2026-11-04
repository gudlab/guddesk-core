"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-heading text-2xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-pretty text-neutral-600 dark:text-neutral-300">
        Reload this page. If it keeps failing, open the home page and try
        again.
      </p>
      <Button
        type="button"
        variant="default"
        className="mt-6"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
