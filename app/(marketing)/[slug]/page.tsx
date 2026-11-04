import { notFound } from "next/navigation";
import { allPages } from "contentlayer/generated";

import { Mdx } from "@/components/content/mdx-components";

import "@/styles/mdx.css";

import { Metadata } from "next";

import { constructMetadata } from "@/lib/utils";

export async function generateStaticParams() {
  return allPages.map((page) => ({
    slug: page.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const page = allPages.find((page) => page.slugAsParams === slug);
  if (!page) {
    return;
  }

  const { title, description } = page;

  return constructMetadata({
    title: `${title} | GudDesk`,
    description: description,
    path: `/${slug}`,
  });
}

export default async function PagePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const page = allPages.find((page) => page.slugAsParams === slug);

  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-[60ch] px-4 py-12 lg:py-20">
      <div className="space-y-4">
        <h1 className="text-balance font-heading text-4xl lg:text-5xl">
          {page.title}
        </h1>
        {page.description ? (
          <p className="text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            {page.description}
          </p>
        ) : null}
      </div>
      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
      <div className="text-neutral-700 dark:text-neutral-300">
        <Mdx code={page.body.code} />
      </div>
    </article>
  );
}
