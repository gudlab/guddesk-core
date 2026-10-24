import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const capabilities = [
  {
    icon: Icons.messageCircle,
    title: "Live chat on your site",
    desc: "Replies reach the open widget in real time when you add Pusher keys, and within seconds without them.",
  },
  {
    icon: Icons.sparkles,
    title: "AI help for your team (planned)",
    desc: "AI reply suggestions and summaries: planned. Today, connect your own bot through the agent API.",
  },
  {
    icon: Icons.inbox,
    title: "Unified inbox for every channel",
    desc: "Chat and email in one view, with bot replies in the same thread.",
  },
  {
    icon: Icons.automations,
    title: "Automation rules",
    desc: "Set rules for new conversations, new messages, closed conversations and unassigned ones, with an action to assign, tag, change status, send a message or notify Slack. Each rule runs when its trigger fires.",
  },
];

export default function HeroSupport() {
  return (
    <section className="relative overflow-hidden border-t py-20 sm:py-28 lg:py-32">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/20" />

      <MaxWidthWrapper className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-gradient_brand mb-4 font-semibold">
            Support for the agent era
          </div>
          <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl md:text-5xl md:leading-[1.15]">
            Your customers don&apos;t want to wait.{" "}
            <span className="text-muted-foreground">
              Neither should your team.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            GudDesk puts live chat and a shared inbox in one app. Bring your own
            AI agent if you want one answering first. AI reply suggestions for
            your team are planned.
          </p>
        </div>

        {/* Capability grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <cap.icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-heading text-base">{cap.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Inline conversation demo */}
        <div className="mx-auto mt-16 max-w-lg">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b bg-emerald-500 px-5 py-3">
              <div className="size-2 rounded-full bg-white/60" />
              <span className="text-sm font-medium text-white">
                GudDesk Chat
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-3 p-5">
              {/* Visitor message */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-500 px-4 py-2.5 text-sm text-white">
                  Hi, I can&apos;t reset my password. Help?
                </div>
              </div>

              {/* Bot reply */}
              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Icons.sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Sent as BOT through the API
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm">
                    This article should help:{" "}
                    <span className="font-medium text-emerald-600 underline dark:text-emerald-400">
                      Password Reset Guide
                    </span>
                    . A teammate will follow up if it doesn&apos;t.
                  </div>
                </div>
              </div>

              {/* Resolution */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <Icons.check className="size-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Sent as BOT through the API
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center gap-3">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2 px-5 text-[15px]",
            )}
          >
            Start Resolving Faster
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            href="#agents"
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "px-4 text-[15px]",
            )}
          >
            See How Agents Work
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
