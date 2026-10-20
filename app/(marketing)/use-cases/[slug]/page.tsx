import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { FaqJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { siteConfig } from "@/config/site";
import {
  useCases,
  getUseCaseBySlug,
  getAllUseCaseSlugs,
} from "@/lib/use-cases";

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

  return {
    title: `${uc.name} Customer Support Software | GudDesk`,
    description: uc.description.slice(0, 155) + "…",
    openGraph: {
      title: `${uc.name} Customer Support Software | GudDesk`,
      description: uc.description.slice(0, 155) + "…",
      type: "website",
    },
  };
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
          { name: "Home", url: siteConfig.url },
          { name: "Use Cases", url: `${siteConfig.url}/use-cases` },
          { name: uc.name, url: `${siteConfig.url}/use-cases/${uc.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="space-y-6 py-12 sm:py-20 lg:py-24">
        <MaxWidthWrapper className="flex flex-col items-center text-center">
          <div className="text-gradient_brand mb-4 font-semibold">
            {uc.tagline}
          </div>
          <h1 className="max-w-3xl text-balance font-satoshi text-[40px] font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl md:leading-[1.15]">
            {uc.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            {uc.description}
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
              View Pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free forever for small teams &middot; No credit card required
          </p>
        </MaxWidthWrapper>
      </section>

      {/* Benefits */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Why {uc.name.toLowerCase()} choose GudDesk
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            {uc.benefits.map((benefit) => {
              const IconComponent = Icons[benefit.icon as keyof typeof Icons];
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    {IconComponent && (
                      <IconComponent className="size-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <h3 className="font-heading text-base">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* How it works / Workflows */}
      <section className="border-t bg-muted/30 py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Real workflows that {uc.name.toLowerCase()} use every day.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {uc.workflows.map((workflow, i) => (
              <div
                key={workflow.title}
                className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-satoshi text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading text-base">{workflow.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {workflow.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* Features list */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-muted-foreground">
              Free plan includes the core features. Pro lifts the member and conversation limits.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {uc.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3"
              >
                <Icons.check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {uc.faqs.map((faq) => (
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

      {/* Other use cases */}
      <section className="border-t py-12">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="font-heading text-lg">
              Explore more use cases
            </h3>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
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
          </div>
        </MaxWidthWrapper>
      </section>

      {/* CTA */}
      <section className="border-t py-16">
        <MaxWidthWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-satoshi text-3xl font-black tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Free plan for 2 members. No credit card required.
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
