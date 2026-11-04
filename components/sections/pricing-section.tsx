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
  "SLA policies",
  "Community support",
];

const proPlanFeatures = [
  "Everything in Free",
  "Unlimited workspaces",
  "Unlimited members",
  "Unlimited conversations",
  "GudBot (optional, default off)",
  "Remove GudDesk branding",
  "Priority support",
];

function Check() {
  return <Icons.check className="mx-auto size-4 text-emerald-800 dark:text-emerald-300" />;
}

function Cross() {
  return <Icons.close className="mx-auto size-4 text-neutral-400" />;
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
    intercomStarter: "Add-on",
    intercom: "check",
    guddeskFree: "check",
    guddeskPro: "check",
  },
  {
    feature: "Built-in AI",
    intercomStarter: "$0.99/resolution",
    intercom: "Included ($)",
    guddeskFree: "Optional (default off)",
    guddeskPro: "Optional (default off)",
  },
  {
    feature: "Automations",
    intercomStarter: "Limited",
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
    return <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">No</span>;
  return <span className="text-sm">{value}</span>;
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          title="Free is $0. Pro is $29 a month."
          subtitle="Start on Free. Move to Pro at $29 a month when you need unlimited seats."
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-10 sm:grid-cols-2">
          <div>
            <h3 className="font-heading text-lg">Free</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-4xl font-black">$0</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">/month forever</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              2 members and 500 conversations a month
            </p>
            <ul className="mt-6 space-y-2.5">
              {freePlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
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
              Create a free workspace
            </Link>
          </div>

          <div>
            <Badge className="mb-3">Popular</Badge>
            <h3 className="font-heading text-lg">Pro</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-satoshi text-4xl font-black">$29</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">/month</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Unlimited seats. One workspace price.
            </p>
            <ul className="mt-6 space-y-2.5">
              {proPlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Icons.check className="mt-0.5 size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
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
              Create a Pro workspace
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="mb-6 text-center font-heading text-2xl">
            How GudDesk compares to Intercom
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Feature</TableHead>
                  <TableHead className="text-center">Intercom Starter</TableHead>
                  <TableHead className="text-center">Intercom</TableHead>
                  <TableHead className="text-center font-semibold">
                    GudDesk Free
                  </TableHead>
                  <TableHead className="text-center font-semibold">
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
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
