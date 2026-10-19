/**
 * Access control for MCP tools.
 *
 * Every tool must have an entry in MCP_TOOL_ACCESS. "read" tools need a
 * READ_ONLY key or better. "write" tools (anything that creates, updates,
 * deletes or sends) need READ_WRITE or better, the same level the REST API
 * asks for on create and update routes.
 *
 * enforceMcpToolAccess() wraps the server's registerTool so the check runs
 * inside every tool handler. Registering a tool that is not in the map throws,
 * so a new tool cannot ship without an access level.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ApiKeyPermission } from "@prisma/client";

import { isApiKeyPermission, permissionAtLeast } from "../api-permissions";

export type McpToolAccess = "read" | "write";

export const MCP_TOOL_ACCESS: Readonly<Record<string, McpToolAccess>> = {
  // Conversations
  list_conversations: "read",
  get_conversation: "read",
  update_conversation: "write",
  assign_conversation: "write",
  close_conversation: "write",
  // Messages
  list_messages: "read",
  send_message: "write",
  add_internal_note: "write",
  // Customers
  list_customers: "read",
  get_customer: "read",
  update_customer: "write",
  list_customer_events: "read",
  // Companies
  list_companies: "read",
  get_company: "read",
  create_company: "write",
  update_company: "write",
  // Segments
  list_segments: "read",
  get_segment: "read",
  create_segment: "write",
  // Knowledge base
  list_articles: "read",
  get_article: "read",
  search_articles: "read",
  // Workspace and agents
  get_workspace: "read",
  list_workspace_members: "read",
  list_agents: "read",
  get_agent: "read",
};

export const MCP_REQUIRED_PERMISSION: Readonly<
  Record<McpToolAccess, ApiKeyPermission>
> = {
  read: "READ_ONLY",
  write: "READ_WRITE",
};

export function mcpToolAccess(name: string): McpToolAccess | undefined {
  return Object.prototype.hasOwnProperty.call(MCP_TOOL_ACCESS, name)
    ? MCP_TOOL_ACCESS[name]
    : undefined;
}

export function canCallMcpTool(
  permission: unknown,
  access: McpToolAccess,
): boolean {
  return permissionAtLeast(permission, MCP_REQUIRED_PERMISSION[access]);
}

export type McpToolRefusal = {
  isError: true;
  content: [{ type: "text"; text: string }];
};

export function mcpAccessRefusal(
  toolName: string,
  permission: unknown,
): McpToolRefusal {
  const text = !isApiKeyPermission(permission)
    ? `This API key has no valid permission level, so ${toolName} was refused. Create a new key in Settings > API Keys.`
    : permission === "READ_ONLY"
      ? `This API key is read-only. Use a key with write access to call ${toolName}.`
      : `This API key does not have the permission needed to call ${toolName}.`;
  return { isError: true, content: [{ type: "text", text }] };
}

type AnyHandler = (...args: unknown[]) => unknown;

/**
 * Patch `server` so every tool registered after this call checks the key's
 * permission before its handler runs. Call it before registering any tools.
 */
export function enforceMcpToolAccess(
  server: McpServer,
  permission: unknown,
): McpServer {
  const register = server.registerTool.bind(server) as (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => unknown;

  const guardedRegisterTool = (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => {
    const access = mcpToolAccess(name);
    if (!access) {
      throw new Error(
        `MCP tool "${name}" has no access level. Add it to MCP_TOOL_ACCESS in lib/mcp/access.ts.`,
      );
    }
    const guarded: AnyHandler = async (...args) => {
      if (!canCallMcpTool(permission, access)) {
        return mcpAccessRefusal(name, permission);
      }
      return handler(...args);
    };
    return register(name, config, guarded);
  };

  server.registerTool =
    guardedRegisterTool as unknown as McpServer["registerTool"];
  // The older server.tool() API would skip the check. Block it.
  server.tool = (() => {
    throw new Error(
      "Use server.registerTool() for GudDesk MCP tools so the API key permission check runs.",
    );
  }) as unknown as McpServer["tool"];

  return server;
}
