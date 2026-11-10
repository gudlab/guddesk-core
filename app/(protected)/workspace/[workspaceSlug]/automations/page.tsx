import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, getWorkspaceMembers, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { AutomationRuleCard } from "@/components/automations/automation-rule-card";
import { CreateAutomationForm } from "@/components/automations/create-automation-form";

export default async function AutomationsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  await requireWorkspaceRole(workspace.id, user.id!, ["OWNER", "ADMIN"]);

  const [rules, members] = await Promise.all([
    prisma.automationRule.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { order: "asc" },
    }),
    getWorkspaceMembers(workspace.id),
  ]);

  const workspaceMembers = members.map((m) => ({
    id: m.id,
    user: { name: m.user.name },
  }));

  return (
    <>
      <DashboardHeader
        heading="Automations"
        text="Save rules with a trigger and an action. Saved rules do not run yet."
      />
      <div className="space-y-6">
        <CreateAutomationForm workspaceId={workspace.id} workspaceMembers={workspaceMembers} />

        {rules.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Active Rules ({rules.length})
            </h3>
            {rules.map((rule) => (
              <AutomationRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
            No automation rules yet. Create your first rule above.
          </div>
        )}
      </div>
    </>
  );
}
