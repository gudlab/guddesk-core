import { Icons } from "@/components/shared/icons";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const features = [
  {
    icon: Icons.messageCircle,
    title: "Live Chat Widget",
    description:
      "Embeddable chat widget with custom colors and visitor tracking. Real-time messaging when you add Pusher keys. Install with one script tag.",
    illustration: WidgetIllustration,
  },
  {
    icon: Icons.inbox,
    title: "Shared Inbox",
    description:
      "All conversations in one place. Assign, snooze, tag and add internal notes. Live team updates when you add Pusher keys.",
    illustration: InboxIllustration,
  },
  {
    icon: Icons.bookOpen,
    title: "Knowledge Base",
    description:
      "Publish help articles organized in collections. Public help center with search, custom branding, and article feedback.",
    illustration: KBIllustration,
  },
  {
    icon: Icons.sparkles,
    title: "AI agent API",
    description:
      "Connect your own bot. It receives webhooks and replies as BOT in the widget and inbox.",
    illustration: AIIllustration,
  },
  {
    icon: Icons.automations,
    title: "Webhooks & Automation Rules",
    description:
      "Webhooks fire on conversation events so your agents can act. Automation rules assign, tag, reply or close conversations on their own.",
    illustration: AutomationIllustration,
  },
  {
    icon: Icons.analytics,
    title: "Analytics",
    description:
      "Daily snapshots of conversations, response times, resolution times, and visitor tracking. Know what matters.",
    illustration: AnalyticsIllustration,
  },
];

function WidgetIllustration() {
  return (
    <div className="flex h-full items-end justify-end p-4">
      <div className="w-36 rounded-lg border bg-background shadow-lg">
        <div className="flex items-center gap-1.5 rounded-t-lg bg-emerald-500 px-3 py-1.5">
          <div className="size-1.5 rounded-full bg-white/60" />
          <span className="text-[9px] font-medium text-white">GudDesk</span>
        </div>
        <div className="space-y-1.5 p-2">
          <div className="rounded bg-muted/80 px-2 py-1">
            <div className="h-1 w-16 rounded bg-muted-foreground/20" />
          </div>
          <div className="ml-auto rounded bg-emerald-100 px-2 py-1 dark:bg-emerald-900/30">
            <div className="h-1 w-12 rounded bg-emerald-400/40" />
          </div>
        </div>
        <div className="flex items-center gap-1 border-t px-2 py-1.5">
          <div className="h-4 flex-1 rounded border bg-muted/30" />
          <div className="flex size-4 items-center justify-center rounded bg-emerald-500">
            <svg className="size-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4">
      <div className="space-y-1.5">
        {[
          { initials: "SL", color: "bg-blue-100 dark:bg-blue-900/40", active: true },
          { initials: "MK", color: "bg-green-100 dark:bg-green-900/40", active: false },
          { initials: "JR", color: "bg-amber-100 dark:bg-amber-900/40", active: false },
        ].map((item) => (
          <div
            key={item.initials}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${item.active ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
          >
            <div className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${item.color}`}>
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1 w-14 rounded bg-foreground/15" />
              <div className="mt-1 h-1 w-20 rounded bg-muted-foreground/10" />
            </div>
            <div className="h-1 w-4 rounded bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function KBIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4">
      <div className="grid grid-cols-2 gap-1.5">
        {["Getting Started", "Billing", "API", "Integrations"].map((label) => (
          <div key={label} className="rounded-md border bg-background p-2">
            <div className="mb-1 h-1 w-10 rounded bg-foreground/15" />
            <div className="h-1 w-full rounded bg-muted-foreground/10" />
            <div className="mt-1 text-[7px] text-muted-foreground/50">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIIllustration() {
  return (
    <div className="flex h-full flex-col justify-center p-4">
      <div className="space-y-2">
        <div className="max-w-[80%] rounded-md bg-muted/60 px-2 py-1.5">
          <div className="h-1 w-full rounded bg-muted-foreground/15" />
          <div className="mt-0.5 h-1 w-3/4 rounded bg-muted-foreground/15" />
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="mb-1 flex items-center gap-1">
            <div className="size-2 rounded bg-emerald-400" />
            <span className="text-[7px] font-semibold text-emerald-600 dark:text-emerald-300">AI Reply</span>
          </div>
          <div className="h-1 w-full rounded bg-emerald-300/30" />
          <div className="mt-0.5 h-1 w-2/3 rounded bg-emerald-300/30" />
        </div>
      </div>
    </div>
  );
}

function AutomationIllustration() {
  return (
    <div className="flex h-full items-center justify-center gap-1.5 p-4">
      <div className="rounded border bg-amber-50 px-2 py-1 dark:bg-amber-950/30">
        <div className="text-[8px] font-semibold text-amber-700 dark:text-amber-300">Trigger</div>
      </div>
      <svg className="size-3 shrink-0 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <div className="rounded border bg-blue-50 px-2 py-1 dark:bg-blue-950/30">
        <div className="text-[8px] font-semibold text-blue-700 dark:text-blue-300">Condition</div>
      </div>
      <svg className="size-3 shrink-0 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <div className="rounded border bg-green-50 px-2 py-1 dark:bg-green-950/30">
        <div className="text-[8px] font-semibold text-green-700 dark:text-green-300">Action</div>
      </div>
    </div>
  );
}

function AnalyticsIllustration() {
  return (
    <div className="flex h-full items-end gap-1.5 px-6 pb-3 pt-4">
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
          label="Everything you need"
          title="One platform, not six subscriptions"
          subtitle="Stop stitching together separate live chat, help desk and knowledge base tools. GudDesk puts them in one app."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="h-28 bg-muted/30">
                <feature.illustration />
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <feature.icon className="size-4 text-foreground" />
                  </div>
                  <h3 className="font-heading text-base">{feature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
