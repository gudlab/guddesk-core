import { redirect } from "next/navigation";

import { env } from "@/env.mjs";
import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { IdentityVerification } from "@/components/settings/identity-verification";
import { WidgetConfigurator } from "@/components/widget-preview/widget-configurator";

export default async function WidgetSettingsPage({
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

  const widgetSettings = await prisma.widgetSettings.findUnique({
    where: { workspaceId: workspace.id },
  });

  const appUrl = getAppUrl();

  return (
    <>
      <DashboardHeader
        heading="Chat Widget"
        text="Configure and install the chat widget."
      />

      <div className="space-y-8">
        {/* Install snippet */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-2 text-sm font-medium">Installation</h2>
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
            Add this two-line snippet to your website, just before the closing{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              &lt;/body&gt;
            </code>{" "}
            tag. Hosted workspaces should load the widget from{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              cdn.guddesk.com
            </code>
            . Use a{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              gd_pub_
            </code>{" "}
            app ID only — never put server API keys in the page.
          </p>
          <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
            <code>{`<script>window.GudDeskSettings={appId:"gd_pub_${workspace.appId}"}</script>
<script src="https://cdn.guddesk.com/widget.js" async></script>`}</code>
          </pre>
          {appUrl && !appUrl.includes("guddesk.com") ? (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              This instance is not guddesk.com. For local or self-hosted
              installs, keep the same app ID and load{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                {appUrl}/widget.js
              </code>{" "}
              instead of the CDN.
            </p>
          ) : null}
        </div>

        {/* Identity verification */}
        <IdentityVerification
          workspaceId={workspace.id}
          initialSecret={widgetSettings?.identitySecret ?? null}
        />

        {/* Widget configurator */}
        <WidgetConfigurator
          workspaceId={workspace.id}
          plan={workspace.plan}
          settings={{
            primaryColor: widgetSettings?.primaryColor ?? "#3ECF8E",
            position:
              (widgetSettings?.position as "bottom-right" | "bottom-left") ??
              "bottom-right",
            welcomeMessage:
              widgetSettings?.welcomeMessage ?? "Hi! How can we help you?",
            workspaceName: widgetSettings?.workspaceName ?? workspace.name,
            showBranding: widgetSettings?.showBranding ?? true,
            requireEmail: widgetSettings?.requireEmail ?? false,
            offlineFormTimeout: widgetSettings?.offlineFormTimeout ?? null,
            pageVisibilityMode:
              (widgetSettings?.pageVisibilityMode as "exclude" | "include") ??
              "exclude",
            pageVisibilityPatterns:
              (widgetSettings?.pageVisibilityPatterns as string[]) ?? [],
          }}
        />
      </div>
    </>
  );
}
