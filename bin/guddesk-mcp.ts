#!/usr/bin/env npx tsx

/**
 * GudDesk MCP Server — stdio transport.
 *
 * For use with Claude Desktop, Cursor, or any MCP client that supports stdio.
 *
 * Usage:
 *   GUDDESK_API_KEY=gd_... npx tsx bin/guddesk-mcp.ts
 *
 * Claude Desktop config (~/.claude/claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "guddesk": {
 *         "command": "npx",
 *         "args": ["tsx", "/path/to/guddesk/bin/guddesk-mcp.ts"],
 *         "env": { "GUDDESK_API_KEY": "gd_..." }
 *       }
 *     }
 *   }
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { authenticateMcp } from "../lib/mcp/auth";
import { createMcpServer } from "../lib/mcp/server";

async function main() {
  const apiKey = process.env.GUDDESK_API_KEY;

  if (!apiKey) {
    console.error("Error: GUDDESK_API_KEY environment variable is required.");
    console.error("Set it to a workspace-scoped GudDesk API key (starts with gd_).");
    process.exit(1);
  }

  const auth = await authenticateMcp(apiKey);

  if (!auth) {
    console.error("Error: Invalid or expired API key.");
    console.error("Make sure the key is enabled, not expired, and scoped to a workspace.");
    process.exit(1);
  }

  const server = createMcpServer(auth);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // The server is now running and will communicate via stdin/stdout.
  // It will exit when the client disconnects (stdin closes).
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
