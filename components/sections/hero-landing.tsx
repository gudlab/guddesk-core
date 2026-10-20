import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

export default function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 text-center md:px-8 lg:max-w-4xl xl:max-w-5xl">
        <Link
          href={siteConfig.links.github}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
            "px-4",
          )}
          target="_blank"
        >
          <Icons.code className="mr-2 size-3.5" />
          Open Source &amp; Free Forever
        </Link>

        <h1 className="text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15] lg:text-7xl lg:leading-[1.1]">
          The open-source{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 bg-clip-text text-transparent">
            Intercom alternative
          </span>
        </h1>

        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg lg:text-xl">
          Live chat, a shared inbox, a knowledge base and automations in one
          platform. Plug in your own AI bot through the agent API. Free for
          small teams. Self-hostable.
        </p>

        <div className="flex justify-center space-x-2">
          <Link
            href="/register"
            prefetch={true}
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2 px-5 text-[15px]",
            )}
          >
            <span>Get Started Free</span>
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
              "px-4 text-[15px]",
            )}
          >
            <Icons.gitHub className="mr-2 size-4" />
            <p>
              <span className="hidden sm:inline-block">Star on</span> GitHub
            </p>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Free forever for small teams &middot; No credit card required &middot;
          AGPL-3.0 licensed
        </p>
      </div>
    </section>
  );
}
