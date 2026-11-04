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
import { MarketingFaq } from "@/components/sections/marketing-faq";
import { MarketingPageCta } from "@/components/sections/marketing-page-cta";
import {
  alternatives,
  getAlternativeBySlug,
  getAllAlternativeSlugs,
} from "@/lib/alternatives";
import { withCanonical } from "@/lib/canonical";

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

  return withCanonical({
    title: `Free ${alt.name} Alternative | Open Source | GudDesk`,
    description: `Looking for a free ${alt.name} alternative? GudDesk is open-source customer support software with live chat and a shared inbox. Free plan for 2 members. Self-hostable.`,
  }, `/alternatives/${alt.slug}`);
}

export default async function AlternativePage({ params }: PageProps) {
  const { slug } = await params;
  const alt = getAlternativeBySlug(slug);

  if (!alt) {
    notFound();
  }

  const otherAlts = alternatives.filter((a) => a.slug !== slug);

  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15]">
            A free {alt.name} alternative
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            {alt.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
              href="/pricing"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "px-5",
              )}
            >
              Compare plans
            </Link>
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
            Free for 2 members. No credit card. Self-host the AGPL-3.0 code if
            you prefer.
          </p>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16">
        <MaxWidthWrapper className="max-w-2xl text-center">
          <h2 className="font-heading text-xl">{alt.name} pricing</h2>
          <p className="mt-3 text-pretty text-neutral-600 dark:text-neutral-300">
            {alt.pricing}
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            GudDesk Free is $0 for 2 members and 500 conversations a month.
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            Pro is $29 a month flat.
          </p>
        </MaxWidthWrapper>
      </section>

      <section className="py-16 sm:py-20">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl text-balance md:text-4xl">
              GudDesk and {alt.name}, feature by feature
            </h2>
            <p className="mt-4 text-pretty text-neutral-600 dark:text-neutral-300">
              Figures for {alt.name} come from their public pricing pages. Dates
              are on that page&apos;s source line.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] text-neutral-800 dark:text-neutral-200">
                    Feature
                  </TableHead>
                  <TableHead className="w-[30%] text-neutral-800 dark:text-neutral-200">
                    {alt.name}
                  </TableHead>
                  <TableHead className="w-[30%] text-neutral-800 dark:text-neutral-200">
                    GudDesk
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alt.features.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">{feature.name}</TableCell>
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

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
            Why teams leave {alt.name}
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
            {alt.switchReasons.map((reason) => (
              <div key={reason.title}>
                <h3 className="font-heading text-base">{reason.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
            What you get on GudDesk that {alt.name} prices extra
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Open source",
                desc: "AGPL-3.0 licensed. Read the code and change it.",
              },
              {
                title: "Self-hostable",
                desc: "Run on your own Postgres. Own the data.",
              },
              {
                title: "Bring your own agent",
                desc: "Connect a bot through the agent API. No per-resolution fee. GudBot stays off until you turn it on.",
              },
              {
                title: "No per-seat price",
                desc: "Free for 2 members. Pro is $29 a month for unlimited seats.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-heading text-base">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <div className="border-t" />
      <MarketingFaq faqs={alt.faqs} />

      <section className="border-t py-16">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-xl">
            Comparing another tool?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {otherAlts.map((other) => (
              <Link
                key={other.slug}
                href={`/alternatives/${other.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm", rounded: "xl" }),
                  "px-4",
                )}
              >
                vs {other.name}
              </Link>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <MarketingPageCta
        title={`Switch from ${alt.name}`}
        description="Cloud Free for 2 members. No credit card. Self-host the code if you prefer."
        secondaryHref="/docs/quickstart"
        secondaryLabel="Read the docs"
      />
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
            ? "text-emerald-800 dark:text-emerald-300"
            : "text-neutral-500 dark:text-neutral-400",
        )}
      />
    );
  }
  if (value === false) {
    return <Icons.close className="size-4 text-neutral-400" />;
  }
  return (
    <span
      className={cn(
        "text-sm",
        positive
          ? "font-medium text-emerald-800 dark:text-emerald-300"
          : "text-neutral-600 dark:text-neutral-300",
      )}
    >
      {value}
    </span>
  );
}
