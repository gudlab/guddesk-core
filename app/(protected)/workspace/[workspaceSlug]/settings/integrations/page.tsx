import { redirect } from "next/navigation";

import { getAppUrl } from "@/lib/app-url";
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
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Agents can reply to conversations from their email. When a visitor
              sends a chat message, the assigned agent gets an email
              notification. Replying to that email posts the response back.
            </p>
            <div className="bg-muted mt-3 rounded p-3 font-mono text-sm">
              Inbound webhook endpoint:{" "}
              <code>{getAppUrl()}/api/email/inbound</code>
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Use this URL for reply-by-email. Cloud inbound receiving (customer
              mail into the inbox) is still being set up.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
