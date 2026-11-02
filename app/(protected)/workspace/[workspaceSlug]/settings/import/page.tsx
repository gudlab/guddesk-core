import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { IntercomImporter } from "@/components/settings/intercom-importer";

export default async function ImportSettingsPage({
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

  return (
    <>
      <DashboardHeader
        heading="Import"
        text="Bring contacts, help articles, and conversations from an Intercom export."
      />
      <div className="max-w-2xl space-y-6">
        <IntercomImporter workspaceId={workspace.id} />
        <p className="text-sm text-muted-foreground">
          Docs: how to shape the export and what the sample fixture contains is
          in{" "}
          <a href="/docs/integrations/intercom" className="underline">
            Intercom import
          </a>
          .
        </p>
      </div>
    </>
  );
}
