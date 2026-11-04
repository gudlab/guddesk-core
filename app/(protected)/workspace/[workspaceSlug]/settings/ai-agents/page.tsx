import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getWorkspaceBySlug, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { AgentSettings } from "@/components/settings/agent-settings";
import { GudBotSettingsForm } from "@/components/settings/gudbot-settings";

export const metadata = constructMetadata({
  title: "AI – GudDesk",
  description: "GudBot and installed agents for this workspace.",
});

export default async function AIAgentsPage({
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

  const gudBotSettings = await prisma.gudBotSettings.findUnique({
    where: { workspaceId: workspace.id },
    select: {
      enabled: true,
      confidenceThreshold: true,
      maxTurns: true,
      handoffMessage: true,
    },
  });

  const agents = await prisma.agent.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      iconUrl: true,
      creatorName: true,
      creatorUrl: true,
      config: true,
      isEnabled: true,
      priority: true,
      installedAt: true,
      webhookEndpoint: {
        select: {
          id: true,
          url: true,
          isEnabled: true,
          onMessageCreated: true,
          onConversationCreated: true,
          onConversationClosed: true,
          onConversationAssigned: true,
        },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <DashboardHeader
        heading="AI"
        text="GudBot answers from your knowledge base. Installed agents use the API."
      />

      <div className="space-y-8">
        <GudBotSettingsForm
          workspaceId={workspace.id}
          settings={gudBotSettings}
        />

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Installed agents</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              External services that receive events and automate conversations
              via the API.
            </p>
          </div>
          <AgentSettings workspaceId={workspace.id} agents={agents} />
        </div>
      </div>
    </>
  );
}
