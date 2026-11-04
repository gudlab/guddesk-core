import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const capabilities = [
  {
    icon: Icons.messageCircle,
    title: "Live chat on your site",
    desc: "Replies show up in the open widget within seconds, instead of bouncing through a ticket email.",
  },
  {
    icon: Icons.inbox,
    title: "One inbox for the team",
    desc: "Assign, tag, snooze, and leave internal notes. Bot replies sit in the same thread as humans.",
  },
  {
    icon: Icons.sparkles,
    title: "Optional bot through the API",
    desc: "Connect your own agent if you want one answering first. GudBot stays off until you turn it on.",
  },
  {
    icon: Icons.automations,
    title: "Automation rules (saved, not running)",
    desc: "Set a trigger and an action to assign, tag, change status, send a message, or notify Slack. GudDesk stores the rule today and does not run it yet.",
  },
];

export default function HeroSupport() {
  return (
    <section className="border-t py-20 sm:py-28 lg:py-32">
      <MaxWidthWrapper>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-satoshi text-3xl font-black tracking-tight text-balance sm:text-4xl md:text-5xl md:leading-[1.15]">
            Replies appear in the widget. The same thread is in your inbox.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            GudDesk puts live chat and a shared inbox in one app. Bring your own
            bot if you want one answering first.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10">
          {capabilities.map((cap) => (
            <div key={cap.title}>
              <div className="flex items-start gap-3">
                <cap.icon className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                <div>
                  <h3 className="font-heading text-lg">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {cap.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-3 border-b bg-emerald-800 px-5 py-3">
              <span className="text-sm font-medium text-white">GudDesk Chat</span>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-emerald-800 px-4 py-2.5 text-sm text-white">
                  Hi, I can&apos;t reset my password. Help?
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <Icons.messageCircle className="size-3.5 text-emerald-800 dark:text-emerald-300" />
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                    Sent as BOT through the API
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-neutral-100 px-4 py-2.5 text-sm dark:bg-neutral-800">
                    I can send a reset link to the address on the account. A
                    teammate will follow up if you still can&apos;t get in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-3">
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
            href="#agents"
            className={cn(
              buttonVariants({
                variant: "outline",
                rounded: "xl",
                size: "lg",
              }),
              "px-4",
            )}
          >
            How the agent API works
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
