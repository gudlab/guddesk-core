import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 text-center md:px-8 lg:max-w-4xl">
        <Link
          href={siteConfig.links.github}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
            "px-4",
          )}
          target="_blank"
        >
          <Icons.code className="mr-2 size-3.5" />
          Open source. AGPL-3.0.
        </Link>

        <h1 className="font-satoshi text-4xl font-black leading-[1.15] tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.12]">
          The open-source Intercom alternative
        </h1>

        <p className="max-w-2xl text-pretty text-neutral-600 sm:text-lg lg:text-xl dark:text-neutral-300">
          Live chat, a shared inbox, and a public help center on every plan.
          Connect your own bot through the agent API if you want one. GudBot
          stays off until you turn it on. Host it yourself, or use Cloud at $0
          or $29.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2 px-5",
            )}
          >
            <span>Create a free workspace</span>
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "px-4",
            )}
          >
            <Icons.gitHub className="mr-2 size-4" />
            <span>
              <span className="hidden sm:inline">Star on </span>GitHub
            </span>
          </Link>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Free for 2 members and 500 conversations a month. No credit card.
        </p>
      </div>
    </section>
  );
}
