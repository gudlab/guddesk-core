import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { CustomersList } from "@/components/customers/customers-list";
import { buildSegmentWhereClause } from "@/lib/segments/evaluate";
import type { SegmentCondition } from "@/lib/segments/evaluate";

const PAGE_SIZE = 25;

interface CustomersPageProps {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ page?: string; search?: string; segment?: string }>;
}

export default async function CustomersPage({
  params,
  searchParams,
}: CustomersPageProps) {
  const { workspaceSlug } = await params;
  const query = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  await requireWorkspaceMember(workspace.id, user.id!);

  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const search = query.search?.trim() || undefined;
  const segmentId = query.segment || undefined;

  // Build where clause
  const where: Prisma.VisitorWhereInput = { workspaceId: workspace.id };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { externalId: { contains: search, mode: "insensitive" } },
    ];
  }

  // Apply segment conditions if a segment is selected
  let activeSegment: { id: string; name: string; color: string | null } | null = null;
  if (segmentId) {
    const segment = await prisma.customerSegment.findUnique({
      where: { id: segmentId },
      select: { id: true, name: true, color: true, conditions: true, workspaceId: true },
    });

    if (segment && segment.workspaceId === workspace.id) {
      activeSegment = { id: segment.id, name: segment.name, color: segment.color };
      const conditions = (segment.conditions as unknown as SegmentCondition[]) || [];
      const segmentWhere = buildSegmentWhereClause(conditions);
      Object.assign(where, segmentWhere);
    }
  }

  // Fetch all segments for the filter dropdown
  const [customers, total, segments] = await Promise.all([
    prisma.visitor.findMany({
      where,
      select: {
        id: true,
        externalId: true,
        name: true,
        email: true,
        avatarUrl: true,
        lastSeenAt: true,
        createdAt: true,
        _count: { select: { conversations: true } },
      },
      orderBy: [
        { lastSeenAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.visitor.count({ where }),
    prisma.customerSegment.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <DashboardHeader
        heading="Customers"
        text="View and manage your visitors and customers."
      >
        <Link href={`/workspace/${workspaceSlug}/customers/segments`}>
          <Button variant="outline" size="sm">
            Manage Segments
          </Button>
        </Link>
      </DashboardHeader>

      <CustomersList
        customers={customers}
        workspaceSlug={workspaceSlug}
        total={total}
        totalPages={totalPages}
        page={page}
        segments={segments}
        activeSegment={activeSegment}
      />
    </>
  );
}
