import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const read = (path: string) => readFileSync(join(__dirname, "..", "..", "..", path), "utf8");

/**
 * A customer reply to reply+ goes through the email channel's own customer
 * path (handleCustomerInbound -> EmailChannelProvider.handleInbound with the
 * thread), the same one support+ and its threading use. These pin what that
 * path does, so reply+ keeps it.
 */
describe("reply+ customer replies use the email channel's customer path", () => {
  const provider = read("lib/channels/email/provider.ts");
  const append = provider.slice(provider.indexOf("private async appendToConversation"));
  const appendBody = append.slice(0, append.indexOf("private async createNewConversation"));

  it("the route hands customer replies to EmailChannelProvider.handleInbound", () => {
    assert.match(read("app/api/email/inbound/route.ts"), /handleCustomerInbound: \(payload\) => emailProvider\.handleInbound\(payload\)/);
    assert.match(read("lib/inbound-email/handler.ts"), /deps\.handleCustomerInbound\(\{\s*workspaceId: conversation\.workspaceId,[\s\S]*?threadId: conversation\.id,/);
  });

  it("a threaded reply is appended to that email conversation", () => {
    assert.match(provider, /where: \{ id: threadId, workspaceId, channel: "EMAIL" \}/);
    assert.match(provider, /return this\.appendToConversation\(existing, workspaceId, from, fromName, body\);/);
  });

  it("appending respects autoReopen=false and fires message.created", () => {
    assert.match(appendBody, /conversation\.status === "CLOSED" && config\?\.autoReopen !== false/);
    assert.match(appendBody, /dispatchWebhooks\(workspaceId, "message\.created", \{/);
  });

  it("appending runs automations (message received, from the visitor)", () => {
    assert.match(appendBody, /fireAutomations\(\s*messageReceivedEvent\(\{[\s\S]*?origin: origin\("visitor"\),/);
  });
});
