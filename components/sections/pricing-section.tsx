import Link from "next/link";

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
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const freePlanFeatures = [
  "1 workspace",
  "Up to 2 members",
  "500 conversations / month",
  "Live chat widget",
  "Shared inbox",
  "Knowledge base",
  "Basic automations",
  "Community support",
];

const proPlanFeatures = [
  "Everything in Free",
  "Unlimited workspaces",
  "Unlimited members",
  "Unlimited conversations",
  "AI assist: planned",
  "Remove GudDesk branding",
  "Slack integration",
  "Priority support",
];

const businessPlanFeatures = [
  "Everything in Pro",
  "~$99/mo flat — still no per-seat",
  "Priority email support",
  "Higher-volume hosted workspaces",
  "Business hours & SLA tooling",
];

function Check() {
  return <Icons.check className="mx-auto size-4 text-green-600 dark:text-green-400" />;
}

function Cross() {
  return <Icons.close className="mx-auto size-4 text-muted-foreground/40" />;
}

const comparisonRows = [
  {
    feature: "Starting price",
    intercomStarter: "$29/seat/mo",
    intercom: "$99/seat/mo",
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
    intercomStarter: "Add-on",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Built-in AI",
    intercomStarter: "$0.99/resolution",
    intercom: "Included ($)",
    guddeskFree: "cross",
    guddeskPro: "cross",
  },
  {
    feature: "Automations",
    intercomStarter: "Limited",
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
    return <span className="text-sm font-medium text-green-600 dark:text-green-400">No</span>;
  return <span className="text-sm">{value}</span>;
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          label="Simple pricing"
          title="Generous free tier. No surprises."
          subtitle="Start free and scale when you're ready. No per-seat pricing tricks."
        />

        {/* Pricing cards */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {/* Free plan */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-lg">Free</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-4xl font-black">$0</span>
              <span className="text-sm text-muted-foreground">/month forever</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For small teams getting started
            </p>
            <ul className="mt-6 space-y-2.5">
              {freePlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline", rounded: "xl" }),
                "mt-6 w-full",
              )}
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative rounded-lg border-2 border-primary bg-card p-6 shadow-sm">
            <Badge className="absolute -top-2.5 right-4">Popular</Badge>
            <h3 className="font-heading text-lg">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-4xl font-black">$29</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For growing teams that need more
            </p>
            <ul className="mt-6 space-y-2.5">
              {proPlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl" }),
                "mt-6 w-full",
              )}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Business plan */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-lg">Business</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-4xl font-black">~$99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Flat workspace price. No per-seat billing.
            </p>
            <ul className="mt-6 space-y-2.5">
              {businessPlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="mailto:support@guddesk.com?subject=GudDesk%20Business"
              className={cn(
                buttonVariants({ variant: "outline", rounded: "xl" }),
                "mt-6 w-full",
              )}
            >
              Talk to us
            </Link>
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
                  <TableHead className="text-center">Intercom Starter</TableHead>
                  <TableHead className="text-center">Intercom</TableHead>
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
                    <TableCell className="font-medium">{row.feature}</TableCell>
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
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
