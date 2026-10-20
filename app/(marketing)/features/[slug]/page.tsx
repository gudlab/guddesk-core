import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { features, getAllFeatureSlugs, getFeatureBySlug } from "@/lib/features";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/json-ld";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

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

  return {
    title: `${feature.name} | ${feature.tagline} | GudDesk`,
    description: feature.description.slice(0, 155) + "…",
    openGraph: {
      title: `${feature.name} | ${feature.tagline} | GudDesk`,
      description: feature.description.slice(0, 155) + "…",
      type: "website",
    },
  };
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

  const HeroIcon = Icons[feature.icon as keyof typeof Icons];

  return (
    <>
      <FaqJsonLd faqs={feature.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Features", url: `${siteConfig.url}/features` },
          {
            name: feature.name,
            url: `${siteConfig.url}/features/${feature.slug}`,
          },
        ]}
      />

      {/* Hero */}
      <section className="space-y-6 py-12 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          {HeroIcon && (
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <HeroIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
          <div className="text-gradient_brand mb-2 font-semibold">
            {feature.tagline}
          </div>
          <h1 className="font-satoshi max-w-3xl text-[40px] leading-[1.15] font-black tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.15]">
            {feature.headline}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-balance">
            {feature.description}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "gap-2 px-5 text-[15px]",
              )}
            >
              Get it free
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
                "px-4 text-[15px]",
              )}
            >
              View Documentation
            </Link>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Highlights */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Key highlights
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            {feature.highlights.map((highlight) => {
              const IconComponent = Icons[highlight.icon as keyof typeof Icons];
              return (
                <div
                  key={highlight.title}
                  className="bg-card rounded-xl border p-6 shadow-sm"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    {IconComponent && (
                      <IconComponent className="size-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <h3 className="font-heading text-base">{highlight.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Full capabilities */}
      <section className="bg-muted/30 border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Full capability list
            </h2>
            <p className="text-muted-foreground mt-4">
              Free plan includes the core features. Pro lifts the member and conversation limits.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {feature.capabilities.map((cap) => (
              <div
                key={cap}
                className="bg-card flex items-center gap-2 rounded-lg border px-4 py-3"
              >
                <Icons.check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">{cap}</span>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Use case examples */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              See it in action
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {feature.useCaseExamples.map((example, i) => (
              <div
                key={example.title}
                className="bg-card flex gap-4 rounded-xl border p-6 shadow-sm"
              >
                <div className="font-satoshi flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading text-base">{example.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {feature.faqs.map((faq) => (
              <div key={faq.question} className="bg-card rounded-xl border p-6">
                <h3 className="font-heading text-base">{faq.question}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Related features */}
      {relatedFeatures.length > 0 && (
        <section className="border-t py-12">
          <MaxWidthWrapper>
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="font-heading text-lg">Related features</h3>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
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
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* CTA */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Try {feature.name} for free
            </h2>
            <p className="text-muted-foreground mt-4">
              Free plan for 2 members.
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
                Compare Plans
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
