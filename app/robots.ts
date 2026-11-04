import { MetadataRoute } from "next";

import { CANONICAL_ORIGIN, isIndexableDeployment } from "@/lib/canonical";

export default function robots(): MetadataRoute.Robots {
  // Preview, Development and local builds: keep crawlers out entirely.
  if (!isIndexableDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/workspace/",
          "/login",
          "/register",
          "/onboarding/",
          "/help/*/search",
        ],
      },
    ],
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
  };
}
