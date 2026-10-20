import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import {
  alternatives,
  getAlternativeBySlug,
  getAllAlternativeSlugs,
} from "@/lib/alternatives";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllAlternativeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternativeBySlug(slug);
  if (!alt) return {};

  return {
    title: `Free ${alt.name} Alternative | Open Source | GudDesk`,
    description: `Looking for a free ${alt.name} alternative? GudDesk is an open-source customer messaging platform with live chat, AI agents, and a shared inbox. Free for small workspaces. Self-hostable.`,
  };
}

export default async function AlternativePage({ params }: PageProps) {
  const { slug } = await params;
  const alt = getAlternativeBySlug(slug);

  if (!alt) {
    notFound();
  }

  // Other alternatives for cross-linking
  const otherAlts = alternatives.filter((a) => a.slug !== slug);

  return (
    <>
      {/* Hero */}
      <section className="space-y-6 py-12 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          <div className="text-gradient_brand mb-4 font-semibold">
            {alt.tagline}
          </div>
          <h1 className="max-w-3xl text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15]">
            Looking for a free{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 bg-clip-text text-transparent">
              {alt.name} alternative
            </span>
            ?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            {alt.description}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "gap-2 px-5 text-[15px]",
              )}
            >
              Get Started Free
              <Icons.arrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "px-4 text-[15px]",
              )}
            >
              Compare Pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free plan for 2 members &middot; Self-host the AGPL-3.0 code
          </p>
        </MaxWidthWrapper>
      </section>

      {/* Competitor pricing callout */}
      <section className="border-t py-12">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 text-center shadow-sm">
            <h2 className="font-heading text-lg">{alt.name} Pricing</h2>
            <p className="mt-2 text-muted-foreground">{alt.pricing}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Icons.check className="size-4" />
              GudDesk: Free for 2 members and 500 conversations a month. Pro is $29 a month flat.
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Feature comparison table */}
      <section className="py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Feature Comparison
            </h2>
            <p className="mt-4 text-muted-foreground">
              See how GudDesk stacks up against {alt.name} feature by feature.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Feature</TableHead>
                  <TableHead className="w-[30%]">{alt.name}</TableHead>
                  <TableHead className="w-[30%]">GudDesk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alt.features.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">
                      {feature.name}
                    </TableCell>
                    <TableCell>
                      <FeatureValue value={feature.competitor} />
                    </TableCell>
                    <TableCell>
                      <FeatureValue value={feature.guddesk} positive />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Why switch */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Why switch from {alt.name}?
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            {alt.switchReasons.map((reason) => (
              <div
                key={reason.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <h3 className="font-heading text-base">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Key differentiators */}
      <section className="border-t bg-muted/30 py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              What makes GudDesk different
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Icons.code,
                title: "Open Source",
                desc: "AGPL-3.0 licensed. Audit, extend, and contribute.",
              },
              {
                icon: Icons.laptop,
                title: "Self-Hostable",
                desc: "Run on your own infrastructure. Own your data.",
              },
              {
                icon: Icons.sparkles,
                title: "AI Agents Included",
                desc: "Three built-in agents. No per-resolution fees.",
              },
              {
                icon: Icons.users,
                title: "No Per-Seat Pricing",
                desc: "Free for 2 members. Flat pricing for workspaces.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <item.icon className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-3 font-heading text-sm">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* FAQ */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {alt.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border bg-card p-6">
                <h3 className="font-heading text-base">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Other alternatives */}
      <section className="border-t bg-muted/30 py-12">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="font-heading text-lg">
              Also comparing other tools?
            </h3>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {otherAlts.map((other) => (
                <Link
                  key={other.slug}
                  href={`/alternatives/${other.slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
                    "px-4",
                  )}
                >
                  Free {other.name} Alternative
                </Link>
              ))}
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* CTA */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Ready to switch from {alt.name}?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Free for 2 members. Self-host the code if you prefer.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ rounded: "xl", size: "lg" }),
                  "gap-2 px-5 text-[15px]",
                )}
              >
                Get Started Free
                <Icons.arrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/quickstart"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    rounded: "xl",
                    size: "lg",
                  }),
                  "px-4 text-[15px]",
                )}
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}

function FeatureValue({
  value,
  positive = false,
}: {
  value: string | boolean;
  positive?: boolean;
}) {
  if (value === true) {
    return (
      <Icons.check
        className={cn(
          "size-4",
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground",
        )}
      />
    );
  }
  if (value === false) {
    return <Icons.close className="size-4 text-muted-foreground/40" />;
  }
  return (
    <span
      className={cn(
        "text-sm",
        positive
          ? "font-medium text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}
