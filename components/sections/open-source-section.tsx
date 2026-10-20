import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { CopyButton } from "@/components/shared/copy-button";

const embedCode = `<script>
  window.GudDeskSettings = {
    appId: "gd_pub_xxxxxxxxxxxxxxxx"
  };
</script>
<script
  src="https://cdn.guddesk.com/widget.js"
  async
></script>`;

const benefits = [
  {
    icon: Icons.gitHub,
    text: "Fork it, extend it, contribute back",
  },
  {
    icon: Icons.server,
    text: "Self-host on any infrastructure",
  },
  {
    icon: Icons.shieldCheck,
    text: "Full data sovereignty",
  },
];

export default function OpenSourceSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Left column */}
          <div className="flex flex-col justify-center">
            <div className="text-gradient_brand mb-4 font-semibold">
              Open source
            </div>
            <h2 className="font-heading text-3xl md:text-4xl">
              Your data, your rules
            </h2>
            <p className="mt-6 text-muted-foreground">
              GudDesk is fully open source under the AGPL-3.0 license. Deploy on
              your own infrastructure. Audit every line of code. No vendor
              lock-in, ever.
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <b.icon className="size-4" />
                  </div>
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

          {/* Right column: code snippet */}
          <div className="flex items-center">
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-950 p-1">
              {/* Terminal header */}
              <div className="flex items-center gap-1.5 px-4 py-2.5">
                <div className="size-2.5 rounded-full bg-red-500/80" />
                <div className="size-2.5 rounded-full bg-yellow-500/80" />
                <div className="size-2.5 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-gray-500">index.html</span>
              </div>
              {/* Code */}
              <div className="relative px-4 pb-4">
                <CopyButton
                  value={embedCode}
                  className="absolute right-2 top-0"
                />
                <pre className="overflow-x-auto text-[13px] leading-relaxed text-gray-300">
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
