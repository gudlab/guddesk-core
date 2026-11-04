import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { MarketingFaq } from "@/components/sections/marketing-faq";
import { MarketingPageCta } from "@/components/sections/marketing-page-cta";
import {
  useCases,
  getUseCaseBySlug,
  getAllUseCaseSlugs,
} from "@/lib/use-cases";
import { CANONICAL_ORIGIN, withCanonical } from "@/lib/canonical";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const uc = getUseCaseBySlug(slug);
  if (!uc) return {};

  return withCanonical({
    title: `${uc.name} Customer Support Software | GudDesk`,
    description: uc.description.slice(0, 155) + "…",
    openGraph: {
      title: `${uc.name} Customer Support Software | GudDesk`,
      description: uc.description.slice(0, 155) + "…",
      type: "website",
    },
  }, `/use-cases/${uc.slug}`);
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const uc = getUseCaseBySlug(slug);

  if (!uc) {
    notFound();
  }

  const otherUseCases = useCases.filter((u) => u.slug !== slug);

  return (
    <>
      <FaqJsonLd faqs={uc.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: CANONICAL_ORIGIN },
          { name: "Use Cases", url: `${CANONICAL_ORIGIN}/use-cases` },
          { name: uc.name, url: `${CANONICAL_ORIGIN}/use-cases/${uc.slug}` },
        ]}
      />

      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15]">
            {uc.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            {uc.description}
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
            Free is $0 for 2 members. No credit card.
          </p>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
            Why {uc.name.toLowerCase()} use GudDesk
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
            {uc.benefits.map((benefit) => {
              const IconComponent = Icons[benefit.icon as keyof typeof Icons];
              return (
                <div key={benefit.title}>
                  <div className="flex items-start gap-2.5">
                    {IconComponent ? (
                      <IconComponent className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                    ) : null}
                    <div>
                      <h3 className="font-heading text-base">{benefit.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl text-balance md:text-4xl">
              A typical week
            </h2>
            <p className="mt-4 text-pretty text-neutral-600 dark:text-neutral-300">
              Workflows {uc.name.toLowerCase()} run in the inbox.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-8">
            {uc.workflows.map((workflow, i) => (
              <div key={workflow.title} className="flex gap-4">
                <span className="font-satoshi w-6 shrink-0 text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-base">{workflow.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {workflow.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-3xl text-balance md:text-4xl">
              What you get
            </h2>
            <p className="mt-4 text-pretty text-neutral-600 dark:text-neutral-300">
              Free covers 2 members and 500 conversations a month. Pro is $29 a
              month flat.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-2 sm:grid-cols-2">
            {uc.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Icons.check className="size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                {feature}
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <div className="border-t" />
      <MarketingFaq faqs={uc.faqs} />

      <section className="border-t py-16">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-xl">
            Other teams using GudDesk
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {otherUseCases.map((other) => (
              <Link
                key={other.slug}
                href={`/use-cases/${other.slug}`}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                    rounded: "xl",
                  }),
                  "px-4",
                )}
              >
                {other.name}
              </Link>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <MarketingPageCta
        title="Create a free workspace"
        description="Free covers 2 members and 500 conversations a month. No credit card."
        secondaryHref="/docs/quickstart"
        secondaryLabel="Read the docs"
      />
    </>
  );
}
