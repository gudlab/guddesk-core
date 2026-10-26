import { WorkspaceRole } from "@prisma/client";
import * as z from "zod";

export const workspaceNameSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
});

export const workspaceSlugSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(30)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
});

export const workspaceInviteSchema = z.object({
  // Trimmed and lowercased, like account emails (lib/auth-email.ts).
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.AGENT, WorkspaceRole.VIEWER]),
});

export const workspaceMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.nativeEnum(WorkspaceRole),
});

export const workspaceSettingsSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  logo: z.string().url().optional().nullable(),
});
