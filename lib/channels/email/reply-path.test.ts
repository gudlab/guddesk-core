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
    assert.match(provider, /return this\.appendToConversation\(existing, workspaceId, from, fromName, body, \{/);
  });

  it("reply+ (keepVisitor) never overwrites the visitor; support+ threading still updates it", () => {
    assert.match(provider, /return this\.appendToConversation\(existing, workspaceId, from, fromName, body, \{\s*keepVisitor: payload\.keepVisitor === true,\s*\}\);/);
    assert.match(appendBody, /if \(!options\.keepVisitor\) \{\s*await prisma\.visitor\.update\(\{\s*where: \{ id: conversation\.visitorId \},\s*data: \{\s*\.\.\.\(fromEmail && \{ email: fromEmail \}\),/);
    // The only visitor write in the append path is behind that check.
    assert.equal((appendBody.match(/prisma\.visitor\.update/g) ?? []).length, 1);
    assert.match(read("lib/inbound-email/handler.ts"), /threadId: conversation\.id,\s*keepVisitor: true,/);
  });

  it("the threaded message's senderName is the fromName the handler passes (\"Name (address)\" for a forwarded sender)", () => {
    assert.match(appendBody, /senderName: fromName \?\? fromEmail,/);
  });

  it("agent replies go to the conversation's visitor email (not the last sender)", () => {
    assert.match(read("actions/send-message.ts"), /visitorEmail: conversation\.visitor\?\.email \?\? null,/);
    assert.match(provider, /to: context\.visitorEmail,/);
  });

  it("appending respects autoReopen=false and fires message.created", () => {
    assert.match(appendBody, /conversation\.status === "CLOSED" && config\?\.autoReopen !== false/);
    assert.match(appendBody, /dispatchWebhooks\(workspaceId, "message\.created", \{/);
  });

  it("the unverified-reply bounce goes through sendEmail from emailFrom(), like every other notification", () => {
    const notifications = read("lib/email-notifications.ts");
    const bounce = notifications.slice(notifications.indexOf("export async function sendUnverifiedReplyBounce"));
    assert.match(bounce, /sendEmail\("unverified-reply-bounce", \{\s*from: emailFrom\(\),/);
    assert.doesNotMatch(bounce, /bounceFrom|guddesk\.com/);
    assert.doesNotMatch(notifications, /new Resend\(/);
    assert.match(read("lib/email/send.ts"), /\| "unverified-reply-bounce";/);
  });

  it("appending runs automations (message received, from the visitor)", () => {
    assert.match(appendBody, /fireAutomations\(\s*messageReceivedEvent\(\{[\s\S]*?origin: origin\("visitor"\),/);
  });
});
