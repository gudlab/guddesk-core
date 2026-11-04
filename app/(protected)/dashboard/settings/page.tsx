import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getUserWorkspaces } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { UserNameForm } from "@/components/forms/user-name-form";

export const metadata = constructMetadata({
  title: "Settings – GudDesk",
  description: "Manage your account settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  const workspaces = await getUserWorkspaces(user.id);
  const hasProWorkspace = workspaces.some((t) => t.plan === "PRO");

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage your account and preferences."
      />
      <div className="divide-muted divide-y pb-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />

        {/* Email (read-only) */}
        <SectionColumns
          title="Email"
          description="Your email address is used for sign-in and notifications."
        >
          <div className="flex w-full items-center gap-2">
            <div className="bg-muted/50 flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-neutral-600 dark:text-neutral-300">
              {user.email ?? "No email set"}
            </div>
          </div>
          <p className="p-1 text-sm text-neutral-600 dark:text-neutral-300">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </SectionColumns>

        {/* Account info */}
        <SectionColumns
          title="Account"
          description="Your account details and role."
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                Role:
              </span>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                Workspaces:
              </span>
              <span className="text-sm">
                {workspaces.length === 0
                  ? "No workspaces yet"
                  : workspaces.map((t) => t.name).join(", ")}
              </span>
            </div>
            {hasProWorkspace && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  Plan:
                </span>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Pro
                </Badge>
              </div>
            )}
          </div>
        </SectionColumns>

        <DeleteAccountSection />
      </div>
    </>
  );
}
