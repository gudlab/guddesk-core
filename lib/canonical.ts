import type { Metadata } from "next";

/**
 * The public origin search engines should index. Canonical tags, og:url,
 * the sitemap, robots and JSON-LD use this, never NEXT_PUBLIC_APP_URL, so a
 * Preview or a misconfigured env can't point them somewhere else. Email,
 * invite and Stripe links keep using getAppUrl().
 */
export const CANONICAL_ORIGIN = "https://www.guddesk.com";

/** Absolute canonical URL for a path such as "/pricing". "/" is the home page. */
export function canonicalUrl(path: string = "/"): string {
  const clean = `/${path}`.replace(/\/{2,}/g, "/");
  return clean === "/" ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${clean.replace(/\/$/, "")}`;
}

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * app/opengraph-image.jpg. Next.js only adds that file-convention image
 * when a page does not set its own openGraph, so withCanonical carries it.
 */
export const DEFAULT_OG_IMAGE = {
  url: `${CANONICAL_ORIGIN}/opengraph-image.jpg`,
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "GudDesk",
};

function plainTitle(title: Metadata["title"]): string | undefined {
  return typeof title === "string" ? title : undefined;
}

/**
 * Add a canonical tag and a per-page og:url. Next.js replaces the root
 * layout's openGraph object when a page sets its own, so the title,
 * description and default image are carried over here. A page's own
 * openGraph.images win.
 */
export function withCanonical(metadata: Metadata, path: string): Metadata {
  const url = canonicalUrl(path);
  const og = (metadata.openGraph ?? {}) as OpenGraph;
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "GudDesk",
      title: plainTitle(metadata.title),
      description: metadata.description ?? undefined,
      ...og,
      images: og.images ?? [DEFAULT_OG_IMAGE],
      url,
    } as OpenGraph,
  };
}

/** Robots rules: production indexes the marketing site, everything else nothing. */
export function isIndexableDeployment(vercelEnv: string | undefined = process.env.VERCEL_ENV): boolean {
  return vercelEnv === "production";
}
