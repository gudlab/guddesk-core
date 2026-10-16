import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { widgetRequestHeaders } from "./request-headers";

describe("widgetRequestHeaders", () => {
  it("omits Content-Type on GET so config does not preflight", () => {
    const headers = widgetRequestHeaders({ hasBody: false });
    assert.equal("Content-Type" in headers, false);
  });

  it("sends JSON Content-Type when the request has a body", () => {
    const headers = widgetRequestHeaders({ hasBody: true });
    assert.equal(headers["Content-Type"], "application/json");
  });

  it("forwards the visitor token", () => {
    const headers = widgetRequestHeaders({
      hasBody: false,
      visitorToken: "tok_abc",
    });
    assert.equal(headers["x-visitor-token"], "tok_abc");
  });
});
