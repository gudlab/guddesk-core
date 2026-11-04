import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { workspaceInviteSchema } from "./workspace";

describe("workspaceInviteSchema", () => {
  it("trims and lowercases the email", () => {
    const parsed = workspaceInviteSchema.parse({ email: "  Person@Example.COM ", role: "AGENT" });
    assert.equal(parsed.email, "person@example.com");
  });

  it("still rejects an invalid email", () => {
    assert.equal(workspaceInviteSchema.safeParse({ email: " not-an-email ", role: "AGENT" }).success, false);
  });
});
