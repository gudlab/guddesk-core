import { Metadata } from "next";

import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { withCanonical } from "@/lib/canonical";

export const metadata: Metadata = withCanonical({
  title: "Pricing | GudDesk",
  description:
    "GudDesk Pro is $29 a month flat for any team size. No per-seat or per-resolution fees. Free plan for 2 members.",
}, "/pricing");

const freeHighlights = [
  {
    icon: Icons.messageCircle,
    title: "Live chat widget",
    desc: "Embed on any site with two lines of JavaScript. Customize colors, position, and the welcome message.",
  },
  {
    icon: Icons.inbox,
    title: "Shared workspace inbox",
    desc: "All conversations in one place. Assign, tag, snooze, and add internal notes.",
  },
  {
    icon: Icons.sparkles,
    title: "Agent API",
    desc: "Connect your own bot. It receives conversation webhooks and replies as BOT through the API. GudBot stays off until you turn it on.",
  },
  {
    icon: Icons.bookOpen,
    title: "Knowledge base",
    desc: "Publish help articles in collections. Public help center with search, branding, and article feedback.",
  },
  {
    icon: Icons.code,
    title: "SDK and REST API",
    desc: "REST API and an MCP server for conversations, customers, articles, and more. Build agents in any language.",
  },
  {
    icon: Icons.automations,
    title: "Webhooks and automation rules",
    desc: "Webhooks fire on conversation events. A rule builder saves automation rules, which do not run yet.",
  },
];

const freeIncludes = [
  "Up to 2 workspace members",
  "500 conversations / month",
  "AI agent plugin support",
  "REST API and webhooks",
  "Unlimited knowledge base articles",
  "Widget customization",
  "SLA policies",
  "Self-hosting support",
  "Community support",
  "BOT message type",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited workspace members",
  "Unlimited conversations",
  "GudBot reply suggestions and summaries (optional, default off)",
  "Advanced agent analytics",
  "Remove GudDesk branding",
  "Priority email support",
  "GudBot (optional, default off)",
];

function Check() {
  return (
    <Icons.check className="mx-auto size-4 text-emerald-800 dark:text-emerald-300" />
  );
}

function Cross() {
  return (
    <Icons.close className="mx-auto size-4 text-neutral-400" />
  );
}

const comparisonRows = [
  {
    feature: "Starting price",
    intercomStarter: "$29/seat/mo",
    intercom: "$85/seat/mo",
    guddeskFree: "$0",
    guddeskPro: "$29/mo flat",
  },
  {
    feature: "Per-seat pricing",
    intercomStarter: "yes",
    intercom: "yes",
    guddeskFree: "no",
    guddeskPro: "no",
  },
  {
    feature: "Live chat",
    intercomStarter: "check",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Shared inbox",
    intercomStarter: "check",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Knowledge base",
    intercomStarter: "check",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "AI agent pricing",
    intercomStarter: "$0.99 per Fin outcome",
    intercom: "$0.99 per Fin outcome",
    guddeskFree: "No AI included",
    guddeskPro: "No per-resolution fee",
  },
  {
    feature: "Built-in autonomous AI agent",
    intercomStarter: "check",
    intercom: "check",
    guddeskFree: "Optional (default off)",
    guddeskPro: "Optional (default off)",
  },
  {
    feature: "Automations",
    intercomStarter: "Advanced plan",
    intercom: "check",
    guddeskFree: "Not running yet",
    guddeskPro: "Not running yet",
  },
  {
    feature: "Self-hostable",
    intercomStarter: "cross",
    intercom: "cross",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Agent API (reply as BOT)",
    intercomStarter: "Not compared",
    intercom: "Not compared",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Open source",
    intercomStarter: "cross",
    intercom: "cross",
    guddeskFree: "check",
    guddeskPro: "check",
  },
];

