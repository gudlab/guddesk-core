/**
 * MCP Server factory.
 *
 * Creates a McpServer instance with all GudDesk tools registered,
 * scoped to the authenticated user's workspace.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { enforceMcpToolAccess } from "./access";
import type { McpAuthContext } from "./auth";
import { registerAgentTools } from "./tools/agents";
import { registerArticleTools } from "./tools/articles";
import { registerCompanyTools } from "./tools/companies";
import { registerConversationTools } from "./tools/conversations";
import { registerCustomerTools } from "./tools/customers";
import { registerMessageTools } from "./tools/messages";
import { registerSegmentTools } from "./tools/segments";
import { registerWorkspaceTools } from "./tools/workspace";

export type McpToolRegistrar = (
  server: McpServer,
  auth: McpAuthContext,
) => void;

export const MCP_TOOL_REGISTRARS: readonly McpToolRegistrar[] = [
  registerConversationTools,
  registerMessageTools,
  registerCustomerTools,
  registerArticleTools,
  registerWorkspaceTools,
  registerAgentTools,
  registerCompanyTools,
  registerSegmentTools,
];

/**
 * Create a fully-configured MCP server for the given auth context.
 *
 * Auth is resolved once at connection time and shared by all tool handlers.
 * Every tool is checked against the key's permission level (see access.ts).
 * Tests can pass their own registrars.
 */
export function createMcpServer(
  auth: McpAuthContext,
  registrars: readonly McpToolRegistrar[] = MCP_TOOL_REGISTRARS,
): McpServer {
  const server = new McpServer({
    name: "guddesk",
    version: "1.0.0",
  });

  enforceMcpToolAccess(server, auth.permission);

  for (const register of registrars) {
    register(server, auth);
  }

  return server;
}
