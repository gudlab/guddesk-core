"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types";
import { ArrowLeft, Menu, PanelLeftClose, PanelRightClose } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProjectSwitcher, {
  type WorkspaceItem,
} from "@/components/dashboard/project-switcher";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceContext } from "@/components/workspace/workspace-context";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
  workspaceLinks?: SidebarNavItem[];
  workspaces?: WorkspaceItem[];
}

/**
 * Workspace role hierarchy for authorizeOnly filtering.
 * OWNER > ADMIN > AGENT > VIEWER
 * If a link requires "ADMIN", OWNER and ADMIN can see it.
 */
const WORKSPACE_ROLE_LEVEL: Record<string, number> = {
  VIEWER: 0,
  AGENT: 1,
  ADMIN: 2,
  OWNER: 3,
};

/**
 * Resolves the active sidebar links based on the current path.
 * When inside /workspace/[slug]/, swaps to workspace-scoped links with the slug replaced
 * and filtered by the user's workspace role.
 * Otherwise, uses the default dashboard links.
 */
function useResolvedLinks(
  path: string,
  dashboardLinks: SidebarNavItem[],
  workspaceLinks?: SidebarNavItem[],
  workspaces?: WorkspaceItem[],
  workspaceRole?: string | null,
) {
  return useMemo(() => {
    const workspaceMatch = path.match(/^\/workspace\/([^/]+)/);
    if (workspaceMatch && workspaceLinks) {
      const slug = workspaceMatch[1];
      // Look up role from server-provided workspaces (always available),
      // fall back to context role for backward compatibility
      const wsRole = workspaces?.find((w) => w.slug === slug)?.role;
      const userLevel =
        WORKSPACE_ROLE_LEVEL[wsRole ?? workspaceRole ?? "VIEWER"] ?? 0;

      return {
        isWorkspaceView: true,
        workspaceSlug: slug,
        links: workspaceLinks
          .map((section) => ({
            ...section,
            items: section.items
              .filter(({ authorizeOnly }) => {
                if (!authorizeOnly) return true;
                const requiredLevel =
                  WORKSPACE_ROLE_LEVEL[authorizeOnly as string] ?? 0;
                return userLevel >= requiredLevel;
              })
              .map((item) => ({
                ...item,
                href: item.href.replace("[slug]", slug),
              })),
          }))
          .filter((section) => section.items.length > 0),
      };
    }
    return {
      isWorkspaceView: false,
      workspaceSlug: null,
      links: dashboardLinks,
    };
  }, [path, dashboardLinks, workspaceLinks, workspaces, workspaceRole]);
}

export function DashboardSidebar({
  links,
  workspaceLinks,
  workspaces,
}: DashboardSidebarProps) {
  const path = usePathname();
  const workspaceCtx = useWorkspaceContext();
  const { isWorkspaceView, links: activeLinks } = useResolvedLinks(
    path,
    links,
    workspaceLinks,
    workspaces,
    workspaceCtx?.workspaceRole,
  );

  const { isTablet } = useMediaQuery();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isTablet);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    setIsSidebarExpanded(!isTablet);
  }, [isTablet]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="sticky top-0 h-full">
        <ScrollArea className="h-full overflow-y-auto border-r">
          <aside
            className={cn(
              isSidebarExpanded ? "w-[220px] xl:w-[260px]" : "w-[68px]",
              "hidden h-screen md:block",
            )}
          >
            <div className="flex h-full max-h-screen flex-1 flex-col gap-2">
              <div className="flex h-14 items-center p-4 lg:h-[60px]">
                {isSidebarExpanded ? (
                  <ProjectSwitcher workspaces={workspaces} />
                ) : null}

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-9 lg:size-8"
                  onClick={toggleSidebar}
                >
                  {isSidebarExpanded ? (
                    <PanelLeftClose
                      size={18}
                      className="stroke-neutral-600 dark:stroke-neutral-300"
                    />
                  ) : (
                    <PanelRightClose
                      size={18}
                      className="stroke-neutral-600 dark:stroke-neutral-300"
                    />
                  )}
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>

              {/* Back to dashboard link when inside a workspace */}
              {isWorkspaceView && isSidebarExpanded && (
                <div className="px-4">
                  <Link
                    href="/dashboard"
                    className="hover:bg-muted hover:text-accent-foreground flex items-center gap-2 rounded-md p-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to Dashboard
                  </Link>
                </div>
              )}

              <nav className="flex flex-1 flex-col gap-8 px-4 pt-4">
                {activeLinks.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    {isSidebarExpanded ? (
                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {section.title}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            {isSidebarExpanded ? (
                              <Link
                                key={`link-${item.title}`}
                                href={item.disabled ? "#" : item.href}
                                className={cn(
                                  "hover:bg-muted flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                                  path === item.href
                                    ? "bg-muted"
                                    : "hover:text-accent-foreground text-neutral-600 dark:text-neutral-300",
                                  item.disabled &&
                                    "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-neutral-600 dark:hover:text-neutral-300",
                                )}
                              >
                                <Icon className="size-5" />
                                {item.title}
                                {item.badge && (
                                  <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <Tooltip key={`tooltip-${item.title}`}>
                                <TooltipTrigger asChild>
                                  <Link
                                    key={`link-tooltip-${item.title}`}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "hover:bg-muted flex items-center gap-3 rounded-md py-2 text-sm font-medium",
                                      path === item.href
                                        ? "bg-muted"
                                        : "hover:text-accent-foreground text-neutral-600 dark:text-neutral-300",
                                      item.disabled &&
                                        "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-neutral-600 dark:hover:text-neutral-300",
                                    )}
                                  >
                                    <span className="flex size-full items-center justify-center">
                                      <Icon className="size-5" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  {item.title}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>

              <div className="mt-auto xl:p-4">
                {isSidebarExpanded ? <UpgradeCard /> : null}
              </div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({
  links,
  workspaceLinks,
  workspaces,
}: DashboardSidebarProps) {
  const path = usePathname();
  const workspaceCtx = useWorkspaceContext();
  const { isWorkspaceView, links: activeLinks } = useResolvedLinks(
    path,
    links,
    workspaceLinks,
    workspaces,
    workspaceCtx?.workspaceRole,
  );
  const [open, setOpen] = useState(false);
  const { isSm, isMobile } = useMediaQuery();

  if (isSm || isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 md:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <ScrollArea className="h-full overflow-y-auto">
            <div className="flex h-screen flex-col">
              <nav className="flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <Icons.logo className="size-6" />
                  <span className="font-satoshi text-lg font-bold">
                    {siteConfig.name}
                  </span>
                </Link>

                <ProjectSwitcher workspaces={workspaces} large />

                {isWorkspaceView && (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="hover:text-accent-foreground flex items-center gap-2 rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-300"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to Dashboard
                  </Link>
                )}

                {activeLinks.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {section.title}
                    </p>

                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            <Link
                              key={`link-${item.title}`}
                              onClick={() => {
                                if (!item.disabled) setOpen(false);
                              }}
                              href={item.disabled ? "#" : item.href}
                              className={cn(
                                "hover:bg-muted flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                                path === item.href
                                  ? "bg-muted"
                                  : "hover:text-accent-foreground text-neutral-600 dark:text-neutral-300",
                                item.disabled &&
                                  "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-neutral-600 dark:hover:text-neutral-300",
                              )}
                            >
                              <Icon className="size-5" />
                              {item.title}
                              {item.badge && (
                                <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}

                <div className="mt-auto">
                  <UpgradeCard />
                </div>
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-muted flex size-9 animate-pulse rounded-lg md:hidden" />
  );
}
