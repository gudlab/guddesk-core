import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserWorkspaces } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { pickBillingWorkspace } from "@/lib/billing-workspace";
import { checkWorkspaceLimits } from "@/lib/feature-flags";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingPanel } from "@/components/billing/billing-panel";

export const metadata = constructMetadata({
  title: "Billing – GudDesk",
  description: "Manage your subscription and billing.",
});

export default async function AccountBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // ?workspace=<id> (from upgrade prompts) when the user owns it. A member
  // who isn't the owner gets only the "ask the owner" note. With no
  // ?workspace, the first workspace they own.
  const { workspace: requested } = await searchParams;
  const workspaces = await getUserWorkspaces(user.id!);
  const { workspace: ownedWorkspace, requestedNotOwned } = pickBillingWorkspace(
    workspaces,
    typeof requested === "string" ? requested : null,
  );

  const notOwnerNote = requestedNotOwned ? (
    <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
      Only the workspace owner can change its plan. Ask the workspace owner to upgrade.
    </div>
  ) : null;

  if (!ownedWorkspace) {
    return (
      <>
        <DashboardHeader
          heading="Billing & Plan"
          text="Manage your subscription and billing."
        />
        {notOwnerNote}
        {!requestedNotOwned && (
          <div className="rounded-lg border p-6 text-center text-muted-foreground">
            <p>Create a workspace to manage your billing and subscription.</p>
          </div>
        )}
      </>
    );
  }

  const [usage, workspace] = await Promise.all([
    checkWorkspaceLimits(ownedWorkspace.id),
    prisma.workspace.findUnique({
      where: { id: ownedWorkspace.id },
      select: { stripeCustomerId: true },
    }),
  ]);

  return (
    <>
      <DashboardHeader
        heading="Billing & Plan"
        text="Manage your subscription and billing."
      />
      {notOwnerNote}
      <BillingPanel
        workspaceId={ownedWorkspace.id}
        plan={usage.plan}
        currentSeats={usage.currentSeats}
        maxSeats={usage.limits.maxSeats}
        currentConversations={usage.currentMonthConversations}
        maxConversations={usage.limits.maxConversationsPerMonth}
        aiEnabled={usage.limits.aiEnabled}
        hasStripe={!!workspace?.stripeCustomerId}
      />
    </>
  );
}
