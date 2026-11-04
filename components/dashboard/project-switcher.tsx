"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type WorkspaceItem = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
};

export default function ProjectSwitcher({
  workspaces = [],
  large = false,
  canCreateWorkspace = true,
}: {
  workspaces?: WorkspaceItem[];
  large?: boolean;
  canCreateWorkspace?: boolean;
}) {
  const pathname = usePathname();
  const [openPopover, setOpenPopover] = useState(false);

  // Detect active workspace from URL
  const activeSlug = pathname.match(/^\/workspace\/([^/]+)/)?.[1];
  const activeWorkspace =
    workspaces.find((t) => t.slug === activeSlug) ?? workspaces[0];

  if (workspaces.length === 0) {
    return (
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 gap-2 px-2 text-sm font-medium",
        )}
      >
        <div className="flex size-5 items-center justify-center rounded bg-emerald-800 text-xs font-bold text-white">
          G
        </div>
        <span className={cn("truncate", large ? "w-full" : "max-w-[100px]")}>
          GudDesk
        </span>
      </Link>
    );
  }

  return (
    <div>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            className="h-8 px-2"
            variant={openPopover ? "secondary" : "ghost"}
          >
            <div className="flex items-center space-x-2 pr-1">
              <div className="flex size-5 shrink-0 items-center justify-center rounded bg-emerald-800 text-xs font-bold text-white">
                {activeWorkspace?.name.charAt(0).toUpperCase() ?? "W"}
              </div>
              <span
                className={cn(
                  "inline-block truncate text-sm font-medium",
                  large ? "w-full" : "max-w-[100px] xl:max-w-[140px]",
                )}
              >
                {activeWorkspace?.name ?? "Select workspace"}
              </span>
            </div>
            <ChevronsUpDown
              className="size-4 text-neutral-600 dark:text-neutral-300"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-60 p-2">
          <div className="flex flex-col gap-1">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "hover:text-foreground relative flex h-9 items-center gap-2.5 p-3 text-neutral-600 dark:text-neutral-300",
                )}
                href={`/workspace/${workspace.slug}/inbox`}
                onClick={() => setOpenPopover(false)}
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded bg-emerald-800 text-xs font-bold text-white">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`flex-1 truncate text-sm ${
                    activeWorkspace?.id === workspace.id
                      ? "text-foreground font-medium"
                      : "font-normal"
                  }`}
                >
                  {workspace.name}
                </span>
                {activeWorkspace?.id === workspace.id && (
                  <span className="text-foreground absolute inset-y-0 right-0 flex items-center pr-3">
                    <Check size={16} aria-hidden="true" />
                  </span>
                )}
              </Link>
            ))}
            {canCreateWorkspace && (
              <Link
                href="/onboarding/create-workspace"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "relative mt-1 flex h-9 items-center justify-center gap-2 p-2",
                )}
                onClick={() => setOpenPopover(false)}
              >
                <Plus size={16} className="absolute top-2.5 left-2.5" />
                <span className="flex-1 truncate text-center text-sm">
                  New Workspace
                </span>
              </Link>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ProjectSwitcherPlaceholder() {
  return (
    <div className="flex animate-pulse items-center space-x-1.5 rounded-lg px-1.5 py-2 sm:w-60">
      <div className="bg-muted h-8 w-36 animate-pulse rounded-md xl:w-[180px]" />
    </div>
  );
}
