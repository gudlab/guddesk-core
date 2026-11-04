import type { Metadata } from "next";

import { withCanonical } from "@/lib/canonical";

export function helpRouteMetadata({
  title,
  description,
  path,
  noIndex = false,
  article,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  article?: {
    publishedAt?: Date | null;
    updatedAt: Date;
    authorName?: string | null;
  };
}): Metadata {
  return withCanonical(
    {
      title,
      description,
      ...(noIndex ? { robots: { index: false, follow: true } } : {}),
      openGraph: article
        ? {
            type: "article",
            title,
            description,
            publishedTime: article.publishedAt?.toISOString(),
            modifiedTime: article.updatedAt.toISOString(),
            ...(article.authorName ? { authors: [article.authorName] } : {}),
          }
        : {
            title,
            description,
          },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    },
    path,
  );
}
