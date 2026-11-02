import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { importIntercomDump } from "@/lib/import/intercom/import";
import { parseIntercomExport } from "@/lib/import/intercom/parse";
import { createPrismaImportStore } from "@/lib/import/intercom/prisma-store";
import {
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ERRORS,
  previewCounts,
} from "@/lib/import/intercom/types";
import { requireWorkspaceRole } from "@/lib/workspace";

export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function publicError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (/sk_live_|sk_test_|whsec_|gd_live_|gd_test_|password|token|secret/i.test(message)) {
      return "The export could not be read.";
    }
    return message;
  }
  return "The export could not be read.";
}

async function readPayload(req: NextRequest): Promise<{
  workspaceId: string;
  mode: "preview" | "commit";
  bytes: Buffer;
  fileName?: string;
}> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const workspaceId = String(form.get("workspaceId") ?? "");
    const mode = form.get("mode") === "commit" ? "commit" : "preview";
    const file = form.get("file");
    if (!workspaceId) throw new Error("workspaceId is required");
    if (!(file instanceof File)) throw new Error("Upload a JSON or zip export.");
    if (file.size > MAX_IMPORT_BYTES) {
      throw new Error(`The file is larger than ${MAX_IMPORT_BYTES} bytes.`);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    return { workspaceId, mode, bytes, fileName: file.name };
  }

  const body = await req.json();
  const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : "";
  if (!workspaceId) throw new Error("workspaceId is required");
  const mode = body.mode === "commit" ? "commit" : "preview";
  if (body.dump !== undefined) {
    const encoded = Buffer.from(JSON.stringify(body.dump), "utf8");
    if (encoded.length > MAX_IMPORT_BYTES) {
      throw new Error(`The dump is larger than ${MAX_IMPORT_BYTES} bytes.`);
    }
    return { workspaceId, mode, bytes: encoded, fileName: "dump.json" };
  }
  throw new Error("Upload a JSON or zip export.");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401);
    }

    let payload: Awaited<ReturnType<typeof readPayload>>;
    try {
      payload = await readPayload(req);
    } catch (error) {
      return jsonError(publicError(error), 400);
    }

    try {
      await requireWorkspaceRole(payload.workspaceId, session.user.id, [
        "OWNER",
        "ADMIN",
      ]);
    } catch {
      return jsonError("Insufficient permissions", 403);
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: payload.workspaceId },
      select: { id: true, slug: true },
    });
    if (!workspace) return jsonError("Workspace not found", 404);

    let dump;
    try {
      dump = parseIntercomExport(payload.bytes, payload.fileName);
    } catch (error) {
      return jsonError(publicError(error), 400);
    }

    const counts = previewCounts(dump);
    if (payload.mode === "preview") {
      return NextResponse.json({
        ok: true,
        mode: "preview",
        counts,
        warnings: dump.warnings,
      });
    }

    const store = createPrismaImportStore(prisma, workspace.id);
    const result = await importIntercomDump(
      dump,
      { workspaceId: workspace.id, authorId: session.user.id },
      store,
    );
    result.errors = result.errors.slice(0, MAX_IMPORT_ERRORS);

    revalidatePath(`/workspace/${workspace.slug}`);
    revalidatePath(`/workspace/${workspace.slug}/inbox`);
    revalidatePath(`/workspace/${workspace.slug}/customers`);
    revalidatePath(`/workspace/${workspace.slug}/articles`);
    revalidatePath(`/workspace/${workspace.slug}/settings/import`);
    revalidatePath(`/workspace/${workspace.slug}/settings/integrations`);

    return NextResponse.json({
      ok: true,
      mode: "commit",
      counts,
      result,
    });
  } catch (error) {
    console.error("Intercom import error:", error instanceof Error ? error.message : "unknown");
    return jsonError("Import failed", 500);
  }
}
