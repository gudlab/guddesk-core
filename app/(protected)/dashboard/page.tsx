import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserWorkspaces } from "@/lib/workspace";
import { constructMetadata } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Dashboard – GudDesk",
  description: "Your GudDesk dashboard.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const workspaces = await getUserWorkspaces(user.id);

  return (
    <>
      <DashboardHeader
        heading={`Welcome back${user.name ? `, ${user.name}` : ""}`}
        text="Here's your GudDesk overview."
      />

      {workspaces.length > 0 ? (
        <div className="space-y-8">
          {/* Workspaces */}
          <div>
            <h2 className="mb-4 font-heading text-lg">Your Workspaces</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/workspace/${workspace.slug}/inbox`}
                  className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 font-heading text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-heading text-sm">
                        {workspace.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {workspace.role} &middot;{" "}
                        {workspace.plan === "PRO" ? "Pro" : "Free"}
                      </div>
                    </div>
                    <Icons.arrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}

              {/* Create workspace card */}
              <Link
                href="/onboarding/create-workspace"
                className="flex items-center justify-center rounded-xl border border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                <Icons.add className="mr-2 size-4" />
                Create a new workspace
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="mb-4 font-heading text-lg">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Icons.inbox,
                  title: "Open Inbox",
                  description: "View and reply to conversations",
                  href: workspaces[0]
                    ? `/workspace/${workspaces[0].slug}/inbox`
                    : "/dashboard",
                },
                {
                  icon: Icons.bookOpen,
                  title: "Knowledge Base",
                  description: "Create and manage help articles",
                  href: workspaces[0]
                    ? `/workspace/${workspaces[0].slug}/articles`
                    : "/dashboard",
                },
                {
                  icon: Icons.automations,
                  title: "Automations",
                  description: "Save automation rules. They do not run yet.",
                  href: workspaces[0]
                    ? `/workspace/${workspaces[0].slug}/automations`
                    : "/dashboard",
                },
                {
                  icon: Icons.users,
                  title: "Members",
                  description: "Manage workspace members",
                  href: workspaces[0]
                    ? `/workspace/${workspaces[0].slug}/settings/members`
                    : "/dashboard",
                },
                {
                  icon: Icons.code,
                  title: "Install Widget",
                  description: "Add live chat to your site",
                  href: workspaces[0]
                    ? `/workspace/${workspaces[0].slug}/settings/widget`
                    : "/dashboard",
                },
                {
                  icon: Icons.settings,
                  title: "Settings",
                  description: "Manage your account and preferences",
                  href: "/dashboard/settings",
                },
              ].map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <action.icon className="size-5 text-muted-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                  <div className="mt-3 font-heading text-sm">
                    {action.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* No workspaces: onboarding state */
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-12">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Icons.messageCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-bold">
              Set up your workspace
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a workspace to start managing customer conversations with live
              chat, AI agents, and a shared inbox.
            </p>
            <Link
              href="/onboarding/create-workspace"
              className={cn(
                buttonVariants({ rounded: "xl", size: "lg" }),
                "mt-6 gap-2",
              )}
            >
              Create Your First Workspace
              <Icons.arrowRight className="size-4" />
            </Link>
            <Link
              href="/docs/quickstart"
              className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Read the quickstart guide
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
