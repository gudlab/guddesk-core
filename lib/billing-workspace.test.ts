import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { billingHref, pickBillingWorkspace } from "./billing-workspace";

const workspaces = [
  { id: "ws_admin", role: "ADMIN" },
  { id: "ws_owned_1", role: "OWNER" },
  { id: "ws_owned_2", role: "OWNER" },
];

describe("billing workspace", () => {
  it("links upgrade prompts to the workspace", () => {
    assert.equal(billingHref("ws_1"), "/dashboard/billing?workspace=ws_1");
  });

  it("shows the requested workspace when the user owns it", () => {
    assert.deepEqual(pickBillingWorkspace(workspaces, "ws_owned_2"), {
      workspace: workspaces[2],
      requestedNotOwned: false,
    });
  });

  it("shows only the note for a workspace the user is in but doesn't own, not their own billing", () => {
    assert.deepEqual(pickBillingWorkspace(workspaces, "ws_admin"), {
      workspace: null,
      requestedNotOwned: true,
    });
  });

  it("ignores a workspace the user isn't in", () => {
    assert.deepEqual(pickBillingWorkspace(workspaces, "ws_someone_else"), {
      workspace: workspaces[1],
      requestedNotOwned: false,
    });
  });

  it("keeps the old behaviour without a requested workspace", () => {
    assert.equal(pickBillingWorkspace(workspaces, null).workspace?.id, "ws_owned_1");
    assert.deepEqual(pickBillingWorkspace([{ id: "x", role: "AGENT" }], "x"), {
      workspace: null,
      requestedNotOwned: true,
    });
  });
});
