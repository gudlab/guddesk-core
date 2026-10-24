import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const triggers = [
  "Conversation Created",
  "Message Received",
  "Tag Added",
  "Unassigned For",
  "Conversation Closed",
];

const actions = [
  "Assign To",
  "Add Tag",
  "Change Status",
  "Send Message",
  "Notify Slack",
];

export default function AutomationsShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          label="Work smarter"
          title="Build rules for the repetitive stuff"
          subtitle="Pick a trigger and an action without writing code. Rules are saved today but don't run yet."
        />

        {/* Flow diagram */}
        <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-0">
          {/* Trigger */}
          <div className="w-full max-w-[240px] rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Icons.automations className="size-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Trigger
              </span>
            </div>
            <p className="text-sm font-medium">New conversation created</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-muted-foreground md:px-3">
            <Icons.arrowRight className="hidden size-5 md:block" />
            <svg
              className="size-5 rotate-90 md:hidden"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* Condition */}
          <div className="w-full max-w-[240px] rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Icons.settings className="size-4 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Condition
              </span>
            </div>
            <p className="text-sm font-medium">
              Contains tag &ldquo;billing&rdquo;
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-muted-foreground md:px-3">
            <Icons.arrowRight className="hidden size-5 md:block" />
            <svg
              className="size-5 rotate-90 md:hidden"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* Action */}
          <div className="w-full max-w-[240px] rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Icons.check className="size-4 text-green-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                Action
              </span>
            </div>
            <p className="text-sm font-medium">
              Assign to Billing Team + Notify #billing
            </p>
          </div>
        </div>

        {/* Trigger and action pills */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
              Supported Triggers
            </h4>
            <div className="flex flex-wrap gap-2">
              {triggers.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
              Available Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <Badge key={a} variant="secondary">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
