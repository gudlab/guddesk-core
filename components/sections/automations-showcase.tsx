import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const triggers = [
  "Conversation created",
  "Message received",
  "Tag added",
  "Unassigned for",
  "Conversation closed",
];

const actions = [
  "Assign to",
  "Add tag",
  "Change status",
  "Send message",
  "Notify Slack",
];

export default function AutomationsShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          title="Build rules for the repetitive stuff"
          subtitle="Pick a trigger and an action without writing code. Rules are saved today but do not run yet."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Trigger
            </p>
            <p className="mt-1 text-sm font-medium text-pretty">
              New conversation created
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Condition
            </p>
            <p className="mt-1 text-sm font-medium text-pretty">
              Contains the billing tag
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-200">
              Action
            </p>
            <p className="mt-1 text-sm font-medium text-pretty">
              Assign to Billing and notify Slack
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Planned triggers
            </h3>
            <ul className="flex flex-wrap gap-2">
              {triggers.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Planned actions
            </h3>
            <ul className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
