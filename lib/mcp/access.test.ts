import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { permissionAtLeast } from "../api-permissions";
import {
  enforceMcpToolAccess,
  MCP_TOOL_ACCESS,
  type McpToolAccess,
} from "./access";
import { createMcpServer, type McpToolRegistrar } from "./server";

type ToolResult = {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
};

type JsonSchema = {
  type?: string;
  enum?: unknown[];
  minimum?: number;
  properties?: Record<string, JsonSchema>;
  required?: string[];
};

const UNKNOWN_PERMISSIONS: unknown[] = [
  undefined,
  null,
  "",
  "ADMIN",
  "read_write",
  42,
];

async function connect(
  permission: unknown,
  registrars?: readonly McpToolRegistrar[],
) {
  const server = createMcpServer(
    {
      userId: "user_1",
      workspaceId: "ws_1",
      apiKeyId: "key_1",
      permission: permission as string,
    },
    registrars,
  );
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "access-test", version: "1.0.0" });
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

/** Smallest arguments that pass a tool's input schema. */
function validArgs(schema: JsonSchema | undefined): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  for (const key of schema?.required ?? []) {
    const prop = schema?.properties?.[key] ?? {};
    if (prop.enum?.length) args[key] = prop.enum[0];
    else if (prop.type === "string") args[key] = "test_id";
    else if (prop.type === "number" || prop.type === "integer")
      args[key] = prop.minimum ?? 0;
    else if (prop.type === "boolean") args[key] = false;
    else if (prop.type === "array") args[key] = [];
    else args[key] = {};
  }
  return args;
}

function text(result: ToolResult): string {
  return result.content?.map((part) => part.text ?? "").join("\n") ?? "";
}

function toolsWithAccess(access: McpToolAccess): string[] {
  return Object.entries(MCP_TOOL_ACCESS)
    .filter(([, value]) => value === access)
    .map(([name]) => name);
}

/** Fake tools that never touch the database. */
const fakeRegistrar: McpToolRegistrar = (server) => {
  for (const name of ["list_conversations", "send_message", "create_company"]) {
    server.registerTool(name, { description: `fake ${name}` }, async () => ({
      content: [{ type: "text" as const, text: `ran ${name}` }],
    }));
  }
};

describe("MCP tool access map", () => {
  it("gives every registered tool an access level", async () => {
    const session = await connect("READ_ONLY");
    try {
      const { tools } = await session.client.listTools();
      const registered = tools.map((tool) => tool.name).sort();
      assert.ok(registered.length > 0);
      assert.deepEqual(registered, Object.keys(MCP_TOOL_ACCESS).sort());
    } finally {
      await session.close();
    }
  });

  it("refuses to register a tool with no access level", () => {
    const server = enforceMcpToolAccess(
      new McpServer({ name: "t", version: "1" }),
      "FULL_ACCESS",
    );
    assert.throws(
      () =>
        server.registerTool(
          "delete_everything",
          { description: "x" },
          async () => ({
            content: [],
          }),
        ),
      /no access level/,
    );
  });

  it("blocks the older server.tool() API", () => {
    const server = enforceMcpToolAccess(
      new McpServer({ name: "t", version: "1" }),
      "FULL_ACCESS",
    );
    assert.throws(
      () => server.tool("list_conversations", async () => ({ content: [] })),
      /registerTool/,
    );
  });
});

describe("MCP permission checks on the real tools", () => {
  it("refuses a Read Only key on every write tool", async () => {
    const session = await connect("READ_ONLY");
    try {
      const { tools } = await session.client.listTools();
      const writeTools = tools.filter(
        (tool) => MCP_TOOL_ACCESS[tool.name] === "write",
      );
      assert.equal(writeTools.length, toolsWithAccess("write").length);
      assert.ok(writeTools.length > 0);
      for (const tool of writeTools) {
        const result = await session.call(
          tool.name,
          validArgs(tool.inputSchema as JsonSchema),
        );
        assert.equal(result.isError, true, tool.name);
        assert.equal(
          text(result),
          `This API key is read-only. Use a key with write access to call ${tool.name}.`,
        );
      }
    } finally {
      await session.close();
    }
  });

  it("refuses unknown or missing permissions on every write tool", async () => {
    for (const permission of UNKNOWN_PERMISSIONS) {
      const session = await connect(permission);
      try {
        const { tools } = await session.client.listTools();
        for (const tool of tools) {
          if (MCP_TOOL_ACCESS[tool.name] !== "write") continue;
          const result = await session.call(
            tool.name,
            validArgs(tool.inputSchema as JsonSchema),
          );
          assert.equal(
            result.isError,
            true,
            `${String(permission)} ${tool.name}`,
          );
          assert.match(text(result), /no valid permission level/);
        }
      } finally {
        await session.close();
      }
    }
  });
});

describe("MCP permission checks with fake tools", () => {
  it("lets a Read Only key call a read tool", async () => {
    const session = await connect("READ_ONLY", [fakeRegistrar]);
    try {
      const result = await session.call("list_conversations");
      assert.notEqual(result.isError, true);
      assert.equal(text(result), "ran list_conversations");
    } finally {
      await session.close();
    }
  });

  it("refuses a Read Only key on a write tool before the handler runs", async () => {
    const session = await connect("READ_ONLY", [fakeRegistrar]);
    try {
      const result = await session.call("send_message");
      assert.equal(result.isError, true);
      assert.doesNotMatch(text(result), /ran send_message/);
    } finally {
      await session.close();
    }
  });

  for (const permission of ["READ_WRITE", "FULL_ACCESS"]) {
    it(`lets a ${permission} key call read and write tools`, async () => {
      const session = await connect(permission, [fakeRegistrar]);
      try {
        for (const name of [
          "list_conversations",
          "send_message",
          "create_company",
        ]) {
          const result = await session.call(name);
          assert.notEqual(result.isError, true, name);
          assert.equal(text(result), `ran ${name}`);
        }
      } finally {
        await session.close();
      }
    });
  }

  it("refuses an unknown permission on read tools too, like the REST API", async () => {
    const session = await connect("ADMIN", [fakeRegistrar]);
    try {
      const result = await session.call("list_conversations");
      assert.equal(result.isError, true);
      assert.match(text(result), /no valid permission level/);
    } finally {
      await session.close();
    }
  });
});

describe("permissionAtLeast", () => {
  it("follows FULL_ACCESS > READ_WRITE > READ_ONLY", () => {
    assert.equal(permissionAtLeast("READ_ONLY", "READ_ONLY"), true);
    assert.equal(permissionAtLeast("READ_ONLY", "READ_WRITE"), false);
    assert.equal(permissionAtLeast("READ_WRITE", "READ_WRITE"), true);
    assert.equal(permissionAtLeast("READ_WRITE", "FULL_ACCESS"), false);
    assert.equal(permissionAtLeast("FULL_ACCESS", "READ_WRITE"), true);
  });

  it("fails closed for unknown values", () => {
    for (const permission of [
      ...UNKNOWN_PERMISSIONS,
      "toString",
      "__proto__",
    ]) {
      assert.equal(permissionAtLeast(permission, "READ_ONLY"), false);
    }
  });
});
