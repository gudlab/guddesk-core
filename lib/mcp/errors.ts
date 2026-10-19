/**
 * Keep server errors out of MCP responses.
 *
 * When a tool handler throws, the MCP SDK returns the error's message to the
 * client. Prisma messages include server file paths, line numbers and query
 * details, so withSafeToolErrors() wraps every tool handler: a thrown error
 * is logged on the server and the client gets a generic message instead.
 *
 * McpError is passed through, because the SDK builds those messages itself
 * and some of them (for example URL elicitation) must reach the client.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";

type AnyHandler = (...args: unknown[]) => unknown;
type ToolUpdates = { callback?: unknown };
type UpdatableTool = { update: (updates: ToolUpdates) => void };

export type McpToolErrorLogger = (toolName: string, error: unknown) => void;

const defaultLogger: McpToolErrorLogger = (toolName, error) => {
  // stderr only. In the stdio server, stdout carries the MCP protocol.
  console.error(`[mcp] tool ${toolName} failed:`, error);
};

export function mcpInternalError(toolName: string) {
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: `${toolName} failed because of a server error. Try again, and contact support if it keeps happening.`,
      },
    ],
  };
}

function safeHandler(
  toolName: string,
  handler: AnyHandler,
  log: McpToolErrorLogger,
): AnyHandler {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof McpError) throw error;
      log(toolName, error);
      return mcpInternalError(toolName);
    }
  };
}

/**
 * Patch `server` so every tool registered after this call, and every
 * callback set later with RegisteredTool.update(), returns a generic error
 * instead of the thrown error's message. Call it before registering tools.
 */
export function withSafeToolErrors(
  server: McpServer,
  log: McpToolErrorLogger = defaultLogger,
): McpServer {
  const register = server.registerTool.bind(server) as (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => UpdatableTool;

  const safeRegisterTool = (
    name: string,
    config: unknown,
    handler: AnyHandler,
  ) => {
    const tool = register(name, config, safeHandler(name, handler, log));
    const update = tool.update.bind(tool);
    tool.update = (updates: ToolUpdates) =>
      update(
        typeof updates.callback === "undefined"
          ? updates
          : {
              ...updates,
              callback: safeHandler(name, updates.callback as AnyHandler, log),
            },
      );
    return tool;
  };

  server.registerTool =
    safeRegisterTool as unknown as McpServer["registerTool"];
  return server;
}
