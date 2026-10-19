import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hasIdentityChanges } from "./widget-identify-changes";

const stored = {
  externalId: "user_1",
  name: "Jane",
  email: "jane@acme.test",
};

describe("hasIdentityChanges", () => {
  it("is false when nothing changed", () => {
    assert.equal(
      hasIdentityChanges(stored, {
        externalId: "user_1",
        name: "Jane",
        email: "jane@acme.test",
      }),
      false,
    );
  });

  it("is false when fields are omitted", () => {
    assert.equal(hasIdentityChanges(stored, {}), false);
    assert.equal(hasIdentityChanges(stored, { externalId: null }), false);
  });

  it("is true when name, email, or externalId change", () => {
    assert.equal(hasIdentityChanges(stored, { name: "Jane D" }), true);
    assert.equal(hasIdentityChanges(stored, { email: "j@acme.test" }), true);
    assert.equal(hasIdentityChanges(stored, { externalId: "user_2" }), true);
  });

  it("is true when an anonymous visitor gets a name or email", () => {
    const anon = { externalId: null, name: null, email: null };
    assert.equal(hasIdentityChanges(anon, { email: "new@acme.test" }), true);
    assert.equal(hasIdentityChanges(anon, { externalId: "user_1" }), true);
  });

  it("is true when the stored visitor is unknown", () => {
    assert.equal(hasIdentityChanges(null, { name: "Jane" }), true);
  });
});
