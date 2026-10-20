"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

/* ─── Types ──────────────────────────────────────────── */

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

/* ─── Data ───────────────────────────────────────────── */

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
  // AI Agents
  {
    name: "Custom Agents",
    description:
      "Connect your own bot with a webhook and an API key. It hears about new messages and replies as BOT in the widget and inbox.",
    category: "ai-agents",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs/agents/custom-agents",
  },
  {
    name: "AI assist",
    description:
      "Reply suggestions and summaries for your team. Planned, shipping with GudBot v1.",
    category: "ai-agents",
    icon: "sparkles",
    tier: "pro",
    status: "coming-soon",
  },
  {
    name: "GudDesk AI agent",
    description:
      "A first-party agent that answers from your help center. Not shipped yet. Use the agent API until it is.",
    category: "ai-agents",
    icon: "bot",
    tier: "pro",
    status: "coming-soon",
  },

  // Channels
  {
    name: "Slack",
    description:
      "Get conversation notifications in Slack. Reply to customers from Slack threads without leaving your workspace.",
    category: "channels",
    icon: "messages",
    tier: "pro",
    status: "available",
  },
  {
    name: "Email",
    description:
      "Forward support emails into GudDesk. Conversations appear in the shared inbox with full threading.",
    category: "channels",
    icon: "mail",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "WhatsApp",
    description:
      "Connect your WhatsApp Business account. Manage conversations from the same inbox as live chat.",
    category: "channels",
    icon: "phone",
    tier: "pro",
    status: "coming-soon",
  },
  {
    name: "Telegram",
    description:
      "Receive and respond to Telegram messages directly in GudDesk. Full conversation history synced.",
    category: "channels",
    icon: "send",
    tier: "pro",
    status: "coming-soon",
  },

  // CRM
  {
    name: "Salesforce",
    description:
      "Sync visitor profiles and conversation data to Salesforce. Auto-create leads from live chat conversations.",
    category: "crm",
    icon: "database",
    tier: "pro",
    status: "coming-soon",
  },
  {
    name: "HubSpot",
    description:
      "Push contacts and conversation activity to HubSpot CRM. Map custom fields and trigger workflows.",
    category: "crm",
    icon: "database",
    tier: "pro",
    status: "coming-soon",
  },
  {
    name: "Pipedrive",
    description:
      "Create deals from conversations. Sync contact data and conversation history to Pipedrive.",
    category: "crm",
    icon: "database",
    tier: "pro",
    status: "coming-soon",
  },

  // Automation
  {
    name: "Zapier",
    description:
      "Connect GudDesk to 6,000+ apps. Trigger Zaps on new conversations, messages, or tags.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "n8n",
    description:
      "Self-hosted workflow automation. Trigger complex flows from GudDesk events via webhooks.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "Make (Integromat)",
    description:
      "Visual automation platform. Build scenarios that react to GudDesk events and sync data across tools.",
    category: "automation",
    icon: "automations",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "Webhooks",
    description:
      "Send HTTP callbacks on conversation events: message received, conversation created, tag added, and more.",
    category: "automation",
    icon: "webhook",
    tier: "free",
    status: "available",
    href: "/docs",
  },

  // Developer
  {
    name: "REST API",
    description:
      "Full API for conversations, visitors, articles, workspaces, and messages. Build anything on top of GudDesk.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "Widget SDK",
    description:
      "Embed the chat widget with two lines of JavaScript. Customize appearance, behavior, and visitor data programmatically.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "available",
    href: "/docs",
  },
  {
    name: "JavaScript SDK",
    description:
      "Client library for browser and Node.js. Type-safe methods for all API endpoints with built-in auth.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "CLI Tool",
    description:
      "Manage conversations, deploy agents, and configure settings from the command line.",
    category: "developer",
    icon: "code",
    tier: "free",
    status: "coming-soon",
  },

  // Analytics
  {
    name: "Built-in Analytics",
    description:
      "Conversation volume, response times, resolution times, agent performance, and CSAT scores, all built in.",
    category: "analytics",
    icon: "analytics",
    tier: "free",
    status: "available",
  },
  {
    name: "Google Analytics",
    description:
      "Track widget interactions as events in GA4. Measure conversation starts, article views, and CSAT submissions.",
    category: "analytics",
    icon: "lineChart",
    tier: "free",
    status: "coming-soon",
  },
  {
    name: "PostHog",
    description:
      "Send GudDesk events to PostHog for product analytics. Correlate support conversations with user behavior.",
    category: "analytics",
    icon: "lineChart",
    tier: "free",
    status: "coming-soon",
  },
];

