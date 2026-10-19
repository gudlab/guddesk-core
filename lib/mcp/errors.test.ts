import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { Prisma, WorkspaceRole } from "@prisma/client";

import { prisma } from "@/lib/db";

import { mcpInternalError } from "./errors";
import { createMcpServer, type McpToolRegistrar } from "./server";

type ToolResult = {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
};

// A Prisma message as it really looks: it names the server file and line.
const PRISMA_MESSAGE = [
  "",
  "Invalid `prisma.workspaceMember.findMany()` invocation in",
  "/Users/someone/guddesk-core/lib/mcp/tools/workspace.ts:69:52",
  "",
  "  66 const members = await prisma.workspaceMember.findMany({",
  "Invalid value for argument `role`. Expected WorkspaceRole.",
].join("\n");

const LEAK_PATTERNS = [
  /prisma/i,
  /invocation/i,
  /\/Users\//,
  /\.ts:\d+/,
  /workspaceMember/,
];

function text(result: ToolResult): string {
  return result.content?.map((part) => part.text ?? "").join("\n") ?? "";
}

function assertNoLeak(result: ToolResult) {
  for (const pattern of LEAK_PATTERNS) {
    assert.doesNotMatch(text(result), pattern);
  }
}

async function connect(
  permission = "READ_ONLY",
  registrars?: readonly McpToolRegistrar[],
) {
  const server = createMcpServer(
    {
      userId: "user_1",
      workspaceId: "ws_1",
      apiKeyId: "key_1",
      permission: permission as never,
    },
    registrars,
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "errors-test", version: "1.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return {
    client,
    async call(name: string, args: Record<string, unknown> = {}) {
      return (await client.callTool({
        name,
        arguments: args,
      })) as ToolResult;
    },
    async close() {
      await client.close();
      await server.close();
    },
  };
}

type FindMany = (args: { where: Record<string, unknown> }) => Promise<unknown>;
const delegate = prisma.workspaceMember as unknown as { findMany: FindMany };
const originalFindMany = delegate.findMany;

afterEach(() => {
  delegate.findMany = originalFindMany;
  mock.restoreAll();
});

describe("list_workspace_members role filter (#23)", () => {
  it("offers exactly the Prisma WorkspaceRole values", async () => {
    const session = await connect();
    try {
      const { tools } = await session.client.listTools();
      const tool = tools.find((t) => t.name === "list_workspace_members");
      const role = (
        tool?.inputSchema as { properties?: { role?: { enum?: string[] } } }
      ).properties?.role;
      assert.deepEqual(role?.enum, Object.values(WorkspaceRole));
      assert.deepEqual(Object.values(WorkspaceRole), [
        "OWNER",
        "ADMIN",
        "AGENT",
        "VIEWER",
      ]);
    } finally {
      await session.close();
    }
  });

  it("filters by each real role", async () => {
    const wheres: Array<Record<string, unknown>> = [];
    delegate.findMany = async ({ where }) => {
      wheres.push(where);
      return [{ id: "m_1", role: where.role }];
    };
    const session = await connect();
    try {
      for (const role of Object.values(WorkspaceRole)) {
        const result = await session.call("list_workspace_members", { role });
        assert.notEqual(result.isError, true, role);
        assert.equal(JSON.parse(text(result)).items[0].role, role);
      }
      await session.call("list_workspace_members");
    } finally {
      await session.close();
    }
    assert.deepEqual(wheres, [
      ...Object.values(WorkspaceRole).map((role) => ({
        workspaceId: "ws_1",
        role,
      })),
      { workspaceId: "ws_1" },
    ]);
  });

  it("refuses an unknown role with a clean validation error", async () => {
    let calls = 0;
    delegate.findMany = async () => {
      calls += 1;
      return [];
    };
    const session = await connect();
    try {
      for (const role of ["MEMBER", "owner", "SUPERADMIN", ""]) {
        const result = await session.call("list_workspace_members", { role });
        assert.equal(result.isError, true, role);
        assert.match(text(result), /validation/i, role);
        assert.match(text(result), /OWNER/, role);
        assertNoLeak(result);
      }
    } finally {
      await session.close();
    }
    assert.equal(calls, 0, "Prisma is never called with a bad role");
  });
});

describe("MCP tool errors stay generic", () => {
  it("does not return Prisma error text from a real tool", async () => {
    const logged = mock.method(console, "error", () => {});
    delegate.findMany = async () => {
      throw new Prisma.PrismaClientKnownRequestError(PRISMA_MESSAGE, {
        code: "P2009",
        clientVersion: Prisma.prismaVersion.client,
      });
    };
    const session = await connect();
    try {
      const result = await session.call("list_workspace_members", {
        role: "AGENT",
      });
      assert.equal(result.isError, true);
      assert.deepEqual(result, mcpInternalError("list_workspace_members"));
      assertNoLeak(result);
    } finally {
      await session.close();
    }
    assert.equal(logged.mock.callCount(), 1);
    assert.match(
      String(logged.mock.calls[0].arguments[0]),
      /list_workspace_members/,
    );
  });

  it("covers plain errors, non-Error throws and callbacks set with update()", async () => {
    mock.method(console, "error", () => {});
    let tool: RegisteredTool | undefined;
    const registrar: McpToolRegistrar = (server) => {
      server.registerTool(
        "list_conversations",
        { description: "x" },
        async () => {
          throw new Error(`ENOENT: no such file, open '/var/task/lib/db.ts'`);
        },
      );
      server.registerTool(
        "get_conversation",
        { description: "x" },
        async () => {
          throw "/srv/app/.env";
        },
      );
      tool = server.registerTool(
        "list_messages",
        { description: "x" },
        async () => ({
          content: [{ type: "text" as const, text: "ok" }],
        }),
      );
    };
    const session = await connect("READ_ONLY", [registrar]);
    try {
      tool!.update({
        callback: async () => {
          throw new Error(PRISMA_MESSAGE);
        },
      });
      for (const name of [
        "list_conversations",
        "get_conversation",
        "list_messages",
      ]) {
        const result = await session.call(name);
        assert.deepEqual(result, mcpInternalError(name), name);
        assert.doesNotMatch(
          text(result),
          /\/var\/task|\/srv\/app|ENOENT|\.env/,
        );
        assertNoLeak(result);
      }
    } finally {
      await session.close();
    }
  });

  it("still lets McpError through and still refuses before the handler", async () => {
    mock.method(console, "error", () => {});
    let ran = 0;
    const registrar: McpToolRegistrar = (server) => {
      server.registerTool(
        "list_conversations",
        { description: "x" },
        async () => {
          throw new McpError(ErrorCode.InvalidParams, "Conversation not found");
        },
      );
      server.registerTool("send_message", { description: "x" }, async () => {
        ran += 1;
        throw new Error(PRISMA_MESSAGE);
      });
    };
    const session = await connect("READ_ONLY", [registrar]);
    try {
      const passed = await session.call("list_conversations");
      assert.equal(passed.isError, true);
      assert.match(text(passed), /Conversation not found/);

      const refused = await session.call("send_message");
      assert.match(text(refused), /read-only/);
      assert.equal(ran, 0);
    } finally {
      await session.close();
    }
  });
});
