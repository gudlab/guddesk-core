import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { SegmentsList } from "@/components/customers/segments-list";
import { buildSegmentWhereClause } from "@/lib/segments/evaluate";
import type { SegmentCondition } from "@/lib/segments/evaluate";

export default async function SegmentsPage({
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

  const segments = await prisma.customerSegment.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  // Count customers for each segment
  const segmentsWithCounts = await Promise.all(
    segments.map(async (segment) => {
      const conditions = (segment.conditions as unknown as SegmentCondition[]) || [];
      const segmentWhere = buildSegmentWhereClause(conditions);
      const count = await prisma.visitor.count({
        where: { workspaceId: workspace.id, ...segmentWhere },
      });
      return { ...segment, customerCount: count };
    }),
  );

  // Fetch custom fields for condition builder field options
  const customFields = await prisma.customField.findMany({
    where: { workspaceId: workspace.id, entityType: "customer" },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, key: true, fieldType: true, enumOptions: true },
  });

  return (
    <>
      <DashboardHeader
        heading="Customer Segments"
        text="Create saved filters to group customers by conditions."
      />

      <SegmentsList
        segments={segmentsWithCounts}
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        customFields={customFields}
      />
    </>
  );
}
