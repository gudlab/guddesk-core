import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { CopyButton } from "@/components/shared/copy-button";

const embedCode = `<script>window.GudDeskSettings={appId:"gd_pub_xxxxxxxxxxxxxxxx"}</script>
<script src="https://cdn.guddesk.com/widget.js" async></script>`;

const benefits = [
  {
    icon: Icons.gitHub,
    text: "Fork the repo. Send a patch if you want.",
  },
  {
    icon: Icons.server,
    text: "Self-host on any infrastructure",
  },
  {
    icon: Icons.shieldCheck,
    text: "Your data stays on your servers",
  },
];

export default function OpenSourceSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center">
            <h2 className="font-heading text-3xl md:text-4xl">
              Your data, your rules
            </h2>
            <p className="mt-5 text-pretty text-neutral-600 dark:text-neutral-300">
              GudDesk is open source under AGPL-3.0. Deploy on your own
              infrastructure. Audit every line. You can leave Cloud without
              rewriting the product.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <b.icon className="size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                  <span className="text-sm font-medium">{b.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", rounded: "xl", size: "lg" }),
                  "gap-2",
                )}
              >
                <Icons.gitHub className="size-4" />
                View on GitHub
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative w-full overflow-hidden rounded-xl bg-neutral-950 p-1">
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-500/80" />
                <div className="size-2.5 rounded-full bg-yellow-500/80" />
                <div className="size-2.5 rounded-full bg-green-500/80" />
                <span className="ml-3 text-sm text-neutral-300">index.html</span>
              </div>
              <div className="relative px-4 pb-4">
                <CopyButton
                  value={embedCode}
                  className="absolute top-0 right-2"
                />
                <pre className="overflow-x-auto text-[13px] leading-relaxed text-neutral-200">
                  <code>{embedCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
