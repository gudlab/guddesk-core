import { siteConfig } from "@/config/site";
import { CANONICAL_ORIGIN } from "@/lib/canonical";

/**
 * Organization + WebSite structured data for the root layout.
 * Renders a JSON-LD script tag for search engines.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${CANONICAL_ORIGIN}/#organization`,
        name: siteConfig.name,
        url: CANONICAL_ORIGIN,
        logo: {
          "@type": "ImageObject",
          url: `${CANONICAL_ORIGIN}/_static/favicons/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [siteConfig.links.twitter, siteConfig.links.github],
        contactPoint: {
          "@type": "ContactPoint",
          email: siteConfig.mailSupport,
          contactType: "customer support",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        url: CANONICAL_ORIGIN,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          "@id": `${CANONICAL_ORIGIN}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        url: CANONICAL_ORIGIN,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free for 2 seats and 500 conversations a month",
        },
        featureList: [
          "Live Chat Widget",
          "AI Agents",
          "Shared Inbox",
          "Knowledge Base",
          "Automation Rules",
          "SLA Policies",
          "CSAT Surveys",
          "Analytics & Reporting",
          "Webhooks",
          "REST API",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Generic JSON-LD script tag. Used by help center Article / FAQ payloads. */
export function JsonLdScript({
  data,
}: {
  data: Record<string, unknown> | null | undefined;
}) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * FAQ structured data for pages with Q&A sections.
 */
export function FaqJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Breadcrumb structured data.
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
