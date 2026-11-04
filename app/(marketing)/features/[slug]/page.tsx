import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { features, getAllFeatureSlugs, getFeatureBySlug } from "@/lib/features";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/json-ld";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { MarketingFaq } from "@/components/sections/marketing-faq";
import { MarketingPageCta } from "@/components/sections/marketing-page-cta";
import { CANONICAL_ORIGIN, withCanonical } from "@/lib/canonical";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllFeatureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return {};

  return withCanonical({
    title: `${feature.name} | ${feature.tagline} | GudDesk`,
    description: feature.description.slice(0, 155) + "…",
    openGraph: {
      title: `${feature.name} | ${feature.tagline} | GudDesk`,
      description: feature.description.slice(0, 155) + "…",
      type: "website",
    },
  }, `/features/${feature.slug}`);
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);

  if (!feature) {
    notFound();
  }

  const relatedFeatures = feature.relatedFeatures
    .map((rs) => features.find((f) => f.slug === rs))
    .filter(Boolean);

  return (
    <>
      <FaqJsonLd faqs={feature.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: CANONICAL_ORIGIN },
          { name: "Features", url: `${CANONICAL_ORIGIN}/features` },
          {
            name: feature.name,
            url: `${CANONICAL_ORIGIN}/features/${feature.slug}`,
          },
        ]}
      />

      <section className="py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          <h1 className="font-satoshi max-w-3xl text-[40px] leading-[1.15] font-black tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.15]">
            {feature.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-neutral-600 dark:text-neutral-300">
            {feature.description}
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
              href="/docs"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  rounded: "xl",
                  size: "lg",
                }),
                "px-5",
              )}
            >
              Read the docs
            </Link>
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
            What {feature.name.toLowerCase()} includes
          </h2>

          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
            {feature.highlights.map((highlight) => {
              const IconComponent = Icons[highlight.icon as keyof typeof Icons];
              return (
                <div key={highlight.title}>
                  <div className="flex items-start gap-2.5">
                    {IconComponent ? (
                      <IconComponent className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                    ) : null}
                    <div>
                      <h3 className="font-heading text-base">{highlight.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                        {highlight.description}
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
              On Free and Pro
            </h2>
            <p className="mt-4 text-pretty text-neutral-600 dark:text-neutral-300">
              Free covers 2 members and 500 conversations a month. Pro is $29 a
              month flat and lifts those caps.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-2 sm:grid-cols-2">
            {feature.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-sm">
                <Icons.check className="size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                {cap}
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="border-t py-16 sm:py-20 lg:py-24">
        <MaxWidthWrapper>
          <h2 className="text-center font-heading text-3xl text-balance md:text-4xl">
            How teams use it
          </h2>

          <div className="mx-auto mt-10 max-w-3xl space-y-8">
            {feature.useCaseExamples.map((example, i) => (
              <div key={example.title} className="flex gap-4">
                <span className="font-satoshi w-6 shrink-0 text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-base">{example.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {example.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <div className="border-t" />
      <MarketingFaq faqs={feature.faqs} />

      {relatedFeatures.length > 0 ? (
        <section className="border-t py-16">
          <MaxWidthWrapper>
            <h2 className="text-center font-heading text-xl">Related features</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {relatedFeatures.map((rf) => {
                if (!rf) return null;
                return (
                  <Link
                    key={rf.slug}
                    href={`/features/${rf.slug}`}
                    className={cn(
                      buttonVariants({
                        variant: "outline",
                        size: "sm",
                        rounded: "xl",
                      }),
                      "px-4",
                    )}
                  >
                    {rf.name}
                  </Link>
                );
              })}
            </div>
          </MaxWidthWrapper>
        </section>
      ) : null}

      <MarketingPageCta
        title={`Try ${feature.name} on the free plan`}
        description="Free covers 2 members and 500 conversations a month. No credit card."
      />
    </>
  );
}
