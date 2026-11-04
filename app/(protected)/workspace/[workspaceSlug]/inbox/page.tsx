import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember, getWorkspaceMembers } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { getConversationLimitBanner } from "@/lib/feature-flags";
import { ConversationLimitBanner } from "@/components/billing/conversation-limit-banner";
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

  const membership = await requireWorkspaceMember(workspace.id, user.id!);

  const [members, cannedResponses, limitBanner] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    prisma.cannedResponse.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, title: true, body: true },
      orderBy: { title: "asc" },
    }),
    getConversationLimitBanner(workspace.id),
  ]);

  return (
    <>
      <DashboardHeader
        heading="Inbox"
        text="Manage all your customer conversations in one place."
      />
      {limitBanner && (
        <ConversationLimitBanner
          workspaceId={workspace.id}
          level={limitBanner.level}
          count={limitBanner.count}
          limit={limitBanner.limit}
          monthKey={limitBanner.monthKey}
          canUpgrade={membership.role === "OWNER"}
        />
      )}
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
