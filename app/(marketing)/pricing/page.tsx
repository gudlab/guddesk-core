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

export const metadata: Metadata = {
  title: "Pricing – GudDesk",
  description:
    "GudDesk Pro is $29 a month flat for any team size. No per-seat or per-resolution fees. Free plan for 2 members.",
};

/* ─── Data ───────────────────────────────────────────── */

const freeHighlights = [
  {
    icon: Icons.messageCircle,
    title: "Live Chat Widget",
    desc: "Embed on any site with two lines of JavaScript. Fully customizable colors, position, and welcome message.",
  },
  {
    icon: Icons.inbox,
    title: "Shared Workspace Inbox",
    desc: "All conversations in one place. Assign, tag, snooze, and add internal notes with real-time updates.",
  },
  {
    icon: Icons.sparkles,
    title: "AI agent API",
    desc: "Connect your own AI agent. It receives conversation webhooks and replies as BOT through the API.",
  },
  {
    icon: Icons.bookOpen,
    title: "Knowledge Base",
    desc: "Publish help articles in collections. Public help center with search, branding, and article feedback.",
  },
  {
    icon: Icons.code,
    title: "SDK & REST API",
    desc: "REST API and an MCP server for conversations, customers, articles and more. Build agents and integrations in any language.",
  },
  {
    icon: Icons.automations,
    title: "Automations & Webhooks",
    desc: "Event-driven rules that auto-assign, tag, route, and notify. Hook into conversation lifecycle events.",
  },
];

const freeIncludes = [
  "Up to 2 workspace members",
  "500 conversations / month",
  "AI agent plugin support",
  "REST API & webhooks",
  "Unlimited knowledge base articles",
  "Widget customization",
  "Basic automations",
  "Self-hosting support",
  "Community support",
  "BOT message type",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited workspace members",
  "Unlimited conversations",
  "Claude article suggestions",
  "AI reply suggestions & summaries",
  "Auto-categorization & sentiment",
  "Advanced agent analytics",
  "Remove GudDesk branding",
  "Slack integration",
  "Priority email support",
];

const businessFeatures = [
  "Everything in Pro",
  "About $99/mo flat, no per-seat pricing",
  "Priority email support",
  "Higher-volume hosted workspaces",
  "Business hours & SLA tooling",
];

function Check() {
  return (
    <Icons.check className="mx-auto size-4 text-green-600 dark:text-green-400" />
  );
}

