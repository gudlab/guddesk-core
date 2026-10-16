import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HOSTED_WIDGET_API_ORIGIN,
  findWidgetScriptSrc,
  resolveDefaultApiOrigin,
} from "./api-origin";

describe("resolveDefaultApiOrigin", () => {
  it("defaults hosted cdn/www/apex scripts to www, not the apex", () => {
    assert.equal(
      resolveDefaultApiOrigin(
        "https://cdn.guddesk.com/widget.js",
        "https://customer.example",
      ),
      HOSTED_WIDGET_API_ORIGIN,
    );
    assert.equal(
      resolveDefaultApiOrigin(
        "https://www.guddesk.com/widget.js",
        "https://customer.example",
      ),
      HOSTED_WIDGET_API_ORIGIN,
    );
    assert.equal(
      resolveDefaultApiOrigin(
        "https://guddesk.com/widget.js",
        "https://customer.example",
      ),
      HOSTED_WIDGET_API_ORIGIN,
    );
    assert.equal(HOSTED_WIDGET_API_ORIGIN, "https://www.guddesk.com");
  });

  it("uses the script origin for self-hosted installs", () => {
    assert.equal(
      resolveDefaultApiOrigin(
        "https://support.acme.test/widget.js",
        "https://www.acme.test",
      ),
      "https://support.acme.test",
    );
  });

  it("lets an explicit baseUrl win and strips a trailing slash", () => {
    assert.equal(
      resolveDefaultApiOrigin(
        "https://cdn.guddesk.com/widget.js",
        "https://customer.example",
        "https://desk.acme.test/",
      ),
      "https://desk.acme.test",
    );
  });

  it("falls back when no widget script is found", () => {
    assert.equal(
      resolveDefaultApiOrigin(undefined, "https://www.acme.test"),
      "https://www.acme.test",
    );
  });
});

describe("findWidgetScriptSrc", () => {
  it("returns the last guddesk/widget script", () => {
    assert.equal(
      findWidgetScriptSrc([
        { src: "https://cdn.example/app.js" },
        { src: "https://cdn.guddesk.com/widget.js" },
        { src: "https://cdn.guddesk.com/widget.js?v=2" },
      ]),
      "https://cdn.guddesk.com/widget.js?v=2",
    );
  });
});
