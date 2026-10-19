/**
 * API key permission levels, shared by the REST API (lib/api-auth.ts) and
 * the MCP server (lib/mcp). Kept free of Next.js and "server-only" imports so
 * the stdio MCP script can use it too.
 *
 * Hierarchy: FULL_ACCESS > READ_WRITE > READ_ONLY. Any other value, including
 * null or undefined, has no level and fails every check.
 */
import type { ApiKeyPermission } from "@prisma/client";

export const API_KEY_PERMISSION_LEVELS: Readonly<
  Record<ApiKeyPermission, number>
> = {
  READ_ONLY: 1,
  READ_WRITE: 2,
  FULL_ACCESS: 3,
};

export function isApiKeyPermission(value: unknown): value is ApiKeyPermission {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(API_KEY_PERMISSION_LEVELS, value)
  );
}

/** True when `permission` is a known level at or above `required`. */
export function permissionAtLeast(
  permission: unknown,
  required: ApiKeyPermission,
): boolean {
  if (!isApiKeyPermission(permission)) return false;
  return (
    API_KEY_PERMISSION_LEVELS[permission] >= API_KEY_PERMISSION_LEVELS[required]
  );
}
