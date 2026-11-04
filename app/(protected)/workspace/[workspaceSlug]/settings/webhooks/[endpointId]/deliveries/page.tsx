import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceRole } from "@/lib/workspace";
import { DashboardHeader } from "@/components/dashboard/header";
import { WebhookDeliveryLog } from "@/components/integrations/webhook-delivery-log";

export default async function WebhookDeliveriesPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; endpointId: string }>;
}) {
  const { workspaceSlug, endpointId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  await requireWorkspaceRole(workspace.id, user.id!, ["OWNER", "ADMIN"]);

  const endpoint = await prisma.webhookEndpoint.findUnique({
    where: { id: endpointId },
    select: {
      id: true,
      url: true,
      workspaceId: true,
    },
  });

  if (!endpoint || endpoint.workspaceId !== workspace.id) {
    redirect(`/workspace/${workspaceSlug}/settings/webhooks`);
  }

  // Fetch initial deliveries
  const deliveries = await prisma.webhookDelivery.findMany({
    where: { endpointId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      event: true,
      status: true,
      attemptCount: true,
      maxAttempts: true,
      httpStatus: true,
      durationMs: true,
      errorMessage: true,
      createdAt: true,
      completedAt: true,
    },
  });

  // Summary stats
  const [totalCount, successCount, failedCount, pendingCount] = await Promise.all([
    prisma.webhookDelivery.count({ where: { endpointId } }),
    prisma.webhookDelivery.count({ where: { endpointId, status: "SUCCESS" } }),
    prisma.webhookDelivery.count({ where: { endpointId, status: "FAILED" } }),
    prisma.webhookDelivery.count({ where: { endpointId, status: "PENDING" } }),
  ]);

  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <>
      <DashboardHeader
        heading="Delivery Logs"
        text={endpoint.url}
      />
      <WebhookDeliveryLog
        endpointId={endpointId}
        workspaceId={workspace.id}
        initialDeliveries={deliveries}
        stats={{
          total: totalCount,
          successRate,
          failed: failedCount,
          pending: pendingCount,
        }}
      />
    </>
  );
}
