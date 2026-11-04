import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember, getWorkspaceMembers } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { WorkloadMonitor } from "@/components/analytics/workload-monitor";

export default async function WorkloadPage({
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

  const members = await getWorkspaceMembers(workspace.id);

  // Get active conversation counts per member
  const membersWithCounts = await Promise.all(
    members.map(async (member) => {
      const activeCount = await prisma.conversation.count({
        where: {
          workspaceId: workspace.id,
          assigneeId: member.id,
          status: "OPEN",
        },
      });

      return {
        memberId: member.id,
        userId: member.userId,
        name: member.user.name ?? "Unknown",
        image: member.user.image ?? null,
        availability: member.availability,
        activeConversations: activeCount,
        currentViewingId: member.currentViewingId ?? null,
      };
    }),
  );

  return (
    <>
      <DashboardHeader
        heading="Workload Monitor"
        text="Real-time view of team capacity and agent activity."
      />
      <WorkloadMonitor
        workspaceId={workspace.id}
        members={membersWithCounts}
      />
    </>
  );
}