function CellValue({ value }: { value: string }) {
  if (value === "check") return <Check />;
  if (value === "cross") return <Cross />;
  if (value === "yes")
    return <span className="text-sm text-neutral-600 dark:text-neutral-300">Yes</span>;
  if (value === "no")
    return (
      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
        No
      </span>
    );
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="font-heading text-3xl text-balance md:text-4xl lg:text-5xl">
              Free has no time limit. It is the plan.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
              Free covers 2 members and 500 conversations a month. You get live
              chat, the shared inbox, the help center, webhooks, and full API
              access for $0. Pro is $29 a month flat.
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-sm flex-col items-center p-8">
            <h2 className="font-heading text-lg">Free</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-5xl font-black">$0</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                /month forever
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              2 members and 500 conversations a month. No credit card.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "mt-6 w-full gap-2",
              )}
            >
              Create a free workspace
              <Icons.arrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-16">
            <h2 className="text-center font-heading text-xl">
              Included on Free
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {freeHighlights.map((item) => (
                <div key={item.title}>
                  <div className="flex items-start gap-2.5">
                    <item.icon className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                    <div>
                      <h3 className="font-heading text-base">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <h2 className="mb-4 text-center font-heading text-base">
              Free plan checklist
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {freeIncludes.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Icons.check className="size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3">
            <div>
              <h3 className="mb-2 font-heading text-base">Widget SDK</h3>
              <p className="mb-4 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                Two lines of code. Drop the GudDesk widget into any site.
                Colors, position, and welcome message are yours to set.
              </p>
              <div className="overflow-x-auto rounded-md bg-neutral-950 p-3">
                <code className="block whitespace-pre-wrap break-all text-[13px] leading-relaxed text-neutral-200">
                  {`<script>window.GudDeskSettings={appId:"gd_pub_…"}</script>
<script src="https://cdn.guddesk.com/widget.js" async></script>`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-heading text-base">REST API</h3>
              <p className="mb-4 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                Conversations, visitors, articles, and workspace settings. Build
                agents and integrations in any language.
              </p>
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
                  "gap-2",
                )}
              >
                API docs
                <Icons.arrowRight className="size-3" />
              </Link>
            </div>
            <div>
              <h3 className="mb-2 font-heading text-base">Agent plugins</h3>
              <p className="mb-4 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                Connect agents that listen to events, process messages, and
                reply as BOT. GudBot stays off until you turn it on.
              </p>
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
                  "gap-2",
                )}
              >
                Agent docs
                <Icons.arrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <div className="border-t" />

      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-heading text-3xl text-balance md:text-4xl">
              Upgrade when you need unlimited seats
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
              Pro is $29 a month flat. It lifts the member and conversation
              limits. No plan charges per seat.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-md border-2 border-primary p-8">
            <Badge className="mb-3">Popular</Badge>
            <h3 className="font-heading text-lg">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-5xl font-black">$29</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                /month flat
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Unlimited seats. No per-user fees.
            </p>
            <ul className="mt-6 space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "mt-6 w-full",
              )}
            >
              Create a Pro workspace
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-1 font-heading text-base">GudBot</h3>
              <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                GudBot can suggest replies and summaries. It stays off until you
                turn it on.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-heading text-base">Unlimited seats</h3>
              <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                Add the whole workspace. $29 covers every seat.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-heading text-base">Branding and support</h3>
              <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                Remove GudDesk branding and get priority email support on Pro.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <h2 className="mb-6 text-center font-heading text-2xl">
              How GudDesk compares to Intercom
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px] text-neutral-800 dark:text-neutral-200">
                      Feature
                    </TableHead>
                    <TableHead className="text-center text-neutral-800 dark:text-neutral-200">
                      Intercom Essential
                    </TableHead>
                    <TableHead className="text-center text-neutral-800 dark:text-neutral-200">
                      Intercom Advanced
                    </TableHead>
                    <TableHead className="text-center font-semibold text-neutral-800 dark:text-neutral-200">
                      GudDesk Free
                    </TableHead>
                    <TableHead className="text-center font-semibold text-neutral-800 dark:text-neutral-200">
                      GudDesk Pro
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium">
                        {row.feature}
                      </TableCell>
                      <TableCell className="text-center">
                        <CellValue value={row.intercomStarter} />
                      </TableCell>
                      <TableCell className="text-center">
                        <CellValue value={row.intercom} />
                      </TableCell>
                      <TableCell className="text-center">
                        <CellValue value={row.guddeskFree} />
                      </TableCell>
                      <TableCell className="text-center">
                        <CellValue value={row.guddeskPro} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-center text-sm text-neutral-600 dark:text-neutral-300">
              Intercom list prices billed annually, from intercom.com/pricing,
              checked 13 Oct 2026.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              GudDesk is open source under AGPL-3.0.{" "}
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                View on GitHub
              </Link>{" "}
              · Self-host on your own infrastructure for free.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
