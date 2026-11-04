"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const tabs = [
  {
    id: "agents",
    label: "Agent API",
    description:
      "Connect your own bot through the agent API. Its replies appear as BOT messages next to your team's.",
    mock: AgentsMock,
  },
  {
    id: "inbox",
    label: "Shared inbox",
    description:
      "Every widget conversation in one list. Assign to teammates, leave internal notes, set priorities, and track status from open to resolved.",
    mock: InboxMock,
  },
  {
    id: "kb",
    label: "Knowledge base",
    description:
      "Create, organize, and publish help articles. Customers can search your help center.",
    mock: KnowledgeBaseMock,
  },
  {
    id: "ai",
    label: "GudBot",
    description:
      "GudBot can suggest replies and summaries. It stays off until you turn it on. You can also connect your own agent through the API.",
    mock: AIMock,
  },
];

function AgentsMock() {
  return (
    <div className="flex h-72 flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-2.5 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="h-5 w-14 rounded-full bg-green-100 dark:bg-green-900/30" />
      </div>

      <div className="flex-1 space-y-2.5 p-4">
        <div className="max-w-[75%] rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
          <div className="mb-1 h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-2/3 rounded bg-neutral-300 dark:bg-neutral-600" />
        </div>

        <div className="ml-auto max-w-[80%]">
          <div className="mb-1 flex items-center justify-end gap-1.5">
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
              Your bot
            </span>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
            <div className="mb-1 h-1.5 w-full rounded bg-emerald-800/20" />
            <div className="mb-1 h-1.5 w-full rounded bg-emerald-800/20" />
            <div className="h-1.5 w-1/2 rounded bg-emerald-800/20" />
          </div>
        </div>

        <div className="ml-auto flex max-w-[80%] gap-1.5">
          <div className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
            tagged: billing
          </div>
          <div className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
            sent as BOT
          </div>
        </div>

        <div className="max-w-[60%] rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
          <div className="h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
        </div>

        <div className="ml-auto max-w-[80%]">
          <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
            <div className="mb-1 h-1.5 w-3/4 rounded bg-emerald-800/20" />
            <div className="h-1.5 w-1/2 rounded bg-emerald-800/20" />
          </div>
          <div className="mt-1 flex justify-end">
            <div className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-900 dark:bg-green-900/30 dark:text-green-200">
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
      <div className="w-2/5 border-r">
        <div className="border-b px-3 py-2.5">
          <div className="h-2.5 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn("border-b px-3 py-3", i === 1 && "bg-neutral-50 dark:bg-neutral-900")}
          >
            <div className="flex items-center gap-2">
              <div className="size-6 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-2 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-1.5 w-full rounded bg-neutral-200/80 dark:bg-neutral-700/80" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-2.5 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-14 rounded-full bg-green-100 dark:bg-green-900/30" />
            <div className="h-5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-3">
          <div className="max-w-[75%] rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
            <div className="mb-1 h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
            <div className="h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
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
        <div className="h-3 w-28 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="mb-4 h-8 w-full rounded-lg border bg-neutral-50 px-3 dark:bg-neutral-900" />
      <div className="grid grid-cols-2 gap-3">
        {["Getting started", "Billing and plans", "Integrations", "API reference"].map(
          (title) => (
            <div key={title} className="bg-neutral-50 p-3 dark:bg-neutral-900">
              <div className="mb-2 h-2.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-1.5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
              <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
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
        <div className="max-w-[70%] rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
          <div className="mb-1 h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="mb-1 h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-1/2 rounded bg-neutral-300 dark:bg-neutral-600" />
        </div>
        <div className="ml-auto max-w-[65%] rounded-lg bg-primary/10 px-3 py-2">
          <div className="mb-1 h-1.5 w-full rounded bg-primary/20" />
          <div className="h-1.5 w-3/4 rounded bg-primary/20" />
        </div>
        <div className="max-w-[70%] rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
          <div className="mb-1 h-1.5 w-3/4 rounded bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1.5 w-full rounded bg-neutral-300 dark:bg-neutral-600" />
        </div>
      </div>
      <div className="border-t bg-emerald-50 p-3 dark:bg-emerald-950/20">
        <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
          GudBot suggested reply
        </span>
        <div className="mt-2 space-y-1 bg-white p-2 dark:bg-emerald-950/30">
          <div className="h-1.5 w-full rounded bg-emerald-800/15" />
          <div className="h-1.5 w-full rounded bg-emerald-800/15" />
          <div className="h-1.5 w-2/3 rounded bg-emerald-800/15" />
        </div>
        <div className="mt-2 flex gap-2">
          <div className="h-5 w-14 rounded bg-emerald-800" />
          <div className="h-5 w-10 rounded border border-emerald-800" />
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
        <HeaderSection title="See the inbox, help center, and agent API" />

        <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-4 text-left transition-colors",
                  activeTab === tab.id
                    ? "bg-neutral-100 dark:bg-neutral-900"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900/60",
                )}
              >
                <div className="mb-1 font-heading text-base">{tab.label}</div>
                <p className="text-sm leading-relaxed text-pretty text-neutral-600 dark:text-neutral-300">
                  {tab.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex items-center">
            <active.mock />
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
