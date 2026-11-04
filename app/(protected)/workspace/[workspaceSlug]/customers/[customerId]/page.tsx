import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getWorkspaceBySlug, requireWorkspaceMember } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { CustomerDetail } from "@/components/customers/customer-detail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; customerId: string }>;
}) {
  const { workspaceSlug, customerId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) redirect("/dashboard");

  await requireWorkspaceMember(workspace.id, user.id!);

  const [customer, companies, customFields, recentEvents] = await Promise.all([
    prisma.visitor.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        workspaceId: true,
        externalId: true,
        name: true,
        email: true,
        avatarUrl: true,
        companyId: true,
        metadata: true,
        lastSeenAt: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, domain: true },
        },
        conversations: {
          select: {
            id: true,
            status: true,
            subject: true,
            tags: true,
            lastMessageAt: true,
            lastMessagePreview: true,
            createdAt: true,
          },
          orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
        },
        _count: { select: { conversations: true } },
      },
    }),
    // Fetch all companies for the assign-to-company dropdown
    prisma.company.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, domain: true },
      orderBy: { name: "asc" },
    }),
    // Fetch custom fields for customer entity type
    prisma.customField.findMany({
      where: { workspaceId: workspace.id, entityType: "customer" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
    // Fetch recent timeline events
    prisma.customerEvent.findMany({
      where: { visitorId: customerId, workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!customer || customer.workspaceId !== workspace.id) {
    notFound();
  }

  // Strip workspaceId before passing to client
  const { workspaceId: _ws, ...customerData } = customer;

  return (
    <>
      <DashboardHeader
        heading={customer.name || customer.email || "Anonymous Visitor"}
        text="Customer profile"
      >
        <Link href={`/workspace/${workspaceSlug}/customers`}>
          <Button variant="outline" size="sm">
            <Icons.chevronLeft className="mr-1 size-4" />
            Back to Customers
          </Button>
        </Link>
      </DashboardHeader>

      <CustomerDetail
        customer={customerData}
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        companies={companies}
        customFields={customFields}
        events={recentEvents}
      />
    </>
  );
}
