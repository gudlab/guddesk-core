import { Icons } from "@/components/shared/icons";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const features = [
  {
    icon: Icons.messageCircle,
    title: "Live chat widget",
    description:
      "Embeddable chat with custom colors and visitor tracking. Replies show up in the open widget within seconds. Install with one script tag.",
    illustration: WidgetIllustration,
  },
  {
    icon: Icons.inbox,
    title: "Shared inbox",
    description:
      "All conversations in one place. Assign, snooze, tag, and add internal notes.",
    illustration: InboxIllustration,
  },
  {
    icon: Icons.bookOpen,
    title: "Knowledge base",
    description:
      "Publish help articles in collections. Public help center with search, custom branding, and article feedback.",
    illustration: KBIllustration,
  },
  {
    icon: Icons.sparkles,
    title: "Agent API",
    description:
      "Connect your own bot. It receives webhooks and replies as BOT in the widget and inbox. GudBot stays off until you turn it on.",
    illustration: AIIllustration,
  },
  {
    icon: Icons.automations,
    title: "Webhooks and rules",
    description:
      "Webhooks fire on conversation events so your agents can act. A rule builder saves automation rules, which do not run yet.",
    illustration: AutomationIllustration,
  },
  {
    icon: Icons.analytics,
    title: "Analytics",
    description:
      "Daily snapshots of conversations, response times, resolution times, and visitor tracking.",
    illustration: AnalyticsIllustration,
  },
];

function WidgetIllustration() {
  return (
    <div className="flex h-full items-end justify-end p-4" aria-hidden="true">
      <div className="w-36 rounded-lg border bg-background shadow-sm">
        <div className="flex items-center gap-1.5 rounded-t-lg bg-emerald-800 px-3 py-1.5">
          <div className="size-1.5 rounded-full bg-white/70" />
          <span className="text-xs font-medium text-white">GudDesk</span>
        </div>
        <div className="space-y-1.5 p-2">
          <div className="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
            <div className="h-1 w-16 rounded bg-neutral-300 dark:bg-neutral-600" />
          </div>
          <div className="ml-auto rounded bg-emerald-100 px-2 py-1 dark:bg-emerald-900/30">
            <div className="h-1 w-12 rounded bg-emerald-700/40" />
          </div>
        </div>
        <div className="flex items-center gap-1 border-t px-2 py-1.5">
          <div className="h-4 flex-1 rounded border bg-neutral-50 dark:bg-neutral-900" />
          <div className="flex size-4 items-center justify-center rounded bg-emerald-800">
            <svg
              className="size-2 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4" aria-hidden="true">
      <div className="space-y-1.5">
        {[
          { initials: "SL", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200", active: true },
          { initials: "MK", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200", active: false },
          { initials: "JR", color: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200", active: false },
        ].map((item) => (
          <div
            key={item.initials}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${item.active ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
          >
            <div
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${item.color}`}
            >
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1 w-14 rounded bg-foreground/20" />
              <div className="mt-1 h-1 w-20 rounded bg-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KBIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-1.5">
        {["Getting started", "Billing", "API", "Integrations"].map((label) => (
          <div key={label} className="rounded-md border bg-background p-2">
            <div className="mb-1 h-1 w-10 rounded bg-foreground/20" />
            <div className="h-1 w-full rounded bg-foreground/10" />
            <div className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-300">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4" aria-hidden="true">
      <div className="space-y-2">
        <div className="max-w-[80%] rounded-md bg-neutral-100 px-2 py-1.5 dark:bg-neutral-800">
          <div className="h-1 w-full rounded bg-foreground/15" />
          <div className="mt-0.5 h-1 w-3/4 rounded bg-foreground/15" />
        </div>
        <div className="bg-emerald-50 p-2 dark:bg-emerald-950/30">
          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            BOT reply
          </span>
          <div className="mt-1 h-1 w-full rounded bg-emerald-800/20" />
          <div className="mt-0.5 h-1 w-2/3 rounded bg-emerald-800/20" />
        </div>
      </div>
    </div>
  );
}

function AutomationIllustration() {
  return (
    <div className="flex h-full items-center justify-center gap-1.5 p-4" aria-hidden="true">
      <div className="rounded border bg-amber-50 px-2 py-1 dark:bg-amber-950/30">
        <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
          Trigger
        </div>
      </div>
      <svg
        className="size-3 shrink-0 text-neutral-400"
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
      <div className="rounded border bg-blue-50 px-2 py-1 dark:bg-blue-950/30">
        <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          Condition
        </div>
      </div>
      <svg
        className="size-3 shrink-0 text-neutral-400"
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
      <div className="rounded border bg-green-50 px-2 py-1 dark:bg-green-950/30">
        <div className="text-xs font-semibold text-green-900 dark:text-green-200">
          Action
        </div>
      </div>
    </div>
  );
}

function AnalyticsIllustration() {
  return (
    <div className="flex h-full items-end gap-1.5 px-6 pt-4 pb-3" aria-hidden="true">
      {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-primary/15"
          style={{ height: `${h * 0.55}px` }}
        />
      ))}
    </div>
  );
}

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          title="Live chat, inbox, and help articles in one app"
          subtitle="Stop paying for a separate live chat tool, a help desk, and a knowledge base. GudDesk ships all three."
        />

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <div className="h-28 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <feature.illustration />
              </div>
              <div className="mt-4 flex items-start gap-2.5">
                <feature.icon className="mt-0.5 size-5 shrink-0 text-emerald-800 dark:text-emerald-300" />
                <div>
                  <h3 className="font-heading text-lg">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
