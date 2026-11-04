import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <Link href="/" className="mb-2">
          <Icons.logo className="size-12" />
          <span className="sr-only">GudDesk home</span>
        </Link>
        <h1 className="font-satoshi text-8xl font-black tracking-tight text-neutral-900 sm:text-9xl dark:text-neutral-100">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="font-heading text-xl sm:text-2xl">Page not found</h2>
          <p className="max-w-md text-pretty text-neutral-600 dark:text-neutral-300">
            This URL is not a GudDesk page. Open the home page or go to the
            dashboard if you already have an account.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2 px-5",
            )}
          >
            <Icons.home className="size-4" />
            <span>Back to home</span>
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "gap-2 px-5",
            )}
          >
            <Icons.dashboard className="size-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
