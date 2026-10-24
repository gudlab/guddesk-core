"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const tabs = [
  {
    id: "agents",
    label: "AI Agents",
    description:
      "Connect your own bot through the agent API. Its replies appear as BOT messages next to your team's.",
    mock: AgentsMock,
  },
  {
    id: "inbox",
    label: "Shared Inbox",
    description:
      "Every conversation from every channel, unified. Assign to teammates, leave internal notes, set priorities, and track status from open to resolved.",
    mock: InboxMock,
  },
  {
    id: "kb",
    label: "Knowledge Base",
    description:
      "Create, organize, and publish help articles. Customers can search your help center.",
    mock: KnowledgeBaseMock,
  },
  {
    id: "ai",
    label: "AI assist (planned)",
    description:
      "AI reply suggestions and summaries are planned. They will ship with GudBot v1. Today you can connect your own agent through the API.",
    mock: AIMock,
  },
];

function AgentsMock() {
  return (
    <div className="flex h-72 flex-col overflow-hidden rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-muted" />
          <div className="h-2.5 w-20 rounded bg-muted" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-green-100 dark:bg-green-900/30" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2.5 p-4">
        {/* Visitor message */}
        <div className="max-w-[75%] rounded-lg bg-muted/50 px-3 py-2">
          <div className="mb-1 h-1.5 w-full rounded bg-muted" />
          <div className="h-1.5 w-2/3 rounded bg-muted" />
        </div>

        {/* Bot reply */}
        <div className="ml-auto max-w-[80%]">
          <div className="mb-1 flex items-center justify-end gap-1.5">
            <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
              Your bot
            </span>
            <div className="flex size-4 items-center justify-center rounded bg-emerald-500">
              <svg className="size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
            <div className="mb-1 h-1.5 w-full rounded bg-emerald-200/50 dark:bg-emerald-800/40" />
            <div className="mb-1 h-1.5 w-full rounded bg-emerald-200/50 dark:bg-emerald-800/40" />
            <div className="h-1.5 w-1/2 rounded bg-emerald-200/50 dark:bg-emerald-800/40" />
          </div>
        </div>

        {/* Bot action badges */}
        <div className="ml-auto flex max-w-[80%] gap-1.5">
          <div className="rounded bg-emerald-100 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            tagged: billing
          </div>
          <div className="rounded bg-blue-100 px-2 py-0.5 text-[8px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            sent as BOT
          </div>
        </div>

        {/* Visitor reply */}
        <div className="max-w-[60%] rounded-lg bg-muted/50 px-3 py-2">
          <div className="h-1.5 w-full rounded bg-muted" />
        </div>

        {/* Bot resolved */}
        <div className="ml-auto max-w-[80%]">
          <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
            <div className="mb-1 h-1.5 w-3/4 rounded bg-emerald-200/50 dark:bg-emerald-800/40" />
            <div className="h-1.5 w-1/2 rounded bg-emerald-200/50 dark:bg-emerald-800/40" />
          </div>
          <div className="mt-1 flex justify-end">
            <div className="rounded bg-green-100 px-2 py-0.5 text-[8px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              sent as BOT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxMock() {
  return (
    <div className="flex h-72 overflow-hidden rounded-lg border bg-card">
      {/* Conversation list */}
      <div className="w-2/5 border-r">
        <div className="border-b px-3 py-2.5">
          <div className="h-2.5 w-16 rounded bg-muted" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "border-b px-3 py-3",
              i === 1 && "bg-muted/50",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="size-6 shrink-0 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-2 w-20 rounded bg-muted" />
                <div className="h-1.5 w-full rounded bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Message detail */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-muted" />
            <div className="h-2.5 w-24 rounded bg-muted" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-14 rounded-full bg-green-100 dark:bg-green-900/30" />
            <div className="h-5 w-10 rounded-full bg-muted" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-3">
          <div className="max-w-[75%] rounded-lg bg-muted/50 px-3 py-2">
            <div className="mb-1 h-1.5 w-full rounded bg-muted" />
            <div className="h-1.5 w-3/4 rounded bg-muted" />
          </div>
          <div className="ml-auto max-w-[70%] rounded-lg bg-primary/10 px-3 py-2">
            <div className="mb-1 h-1.5 w-full rounded bg-primary/20" />
            <div className="h-1.5 w-1/2 rounded bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseMock() {
  return (
    <div className="h-72 overflow-hidden rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-primary/20" />
        <div className="h-3 w-28 rounded bg-muted" />
      </div>
      <div className="mb-4 h-8 w-full rounded-lg border bg-muted/30 px-3" />
      <div className="grid grid-cols-2 gap-3">
        {["Getting Started", "Billing & Plans", "Integrations", "API Reference"].map(
          (title) => (
            <div
              key={title}
              className="rounded-lg border bg-muted/20 p-3"
            >
              <div className="mb-2 h-2.5 w-3/4 rounded bg-muted" />
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded bg-muted/60" />
                <div className="h-1.5 w-2/3 rounded bg-muted/60" />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {title}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function AIMock() {
  return (
    <div className="flex h-72 flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex-1 space-y-3 p-4">
        <div className="max-w-[70%] rounded-lg bg-muted/50 px-3 py-2">
          <div className="mb-1 h-1.5 w-full rounded bg-muted" />
          <div className="mb-1 h-1.5 w-full rounded bg-muted" />
          <div className="h-1.5 w-1/2 rounded bg-muted" />
        </div>
        <div className="ml-auto max-w-[65%] rounded-lg bg-primary/10 px-3 py-2">
          <div className="mb-1 h-1.5 w-full rounded bg-primary/20" />
          <div className="h-1.5 w-3/4 rounded bg-primary/20" />
        </div>
        <div className="max-w-[70%] rounded-lg bg-muted/50 px-3 py-2">
          <div className="mb-1 h-1.5 w-3/4 rounded bg-muted" />
          <div className="h-1.5 w-full rounded bg-muted" />
        </div>
      </div>
      {/* AI suggestion panel */}
      <div className="border-t bg-emerald-50 p-3 dark:bg-emerald-950/20">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="size-4 rounded bg-emerald-200 dark:bg-emerald-800" />
          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
            AI Suggested Reply (planned)
          </span>
        </div>
        <div className="space-y-1 rounded-md border border-emerald-200 bg-white p-2 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="h-1.5 w-full rounded bg-emerald-100 dark:bg-emerald-900/50" />
          <div className="h-1.5 w-full rounded bg-emerald-100 dark:bg-emerald-900/50" />
          <div className="h-1.5 w-2/3 rounded bg-emerald-100 dark:bg-emerald-900/50" />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-14 rounded bg-emerald-500 dark:bg-emerald-600" />
          <div className="h-5 w-10 rounded border border-emerald-300 dark:border-emerald-700" />
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState("agents");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <MaxWidthWrapper>
        <HeaderSection
          label="See it in action"
          title="Built for teams that care about support"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Tab list */}
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-lg border px-5 py-4 text-left transition-colors",
                  activeTab === tab.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted/50",
                )}
              >
                <div className="mb-1 font-heading text-base">
                  {tab.label}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tab.description}
                </p>
              </button>
            ))}
          </div>

          {/* Mock UI */}
          <div className="flex items-center">
            <active.mock />
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
