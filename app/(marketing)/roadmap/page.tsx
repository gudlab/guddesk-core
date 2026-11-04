import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

import { cn } from "@/lib/utils";
import { parseRoadmap } from "@/lib/roadmap-parser";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Icons } from "@/components/shared/icons";
import { withCanonical } from "@/lib/canonical";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = withCanonical({
  title: "Roadmap | GudDesk",
  description:
    "See what we're building next. Our public roadmap shows completed features, current work, and future plans.",
}, "/roadmap");

export default async function RoadmapPage() {
  const roadmapPath = path.join(process.cwd(), "ROADMAP.md");
  const content = await fs.readFile(roadmapPath, "utf-8");
  const phases = parseRoadmap(content);

  const totalChecked = phases.reduce((s, p) => s + p.checked, 0);
  const totalItems = phases.reduce((s, p) => s + p.total, 0);
  const pct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper className="max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-heading text-3xl text-balance md:text-4xl lg:text-5xl">
            Public roadmap
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-300">
            This page is generated from ROADMAP.md in the repo. Checked items
            are built in the open-source core; some Cloud pieces (like inbound
            email) are still being set up. Unchecked items are planned.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md text-center">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
            Checklist progress
          </p>
          <p className="mt-1 font-heading text-3xl">
            {totalChecked}
            <span className="text-lg text-neutral-600 dark:text-neutral-300">
              {" "}
              / {totalItems}
            </span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-800 dark:bg-emerald-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            {pct}% of listed items checked
          </p>
        </div>

        <div className="mt-16 space-y-14">
          {phases.map((phase, phaseIdx) => (
            <div key={phase.title}>
              <div className="flex items-start gap-4">
                <span className="font-satoshi w-6 shrink-0 text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {phaseIdx + 1}
                </span>
                <div className="flex-1">
                  <h2 className="font-heading text-xl">{phase.title}</h2>
                  {phase.description ? (
                    <p className="mt-1 text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                      {phase.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          phase.percentage === 100
                            ? "bg-emerald-800 dark:bg-emerald-300"
                            : phase.percentage > 0
                              ? "bg-primary"
                              : "bg-neutral-300 dark:bg-neutral-700",
                        )}
                        style={{ width: `${phase.percentage}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      {phase.checked}/{phase.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-10 mt-6 space-y-8">
                {phase.sections.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-heading text-base">{section.title}</h3>
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        {section.checked}/{section.total}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {section.items.map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                          {item.checked ? (
                            <Icons.check className="mt-0.5 size-4 shrink-0 text-emerald-800 dark:text-emerald-300" />
                          ) : (
                            <div className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-neutral-400 dark:border-neutral-500" />
                          )}
                          <div>
                            <span
                              className={cn(
                                "text-sm",
                                item.checked &&
                                  "text-neutral-500 line-through dark:text-neutral-400",
                              )}
                            >
                              {item.title}
                            </span>
                            {item.description && !item.checked ? (
                              <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-300">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-pretty text-neutral-600 dark:text-neutral-300">
            Generated from{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              gudlab/guddesk-core
            </a>
            . Pull requests welcome.
          </p>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
