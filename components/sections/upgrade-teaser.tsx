import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const proFeatures = [
  "Unlimited members",
  "Unlimited conversations",
  "AI reply suggestions and summaries: planned",
  "Remove GudDesk branding",
  "Slack integration",
  "Priority support",
];

export default function UpgradeTeaser() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper className="max-w-4xl">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Left — messaging */}
            <div className="flex flex-col justify-center p-8 md:p-10">
              <div className="text-gradient_brand mb-3 text-sm font-semibold">
                Need more power?
              </div>
              <h2 className="font-heading text-2xl md:text-3xl">
                Upgrade when you&apos;re ready
              </h2>
              <p className="mt-4 text-muted-foreground">
                The free plan covers most teams. When you need unlimited seats
                or want GudDesk branding removed, upgrade to Pro for a flat $29
                a month. No per-seat pricing.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ rounded: "xl", size: "lg" }),
                    "gap-2",
                  )}
                >
                  View Pricing
                  <Icons.arrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Right — feature list */}
            <div className="border-t bg-muted/20 p-8 md:border-l md:border-t-0 md:p-10">
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-satoshi text-3xl font-black">$29</span>
                <span className="text-sm text-muted-foreground">/month flat</span>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Everything in Free, plus:
              </p>
              <ul className="space-y-2.5">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
