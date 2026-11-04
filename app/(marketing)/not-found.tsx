import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center py-20 sm:py-28 lg:py-36">
      <div className="mx-auto flex w-full max-w-screen-md flex-col items-center gap-6 px-4 text-center md:px-8">
        <h1 className="font-satoshi text-8xl font-black tracking-tight text-neutral-900 sm:text-9xl dark:text-neutral-100">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="font-heading text-xl sm:text-2xl">Page not found</h2>
          <p className="max-w-md text-pretty text-neutral-600 dark:text-neutral-300">
            This URL is not a GudDesk page. Open the home page, or create a free
            workspace.
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
            href="/register"
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "gap-2 px-5",
            )}
          >
            <span>Create a free workspace</span>
            <Icons.arrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
