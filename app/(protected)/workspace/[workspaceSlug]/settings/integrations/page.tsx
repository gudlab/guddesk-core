import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { SlackSettings } from "@/components/integrations/slack-settings";
import { IntercomImporter } from "@/components/settings/intercom-importer";

export default async function IntegrationsPage({
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

  const slackIntegration = await prisma.slackIntegration.findUnique({
    where: { workspaceId: workspace.id },
  });

  return (
    <>
      <DashboardHeader
        heading="Integrations"
        text="Connect third-party services to your workspace."
      />
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-medium">Intercom</h2>
          <IntercomImporter workspaceId={workspace.id} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">Slack</h2>
          <SlackSettings
            workspaceId={workspace.id}
            integration={slackIntegration}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">Email (Reply-by-Email)</h2>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Agents can reply to conversations directly from their email.
              When a visitor sends a message, the assigned agent receives an
              email notification. Replying to that email posts the response
              back to the conversation.
            </p>
            <div className="mt-3 rounded bg-muted p-3 font-mono text-xs">
              Inbound webhook endpoint:{" "}
              <code>{process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/email/inbound</code>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Configure this URL as a Resend inbound webhook to enable
              reply-by-email.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
