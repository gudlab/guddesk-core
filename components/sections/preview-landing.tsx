import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export default function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-20">
      <MaxWidthWrapper>
        <div className="h-auto rounded-xl md:bg-muted/30 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
          <div className="relative overflow-hidden rounded-xl border md:rounded-lg">
            <InboxPreview />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}

function InboxPreview() {
  return (
    <div className="flex h-[420px] bg-card sm:h-[480px] md:h-[520px]">
      {/* Sidebar */}
      <div className="hidden w-14 shrink-0 border-r bg-muted/30 sm:block">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="size-8 rounded-lg bg-muted" />
          <div className="size-8 rounded-lg bg-muted" />
          <div className="size-8 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Conversation list */}
      <div className="w-[240px] shrink-0 border-r sm:w-[280px]">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Inbox</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            3 open
          </span>
        </div>

        <div className="border-b bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              SL
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sarah Lee</span>
                <span className="text-[10px] text-muted-foreground">2m</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Can I upgrade my plan mid-cycle?
              </p>
            </div>
          </div>
        </div>

        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
              MK
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mike Kim</span>
                <span className="text-[10px] text-muted-foreground">15m</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                The widget isn&apos;t showing on our site
              </p>
            </div>
          </div>
        </div>

        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              JR
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Julia Ross</span>
                <span className="text-[10px] text-muted-foreground">1h</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Thanks, that fixed it!
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
              AT
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alex Torres</span>
                <span className="text-[10px] text-muted-foreground">3h</span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                How do I set up automations?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              SL
            </div>
            <div>
              <span className="text-sm font-medium">Sarah Lee</span>
              <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                sarah@acme.co
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Open
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              setup
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-hidden px-4 py-4 sm:px-6">
          <div className="max-w-[85%]">
            <div className="rounded-lg rounded-tl-none bg-muted/60 px-3 py-2">
              <p className="text-sm">
                Hi! How do I set up the chat widget on my website? Do I need to
                install anything special?
              </p>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground">
              2 min ago
            </span>
          </div>

          {/* AI suggestion */}
          <div className="ml-auto max-w-[90%] rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="mb-2 flex items-center gap-1.5">
              <svg
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                AI Suggested Reply (planned)
              </span>
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Just add two lines of JavaScript to your site! Copy the widget
              snippet from Settings → Chat Widget and paste it before the
              closing &lt;/body&gt; tag. It loads asynchronously.
            </p>
            <div className="mt-2.5 flex gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white">
                Use reply
              </span>
              <span className="inline-flex items-center rounded-md border border-emerald-300 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-600 dark:text-emerald-300">
                Edit
              </span>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <span className="flex-1 text-sm text-muted-foreground">
              Type a reply...
            </span>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <svg
                className="size-3.5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
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
    </div>
  );
}
