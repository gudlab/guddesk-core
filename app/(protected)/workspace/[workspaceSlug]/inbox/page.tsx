import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember, getWorkspaceMembers } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { InboxLayout } from "@/components/inbox/inbox-layout";

export default async function InboxPage({
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

  const [members, cannedResponses] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    prisma.cannedResponse.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, title: true, body: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <>
      <DashboardHeader
        heading="Inbox"
        text="Manage all your customer conversations in one place."
      />
      <InboxLayout
        workspaceId={workspace.id}
        currentUserId={user.id!}
        currentUserName={user.name ?? "Agent"}
        members={members.map((m) => ({
          id: m.id,
          userId: m.userId,
          availability: m.availability,
          user: { name: m.user.name, image: m.user.image },
        }))}
        cannedResponses={cannedResponses}
      />
    </>
  );
}