function Cross() {
  return (
    <Icons.close className="mx-auto size-4 text-muted-foreground/40" />
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
    guddeskFree: "Roadmap",
    guddeskPro: "Roadmap",
  },
  {
    feature: "Automations",
    intercomStarter: "Advanced plan",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
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
    return <span className="text-sm text-muted-foreground">Yes</span>;
  if (value === "no")
    return (
      <span className="text-sm font-medium text-green-600 dark:text-green-400">
        No
      </span>
    );
  return <span className="text-sm">{value}</span>;
}

/* ─── Page ───────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <>
      {/* ── Section 1: Free plan hero ──────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="text-gradient_brand mb-4 font-semibold">
              Pricing
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl">
              Free is not a trial.{" "}
              <span className="text-muted-foreground">It&apos;s the plan.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Most workspaces never need to pay. Get live chat, shared inbox,
              knowledge base, automations, SDK, and full API access — all for
              $0, forever.
            </p>
          </div>

          {/* Free price badge */}
          <div className="mx-auto mt-10 flex max-w-sm flex-col items-center rounded-2xl border bg-card p-8 shadow-sm">
            <h2 className="font-heading text-lg">Free Plan</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-5xl font-black">$0</span>
              <span className="text-sm text-muted-foreground">
                /month forever
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              No credit card required
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "mt-6 w-full gap-2",
              )}
            >
              Get Started Free
              <Icons.arrowRight className="size-4" />
            </Link>
          </div>

          {/* What's included grid */}
          <div className="mt-16">
            <h3 className="text-center font-heading text-xl">
              Everything you need, included free
            </h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeHighlights.map((item) => (
                <div key={item.title} className="rounded-lg border bg-card p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <item.icon className="size-4 text-foreground" />
                    </div>
                    <h4 className="font-heading text-sm">{item.title}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Full free checklist */}
          <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-muted/20 p-6">
            <h4 className="mb-4 text-center font-heading text-base">
              Free plan includes
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {freeIncludes.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Icons.check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* SDK / API / Agent callout */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <h4 className="mb-2 font-heading text-base">Widget SDK</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Two lines of code. Drop the GudDesk widget into any site.
                Customize colors, position, and behavior.
              </p>
              <div className="rounded-md bg-gray-950 p-3">
                <code className="text-[11px] leading-relaxed text-gray-300">
                  {`<script>window.GudDeskSettings={appId:"gd_pub_…"}</script>
<script src="https://cdn.guddesk.com/widget.js" async></script>`}
                </code>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h4 className="mb-2 font-heading text-base">REST API</h4>
              <p className="mb-4 text-sm text-muted-foreground">
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
                View API Docs
                <Icons.arrowRight className="size-3" />
              </Link>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h4 className="mb-2 font-heading text-base">Agent Plugins</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect AI agents that listen to events, process messages,
                and reply as BOT. Build or plug in existing bots.
              </p>
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
                  "gap-2",
                )}
              >
                Agent Docs
                <Icons.arrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* ── Divider ──────────────────────────────── */}
      <div className="border-t" />

      {/* ── Section 2: Upgrade to Pro ──────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="text-gradient_brand mb-4 font-semibold">
              Need more power?
            </div>
            <h2 className="font-heading text-3xl md:text-4xl">
              Upgrade when you&apos;re ready
            </h2>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Pro is $29 a month flat and adds Claude AI and lifts the member and
              conversation limits. Business is about $99 a month. No plan
              charges per seat.
            </p>
          </div>

          {/* Pro + Business cards */}
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-sm">
              <Badge className="absolute -top-2.5 right-4">Popular</Badge>
              <h3 className="font-heading text-lg">Pro Plan</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-satoshi text-5xl font-black">$29</span>
                <span className="text-sm text-muted-foreground">
                  /month flat
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Unlimited seats. No per-user fees.
              </p>
              <ul className="mt-6 space-y-2.5">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                    {f}
                  </li>
                ))}
                <li className="text-sm text-muted-foreground">
                  AI agent: on the roadmap
                </li>
              </ul>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ rounded: "xl", size: "lg" }),
                  "mt-6 w-full",
                )}
              >
                Start Free Trial
              </Link>
            </div>
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <h3 className="font-heading text-lg">Business Plan</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-satoshi text-5xl font-black">~$99</span>
                <span className="text-sm text-muted-foreground">
                  /month flat
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Same rule: one workspace price, not per seat.
              </p>
              <ul className="mt-6 space-y-2.5">
                {businessFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="mailto:support@guddesk.com?subject=GudDesk%20Business"
                className={cn(
                  buttonVariants({ variant: "outline", rounded: "xl", size: "lg" }),
                  "mt-6 w-full",
                )}
              >
                Talk to us
              </Link>
            </div>
          </div>

          {/* Why upgrade callouts */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.sparkles className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">AI-Powered</h4>
              <p className="text-xs text-muted-foreground">
                Reply suggestions, summaries, auto-categorization, and sentiment
                analysis powered by Claude.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.users className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">Unlimited Seats</h4>
              <p className="text-xs text-muted-foreground">
                Add your entire workspace. No per-seat charges, ever. One flat price
                for everyone.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icons.integrations className="size-5" />
              </div>
              <h4 className="mb-1 font-heading text-sm">Integrations</h4>
              <p className="text-xs text-muted-foreground">
                Slack notifications, custom branding removal, and priority
                support for your workspace.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="mx-auto mt-16 max-w-4xl">
            <h3 className="mb-6 text-center font-heading text-2xl">
              How GudDesk compares to Intercom
            </h3>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Feature</TableHead>
                    <TableHead className="text-center">
                      Intercom Essential
                    </TableHead>
                    <TableHead className="text-center">Intercom Advanced</TableHead>
                    <TableHead className="bg-primary/5 text-center font-semibold">
                      GudDesk Free
                    </TableHead>
                    <TableHead className="bg-primary/5 text-center font-semibold">
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
                      <TableCell className="bg-primary/5 text-center">
                        <CellValue value={row.guddeskFree} />
                      </TableCell>
                      <TableCell className="bg-primary/5 text-center">
                        <CellValue value={row.guddeskPro} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Intercom list prices billed annually, from intercom.com/pricing,
              checked 13 Oct 2026.
            </p>
          </div>

          {/* Open source note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
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
