import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export function MarketingPageCta({
  title,
  description,
  secondaryHref = "/pricing",
  secondaryLabel = "Compare plans",
}: {
  title: string;
  description: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-t bg-neutral-50 py-16 sm:py-20 lg:py-24 dark:bg-neutral-900">
      <MaxWidthWrapper className="flex flex-col items-center text-center">
        <h2 className="font-heading text-3xl text-balance md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-lg text-pretty text-lg text-neutral-600 dark:text-neutral-300">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2 px-5",
            )}
          >
            Create a free workspace
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            href={secondaryHref}
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "px-5",
            )}
          >
            {secondaryLabel}
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
