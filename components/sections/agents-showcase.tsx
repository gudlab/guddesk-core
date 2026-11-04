import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const pluginCapabilities = [
  {
    icon: Icons.messageCircle,
    title: "Conversational",
    desc: "Agents read messages and reply as BOT. Visitors see those replies in the widget like any other message.",
  },
  {
    icon: Icons.automations,
    title: "Event-driven",
    desc: "Webhooks fire on new conversations, new messages, assignments, and closed conversations.",
  },
  {
    icon: Icons.code,
    title: "REST API and MCP",
    desc: "Cover conversations, customers, articles, companies, segments, and workspaces. Build an agent in any language.",
  },
  {
    icon: Icons.sparkles,
    title: "Bring your own model",
    desc: "GudBot can suggest replies. It stays off until you turn it on. Your own agent can reply as BOT today.",
  },
];

export default function AgentsShowcase() {
  return (
    <section id="agents" className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center text-center">
          <h2 className="font-heading text-3xl text-balance md:text-4xl lg:text-[40px]">
            Plug in your own bot if you want one
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            GudBot is optional and off by default. If you connect an agent, it
            gets conversation events by webhook and replies as BOT through the
            API or the MCP server.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Event
            </p>
            <p className="mt-1 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
              Message received
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Your agent
            </p>
            <p className="mt-1 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
              Decides what to do
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Action
            </p>
            <p className="mt-1 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
              Reply as BOT via API
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <h3 className="font-heading text-lg">Bring your own agent</h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
            Install an agent to get a webhook and an API key. It hears about new
            messages and replies as BOT. GudBot is optional and off by default.
          </p>
          <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
            Webhooks · REST API + MCP
          </p>
        </div>

        <div className="mt-14">
          <h3 className="font-heading mb-8 text-center text-xl">
            Build your own or plug in existing agents
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pluginCapabilities.map((cap) => (
              <div key={cap.title}>
                <div className="flex items-start gap-2.5">
                  <cap.icon className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                  <div>
                    <h3 className="font-heading text-base">{cap.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-3">
          <Link
            href="/docs"
            className={cn(
              buttonVariants({ rounded: "xl", size: "lg" }),
              "gap-2",
            )}
          >
            Agent API docs
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "outline", rounded: "xl", size: "lg" }),
            )}
          >
            Create a free workspace
          </Link>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
