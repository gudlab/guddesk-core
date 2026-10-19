import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

const stats = [
  { value: "$29", label: "Pro per month, any team size" },
  { value: "$0", label: "Per AI resolution" },
];

const capabilities = [
  {
    icon: Icons.sparkles,
    title: "Built for AI agents",
    description:
      "Your own AI agent can read conversations and reply as BOT through the REST API, or connect through the GudDesk MCP server.",
  },
  {
    icon: Icons.messageCircle,
    title: "Shared Inbox & Live Chat",
    description:
      "One inbox for chat and email. Assign conversations, tag them, snooze them and leave internal notes. Bot replies show up in the same thread as your team's.",
  },
  {
    icon: Icons.code,
    title: "Open source and self-hostable",
    description:
      "AGPL-3.0 licensed. Run it on your own Postgres with no caps. On GudDesk Cloud, the Free plan covers 2 members and 500 conversations a month.",
  },
];

export default function HeroAgents() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-500/[0.07] to-teal-400/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        {/* Top section */}
        <div className="mx-auto max-w-3xl text-center lg:max-w-4xl xl:max-w-5xl">
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

          <h1 className="font-satoshi mt-6 text-[40px] leading-[1.1] font-black tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.1] lg:text-7xl lg:leading-[1.08]">
            Customer support infrastructure for the{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 bg-clip-text text-transparent">
              agentic AI era
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-balance lg:max-w-3xl lg:text-xl">
            Most support tools weren't built for AI agents. GudDesk was. It's
            the open-source platform where your AI and human team share context,
            collaborate on tickets, and close issues faster — together.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </div>

        {/* Stats bar */}
        <div className="bg-card mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-6 rounded-2xl border p-6 shadow-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-satoshi text-2xl font-black text-emerald-600 sm:text-3xl dark:text-emerald-400">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-1 text-xs sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Capability cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="bg-card rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <cap.icon className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-heading mt-4 text-base">{cap.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>

        {/* Inline demo conversation */}
        <div className="mx-auto mt-16 max-w-lg">
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b bg-emerald-600 px-5 py-3.5 dark:bg-emerald-700">
              <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
                <Icons.sparkles className="size-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Your AI agent</div>
                <div className="text-xs text-white/70">
                  Example bot connected via the agent API
                </div>
              </div>
              <div className="ml-auto flex size-2 items-center">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 px-5 py-5">
              {/* Customer */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-2.5 text-sm text-white dark:bg-emerald-700">
                  I can&apos;t reset my password. The email never arrives.
                </div>
              </div>

              {/* Bot */}
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Icons.sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="bg-muted max-w-[75%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm">
                  I&apos;ve triggered a new password reset email to your
                  address. It should arrive within 60 seconds — check your spam
                  folder too. Let me know if it doesn&apos;t come through!
                </div>
              </div>

              {/* Customer */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-2.5 text-sm text-white dark:bg-emerald-700">
                  Got it, thanks! That was fast.
                </div>
              </div>

              {/* Resolution badge */}
              <div className="flex justify-center">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Icons.check className="size-3" />
                  Sent as BOT through the GudDesk API
                </div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            No per-resolution fees &middot; Free plan available
          </p>
        </div>
      </div>
    </section>
  );
}
