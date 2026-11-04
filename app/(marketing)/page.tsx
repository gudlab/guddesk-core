import HeroLanding from "@/components/sections/hero-landing";
import HeroAgents from "@/components/sections/hero-agents";
import TrustBar from "@/components/sections/trust-bar";
import PreviewLanding from "@/components/sections/preview-landing";
import HeroSupport from "@/components/sections/hero-support";
import AgentsShowcase from "@/components/sections/agents-showcase";
import FeaturesGrid from "@/components/sections/features-grid";
import FeatureShowcase from "@/components/sections/feature-showcase";
import AutomationsShowcase from "@/components/sections/automations-showcase";
import OpenSourceSection from "@/components/sections/open-source-section";

import FAQSection from "@/components/sections/faq-section";
import CTASection from "@/components/sections/cta-section";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({ path: "/" });

interface IndexPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const params = await searchParams;
  const variant = params.v;

  return (
    <>
      {variant === "intercom" ? <HeroLanding /> : <HeroAgents />}
      <TrustBar />
      <PreviewLanding />
      <HeroSupport />
      <AgentsShowcase />
      <FeaturesGrid />
      <FeatureShowcase />
      <AutomationsShowcase />
      <OpenSourceSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