/* ─── Stat counters ──────────────────────────────────── */

const stats = [
  { label: "Integrations", value: integrations.length.toString() + "+" },
  {
    label: "Available now",
    value: integrations
      .filter((i) => i.status === "available")
      .length.toString(),
  },
  {
    label: "Free tier",
    value: integrations.filter((i) => i.tier === "free").length.toString(),
  },
  { label: "Categories", value: (categories.length - 1).toString() },
];

/* ─── Component ──────────────────────────────────────── */

export default function IntegrationsCatalog() {
  const [activeCategory, setActiveCategory] =
    useState<IntegrationCategory>("all");

  const filtered =
    activeCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="text-gradient_brand mb-4 font-semibold">
              Integrations
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl">
              Connect everything.{" "}
              <span className="text-muted-foreground">Build anything.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Plug in AI agents, connect your favorite tools, or build custom
              integrations with the REST API and webhooks. GudDesk plays nice
              with your entire stack.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ rounded: "xl", size: "lg" }),
                  "gap-2",
                )}
              >
                View API Docs
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
                )}
              >
                Try It Free
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-satoshi text-3xl font-black">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* ── Catalog ───────────────────────────────────── */}
      <section className="border-t py-16 sm:py-20">
        <MaxWidthWrapper>
          {/* Category filter */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((integration) => {
              const IconComponent =
                Icons[integration.icon as keyof typeof Icons];
              return (
                <div
                  key={integration.name}
                  className="group relative flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          integration.category === "ai-agents"
                            ? "bg-emerald-100 dark:bg-emerald-900/40"
                            : integration.category === "channels"
                              ? "bg-blue-100 dark:bg-blue-900/40"
                              : integration.category === "crm"
                                ? "bg-purple-100 dark:bg-purple-900/40"
                                : integration.category === "automation"
                                  ? "bg-amber-100 dark:bg-amber-900/40"
                                  : integration.category === "developer"
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-teal-100 dark:bg-teal-900/40",
                        )}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={cn(
                              "size-5",
                              integration.category === "ai-agents"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : integration.category === "channels"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : integration.category === "crm"
                                    ? "text-purple-600 dark:text-purple-400"
                                    : integration.category === "automation"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : integration.category === "developer"
                                        ? "text-gray-600 dark:text-gray-400"
                                        : "text-teal-600 dark:text-teal-400",
                            )}
                          />
                        )}
                      </div>
                      <h3 className="font-heading text-base">
                        {integration.name}
                      </h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {integration.status === "coming-soon" ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Soon
                        </Badge>
                      ) : null}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          integration.tier === "free"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {integration.tier === "free" ? "Free" : "Pro"}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {integration.description}
                  </p>

                  {/* Footer */}
                  {integration.status === "available" && integration.href ? (
                    <Link
                      href={integration.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View docs
                      <Icons.arrowRight className="size-3" />
                    </Link>
                  ) : integration.status === "available" ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
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

      {/* ── Build Your Own ────────────────────────────── */}
      <section className="border-t py-16 sm:py-20">
        <MaxWidthWrapper className="max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-heading text-2xl md:text-3xl">
              Don&apos;t see what you need?
            </h2>
            <p className="mt-4 max-w-xl text-balance text-muted-foreground">
              GudDesk is API-first and fully open source. Build custom
              integrations, contribute to the project, or fork and extend
              anything.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.code className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">REST API</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Full API for conversations, visitors, articles, and messages.
                Build agents and integrations in any language.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.webhook className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">Webhooks</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                HTTP callbacks on every conversation event. Message
                received, created, tagged, resolved.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.gitHub className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">Open Source</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Fork the repo, contribute plugins, or self-host with your own
                custom integrations. AGPL-3.0 licensed.
              </p>
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
              Read the API Docs
              <Icons.arrowRight className="size-4" />
            </Link>
            <Link
              href="https://github.com/guddesk/guddesk"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "gap-2",
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
