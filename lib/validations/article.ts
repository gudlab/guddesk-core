import { z } from "zod";

import {
  HELP_SLUG_MAX,
  isReservedCollectionSlug,
  normalizeSlug,
} from "@/lib/help-center/slug";

const slugSchema = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" ? normalizeSlug(value, maxLength) : value,
    z
      .string()
      .min(1)
      .max(maxLength)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase letters, numbers, and single hyphens",
      ),
  );

export const articleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema(HELP_SLUG_MAX.article),
  body: z.string().min(1).max(100000),
  excerpt: z.string().max(500).optional(),
  collectionId: z.string().min(1).nullable(),
  isPublished: z.boolean().optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema(HELP_SLUG_MAX.collection).refine(
    (slug) => !isReservedCollectionSlug(slug),
    { message: "That slug is reserved for help center search" },
  ),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
});

export const helpCenterSettingsSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  subtitle: z.string().max(300).optional(),
  primaryColor: z.string().max(20).optional(),
  logoUrl: z.string().url().optional().nullable(),
});
