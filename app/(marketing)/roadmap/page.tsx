import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";

import { cn } from "@/lib/utils";
import { parseRoadmap } from "@/lib/roadmap-parser";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Icons } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Roadmap | GudDesk",
  description:
    "See what we're building next. Our public roadmap shows completed features, current work, and future plans.",
};

export default async function RoadmapPage() {
  const roadmapPath = path.join(process.cwd(), "ROADMAP.md");
  const content = await fs.readFile(roadmapPath, "utf-8");
  const phases = parseRoadmap(content);

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper className="max-w-4xl">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="text-gradient_brand mb-4 font-semibold">Roadmap</div>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-[3rem]">
            Where we&apos;re headed
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            GudDesk is built in the open. Track our progress across every phase,
            from foundation features to enterprise scale.
          </p>
        </div>

        {/* Overall progress */}
        <div className="mx-auto mt-10 max-w-md">
          {(() => {
            const totalChecked = phases.reduce((s, p) => s + p.checked, 0);
            const totalItems = phases.reduce((s, p) => s + p.total, 0);
            const pct = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
            return (
              <div className="rounded-xl border bg-card p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Progress
                </p>
                <p className="mt-1 font-heading text-3xl">
                  {totalChecked}
                  <span className="text-lg text-muted-foreground"> / {totalItems}</span>
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{pct}% complete</p>
              </div>
            );
          })()}
        </div>

        {/* Phases */}
        <div className="mt-16 space-y-12">
          {phases.map((phase, phaseIdx) => (
            <div key={phase.title}>
              {/* Phase header */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    phase.percentage === 100
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : phase.percentage > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {phaseIdx + 1}
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl">{phase.title}</h2>
                  {phase.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {phase.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          phase.percentage === 100
                            ? "bg-green-500"
                            : phase.percentage > 0
                              ? "bg-primary"
                              : "bg-muted-foreground/20",
                        )}
                        style={{ width: `${phase.percentage}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {phase.checked}/{phase.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="ml-14 mt-6 space-y-6">
                {phase.sections.map((section) => (
                  <div key={section.title} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm">{section.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {section.checked}/{section.total}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="mt-3 space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-2"
                        >
                          {item.checked ? (
                            <Icons.check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <div>
                            <span
                              className={cn(
                                "text-sm",
                                item.checked && "text-muted-foreground line-through",
                              )}
                            >
                              {item.title}
                            </span>
                            {item.description && !item.checked && (
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            )}
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

        {/* Footer note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            This roadmap is generated from our{" "}
            <a
              href="https://github.com/gudlab/guddesk-core"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              open source repository
            </a>
            . Want to contribute? Pull requests welcome.
          </p>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
