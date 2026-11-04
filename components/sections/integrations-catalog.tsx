"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

type IntegrationCategory =
  | "all"
  | "ai-agents"
  | "channels"
  | "crm"
  | "automation"
  | "developer"
  | "analytics";

interface Integration {
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: keyof typeof Icons;
  tier: "free" | "pro";
  status: "available" | "coming-soon";
  href?: string;
}

const categories: { id: IntegrationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai-agents", label: "AI Agents" },
  { id: "channels", label: "Channels" },
  { id: "crm", label: "CRM" },
  { id: "automation", label: "Automation" },
  { id: "developer", label: "Developer" },
  { id: "analytics", label: "Analytics" },
];

const integrations: Integration[] = [
  {
    name: "Bring your own agent",
    description:
      "Install an agent to get a webhook and an API key. It hears about new messages and replies as BOT.",
    category: "ai-agents",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs/agents/overview",
  },
  {
    name: "GudBot",
    description:
      "Reply suggestions and summaries for your team. Optional, and off until you turn it on. GudDesk does not run an always-on agent that answers every conversation.",
    category: "ai-agents",
    icon: "sparkles",
    tier: "pro",
    status: "available",
  },

  {
    name: "Slack",
    description:
      "Save a Slack incoming webhook and pick events. Notifications are not sent yet, and replying from Slack is not supported.",
    category: "channels",
    icon: "messages",
    tier: "pro",
    status: "available",
  },
  {
    name: "Email",
    description:
      "Send agent replies by email from the inbox. Incoming customer email on Cloud is still being set up.",
    category: "channels",
    icon: "mail",
    tier: "free",
    status: "available",
  },
  {
    name: "WhatsApp",
    description:
      "WhatsApp Business is not available yet. Widget chat and the shared inbox work today.",
    category: "channels",
    icon: "phone",
    tier: "pro",
    status: "coming-soon",
  },

  {
    name: "Salesforce",
    description:
      "Salesforce sync is not available yet. Push visitor data through the REST API today.",
    category: "crm",
    icon: "database",
    tier: "pro",
    status: "coming-soon",
  },
  {
    name: "HubSpot",
    description:
      "HubSpot sync is not available yet. Use webhooks or the REST API to send contacts elsewhere.",
    category: "crm",
    icon: "database",
    tier: "pro",
    status: "coming-soon",
  },

  {
    name: "Zapier",
    description:
      "A Zapier app is not available yet. Fire Zaps from GudDesk webhooks in the meantime.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "n8n",
    description:
      "Trigger n8n flows from GudDesk webhooks on new conversations, messages, assignments, and closed threads.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "Make (Integromat)",
    description:
      "A Make app is not available yet. Point a scenario at a GudDesk webhook today.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "Webhooks",
    description:
      "HTTP callbacks on new conversations, new messages, assignments, and closed conversations.",
    category: "automation",
    icon: "webhook",
    tier: "free",
    status: "available",
    href: "/docs",
  },

  {
    name: "REST API",
    description:
      "Conversations, visitors, articles, workspaces, and messages. Build agents and tools in any language.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "Widget SDK",
    description:
      "Embed the chat widget with two lines of JavaScript. Set colors, position, and visitor data from your page.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "JavaScript SDK",
    description:
      "An npm package is not available yet. Call the REST API directly, or load the widget script.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "coming-soon",
  },

  {
    name: "Built-in analytics",
    description:
      "Conversation volume, response times, resolution times, and agent performance, in the dashboard.",
    category: "analytics",
    icon: "analytics",
    tier: "free",
    status: "available",
  },
];

export default function IntegrationsCatalog() {
  const [activeCategory, setActiveCategory] =
    useState<IntegrationCategory>("all");

  const filtered =
    activeCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-heading text-3xl text-balance md:text-4xl lg:text-5xl">
              Connect an agent, webhooks, and the REST API
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
              Install your own bot, send replies by email, and fire webhooks on
              conversation events. Slack, n8n, and more are listed below with
              what actually ships.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ rounded: "xl", size: "lg" }),
                  "gap-2 px-5",
                )}
              >
                Read the API docs
                <Icons.arrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    rounded: "xl",
                    size: "lg",
                  }),
                  "px-5",
                )}
              >
                Create a free workspace
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20">
        <MaxWidthWrapper>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((integration) => {
              const IconComponent =
                Icons[integration.icon as keyof typeof Icons];
              return (
                <div key={integration.name} className="flex flex-col">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {IconComponent ? (
                        <IconComponent className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                      ) : null}
                      <h2 className="font-heading text-base">
                        {integration.name}
                      </h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {integration.status === "coming-soon" ? (
                        <Badge variant="outline" className="text-xs">
                          Soon
                        </Badge>
                      ) : null}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          integration.tier === "free"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {integration.tier === "free" ? "Free" : "Pro"}
                      </Badge>
                    </div>
                  </div>

                  <p className="mb-3 flex-1 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {integration.description}
                  </p>

                  {integration.status === "available" && integration.href ? (
                    <Link
                      href={integration.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-300"
                    >
                      View docs
                      <Icons.arrowRight className="size-3.5" />
                    </Link>
                  ) : integration.status === "available" ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      <Icons.check className="size-3.5" />
                      Included
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20">
        <MaxWidthWrapper className="max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-heading text-2xl text-balance md:text-3xl">
              Build the connector yourself
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-neutral-600 dark:text-neutral-300">
              The REST API, webhooks, and AGPL-3.0 code cover cases that do not
              have a named integration yet.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-heading text-base">REST API</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                Conversations, customers, articles, and more. Build agents in
                any language.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-base">Webhooks</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                HTTP callbacks on new conversations, new messages, assignments,
                and closed conversations.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-base">Open source</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                Fork the repo, add a plugin, or self-host with your own
                connectors. AGPL-3.0 licensed.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "gap-2 px-5",
              )}
            >
              Read the API docs
              <Icons.arrowRight className="size-4" />
            </Link>
            <Link
              href="https://github.com/gudlab/guddesk-core"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "gap-2 px-5",
              )}
            >
              <Icons.gitHub className="size-4" />
              View on GitHub
            </Link>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
