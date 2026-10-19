import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { withApiAuth, withHeaders, apiOk, apiError } from "@/lib/api-utils";

// ---------------------------------------------------------------------------
// GET /api/v1/customers/:customerId  —  Get a customer (visitor)
// Requires: READ_ONLY or higher
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;

  const result = await withApiAuth(req, { permission: "READ_ONLY" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    const customer = await prisma.visitor.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        workspaceId: true,
        externalId: true,
        name: true,
        email: true,
        avatarUrl: true,
        metadata: true,
        lastSeenAt: true,
        createdAt: true,
        conversations: {
          select: {
            id: true,
            status: true,
            subject: true,
            lastMessageAt: true,
            lastMessagePreview: true,
            createdAt: true,
          },
          orderBy: { lastMessageAt: "desc" },
          take: 10,
        },
        _count: { select: { conversations: true } },
      },
    });

    if (!customer || customer.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Customer not found", 404), rateLimitHeaders);
    }

    const { workspaceId: _ws, ...data } = customer;
    return withHeaders(apiOk(data), rateLimitHeaders);
  } catch (error) {
    console.error("Get customer error:", error);
    return withHeaders(apiError("Failed to get customer", 500), rateLimitHeaders);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/customers/:customerId  —  Update a customer (visitor)
// Requires: READ_WRITE or higher
// Body: { name?, email?, externalId?, avatarUrl?, metadata? }
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;

  const result = await withApiAuth(req, { permission: "READ_WRITE" });
  if (!result.ok) return result.response;
  const { ctx, rateLimitHeaders } = result;

  try {
    // Verify the customer exists and belongs to this workspace
    const existing = await prisma.visitor.findUnique({
      where: { id: customerId },
      select: { id: true, workspaceId: true },
    });

    if (!existing || existing.workspaceId !== ctx.workspaceId) {
      return withHeaders(apiError("Customer not found", 404), rateLimitHeaders);
    }

    const body = await req.json();
    const { name, email, externalId, avatarUrl, metadata } = body;

    // Build the update payload — only include fields that were provided
    const updateData: Prisma.VisitorUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (externalId !== undefined) updateData.externalId = externalId;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (metadata !== undefined) updateData.metadata = metadata;

    if (Object.keys(updateData).length === 0) {
      return withHeaders(
        apiError("No fields to update. Provide at least one of: name, email, externalId, avatarUrl, metadata.", 400),
        rateLimitHeaders,
      );
    }

    const updated = await prisma.visitor.update({
      where: { id: customerId },
      data: updateData,
      select: {
        id: true,
        externalId: true,
        name: true,
        email: true,
        avatarUrl: true,
        metadata: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    return withHeaders(apiOk(updated), rateLimitHeaders);
  } catch (error) {
    console.error("Update customer error:", error);
    return withHeaders(apiError("Failed to update customer", 500), rateLimitHeaders);
  }
}
