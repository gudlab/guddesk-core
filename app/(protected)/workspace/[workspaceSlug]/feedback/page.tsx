import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCsatAnalytics, getNpsAnalytics } from "@/lib/surveys/analytics";
import { CsatDashboard } from "@/components/feedback/csat-dashboard";
import { NpsDashboard } from "@/components/feedback/nps-dashboard";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  await requireWorkspaceMember(workspace.id, user.id!);

  // Default: last 30 days
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [csatData, npsData] = await Promise.all([
    getCsatAnalytics(workspace.id, { from, to }),
    getNpsAnalytics(workspace.id, { from, to }),
  ]);

  return (
    <>
      <DashboardHeader
        heading="Feedback"
        text="Customer satisfaction and loyalty metrics from surveys."
      />

      <div className="space-y-8">
        <CsatDashboard data={csatData} workspaceSlug={workspaceSlug} />
        <NpsDashboard data={npsData} />
      </div>
    </>
  );
}
