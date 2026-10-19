#!/usr/bin/env npx tsx

/**
 * GudDesk MCP Server, stdio transport.
 *
 * For use with Claude Desktop, Cursor, or any MCP client that supports stdio.
 * It needs only DATABASE_URL and GUDDESK_API_KEY. The rest of the app env
 * (AUTH_SECRET, RESEND_API_KEY and so on) is not checked here.
 *
 * Usage, from the repo folder:
 *   DATABASE_URL=postgresql://... GUDDESK_API_KEY=gd_... npx tsx bin/guddesk-mcp.ts
 *
 * Claude Desktop config. On macOS the file is
 * ~/Library/Application Support/Claude/claude_desktop_config.json, on Windows
 * %APPDATA%\Claude\claude_desktop_config.json. Keep --tsconfig, because Claude
 * Desktop does not start the script from the repo folder and the @/ imports
 * need it to resolve:
 *   {
 *     "mcpServers": {
 *       "guddesk": {
 *         "command": "npx",
 *         "args": [
 *           "tsx",
 *           "--tsconfig",
 *           "/path/to/guddesk-core/tsconfig.json",
 *           "/path/to/guddesk-core/bin/guddesk-mcp.ts"
 *         ],
 *         "env": {
 *           "DATABASE_URL": "postgresql://...",
 *           "GUDDESK_API_KEY": "gd_..."
 *         }
 *       }
 *     }
 *   }
 */

// env.mjs validates the whole Next.js app env when it is first imported, and
// some tools import it through lib/pusher-server. Skip that check before any
// app module loads. The app modules are imported dynamically below so this
// line runs first.
process.env.SKIP_ENV_VALIDATION = "1";

async function main() {
  const apiKey = process.env.GUDDESK_API_KEY;

  if (!apiKey) {
    console.error("Error: GUDDESK_API_KEY environment variable is required.");
    console.error(
      "Set it to a workspace-scoped GudDesk API key (starts with gd_).",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is required.");
    console.error(
      "Set it to the database of the GudDesk instance that issued the key.",
    );
    process.exit(1);
  }

  const { StdioServerTransport } =
    await import("@modelcontextprotocol/sdk/server/stdio.js");
  const { authenticateMcp } = await import("../lib/mcp/auth");
  const { createMcpServer } = await import("../lib/mcp/server");

  const auth = await authenticateMcp(apiKey);

  if (!auth) {
    console.error("Error: Invalid or expired API key.");
    console.error(
      "Make sure the key is enabled, not expired, and scoped to a workspace.",
    );
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
