/**
 * Access control for MCP tools.
 *
 * Every tool must have an entry in MCP_TOOL_ACCESS. "read" tools need a
 * READ_ONLY key or better. "write" tools (anything that creates, updates,
 * deletes or sends) need READ_WRITE or better, the same level the REST API
 * asks for on create and update routes.
 *
 * enforceMcpToolAccess() checks the key at tools/call dispatch and again inside
 * every tool handler. Registering a tool that is not in the map throws, so a
 * new tool cannot ship without an access level.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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

type ToolUpdates = { name?: unknown; callback?: unknown };
type UpdatableTool = { update: (updates: ToolUpdates) => void };

const BLOCKED_MESSAGE =
  "is not allowed on the GudDesk MCP server. Only tools registered with server.registerTool() are supported, so the API key permission check always runs.";

function blocked(api: string): () => never {
  return () => {
    throw new Error(`${api} ${BLOCKED_MESSAGE}`);
  };
}

function toolNameOf(request: unknown): string {
  const name = (request as { params?: { name?: unknown } } | undefined)?.params
    ?.name;
  return typeof name === "string" ? name : "";
}

/**
 * Patch `server` so the key's permission is checked on every tool call.
 * Call it before registering any tools.
 *
 * The check runs in two places:
 * - at tools/call dispatch, before the SDK looks up the tool or validates its
 *   arguments, so swapping a tool's handler cannot skip it
 * - inside each tool handler, including handlers set later with
 *   RegisteredTool.update({ callback })
 *
 * Every other way to add a request handler, resource, prompt or task tool
 * throws, because none of them would go through the check.
 */
export function enforceMcpToolAccess(
  server: McpServer,
  permission: unknown,
): McpServer {
  const guardHandler = (name: string, handler: AnyHandler): AnyHandler => {
    const access = mcpToolAccess(name);
    if (!access) {
      throw new Error(
        `MCP tool "${name}" has no access level. Add it to MCP_TOOL_ACCESS in lib/mcp/access.ts.`,
      );
    }
    return async (...args) => {
      if (!canCallMcpTool(permission, access)) {
        return mcpAccessRefusal(name, permission);
      }
      return handler(...args);
    };
  };

  // Dispatch level. McpServer installs its tools/list and tools/call handlers
  // through this method when the first tool is registered.
  const lowLevel = server.server;
  const setRequestHandler = lowLevel.setRequestHandler.bind(lowLevel) as (
    schema: unknown,
    handler: AnyHandler,
  ) => void;
  const guardedSetRequestHandler = (schema: unknown, handler: AnyHandler) => {
    if (schema === ListToolsRequestSchema) {
      return setRequestHandler(schema, handler);
    }
    if (schema === CallToolRequestSchema) {
      return setRequestHandler(schema, async (request, ...rest) => {
        const name = toolNameOf(request);
        const access = mcpToolAccess(name);
        if (!access) {
          return {
            isError: true,
            content: [{ type: "text", text: `Tool ${name} not found.` }],
          };
        }
        if (!canCallMcpTool(permission, access)) {
          return mcpAccessRefusal(name, permission);
        }
        return handler(request, ...rest);
      });
    }
    throw new Error(`server.server.setRequestHandler() ${BLOCKED_MESSAGE}`);
  };
  lowLevel.setRequestHandler =
    guardedSetRequestHandler as unknown as typeof lowLevel.setRequestHandler;
  Object.defineProperty(lowLevel, "fallbackRequestHandler", {
    configurable: false,
    get: () => undefined,
    set: blocked("server.server.fallbackRequestHandler"),
  });

  // Handler level.
  const register = server.registerTool.bind(server) as (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => UpdatableTool;
  const guardedRegisterTool = (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => {
    const tool = register(name, config, guardHandler(name, handler));
    const update = tool.update.bind(tool);
    tool.update = (updates: ToolUpdates) => {
      if (typeof updates.name === "string" && updates.name !== name) {
        throw new Error(
          `Renaming MCP tool "${name}" is not allowed. Register "${updates.name}" as a new tool instead.`,
        );
      }
      if (typeof updates.callback !== "undefined") {
        updates = {
          ...updates,
          callback: guardHandler(name, updates.callback as AnyHandler),
        };
      }
      return update(updates);
    };
    return tool;
  };
  server.registerTool =
    guardedRegisterTool as unknown as McpServer["registerTool"];

  // APIs that would add a handler without the check.
  server.tool = blocked("server.tool()") as unknown as McpServer["tool"];
  server.registerResource = blocked(
    "server.registerResource()",
  ) as unknown as McpServer["registerResource"];
  server.resource = blocked(
    "server.resource()",
  ) as unknown as McpServer["resource"];
  server.registerPrompt = blocked(
    "server.registerPrompt()",
  ) as unknown as McpServer["registerPrompt"];
  server.prompt = blocked("server.prompt()") as unknown as McpServer["prompt"];
  const tasks = server.experimental.tasks as unknown as Record<string, unknown>;
  tasks.registerToolTask = blocked(
    "server.experimental.tasks.registerToolTask()",
  );

  return server;
}
