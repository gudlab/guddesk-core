import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  WIDGET_MOBILE_MAX_WIDTH,
  applySnippetAppearance,
  findWidgetScriptElement,
  mergeSnippetSettings,
  parseBoolAttr,
  parseScriptTagSettings,
  shouldHideOnMobile,
} from "./snippet-settings";

function fakeScript(
  attrs: Record<string, string>,
  src = "https://cdn.guddesk.com/widget.js",
) {
  return {
    src,
    getAttribute(name: string) {
      return attrs[name] ?? null;
    },
    hasAttribute(name: string) {
      return Object.prototype.hasOwnProperty.call(attrs, name);
    },
  };
}

describe("parseScriptTagSettings (issue #6)", () => {
  it("reads data-app-id and optional install fields", () => {
    const settings = parseScriptTagSettings(
      fakeScript({
        "data-app-id": "gd_pub_abc",
        "data-base-url": "https://desk.acme.test",
        "data-open-on-load": "true",
        "data-name": "Jane",
        "data-email": "jane@acme.test",
      }),
    );
    assert.equal(settings.appId, "gd_pub_abc");
    assert.equal(settings.baseUrl, "https://desk.acme.test");
    assert.equal(settings.openOnLoad, true);
    assert.equal(settings.name, "Jane");
    assert.equal(settings.email, "jane@acme.test");
    assert.equal("userHash" in settings, false);
  });

  it("accepts data-guddesk as an app id alias", () => {
    const settings = parseScriptTagSettings(
      fakeScript({ "data-guddesk": "gd_pub_xyz" }),
    );
    assert.equal(settings.appId, "gd_pub_xyz");
  });

  it("does not invent a userHash from HTML", () => {
    const settings = parseScriptTagSettings(
      fakeScript({
        "data-app-id": "gd_pub_abc",
        "data-user-hash": "should-be-ignored",
      }),
    );
    assert.equal("userHash" in settings, false);
  });
});

describe("parseBoolAttr", () => {
  it("parses true/false/1/0 and ignores empty", () => {
    assert.equal(parseBoolAttr("true"), true);
    assert.equal(parseBoolAttr("1"), true);
    assert.equal(parseBoolAttr("false"), false);
    assert.equal(parseBoolAttr("0"), false);
    assert.equal(parseBoolAttr(""), undefined);
    assert.equal(parseBoolAttr(null), undefined);
  });
});

describe("mergeSnippetSettings", () => {
  it("lets window.GudDeskSettings override data attributes", () => {
    const merged = mergeSnippetSettings(
      { appId: "from-script", openOnLoad: true },
      { appId: "from-window", baseUrl: "https://www.guddesk.com" },
    );
    assert.equal(merged.appId, "from-window");
    assert.equal(merged.openOnLoad, true);
    assert.equal(merged.baseUrl, "https://www.guddesk.com");
  });
});

describe("applySnippetAppearance (issue #5)", () => {
  const dashboard = {
    primaryColor: "#3ECF8E",
    position: "bottom-right",
    welcomeMessage: "Hi from dashboard",
  };

  it("keeps dashboard color when the snippet omits accentColor", () => {
    const next = applySnippetAppearance(dashboard, {});
    assert.equal(next.primaryColor, "#3ECF8E");
    assert.equal(next.position, "bottom-right");
    assert.equal(next.welcomeMessage, "Hi from dashboard");
  });

  it("overlays accentColor, position, and greeting after fetchConfig", () => {
    const next = applySnippetAppearance(dashboard, {
      accentColor: "#6366F1",
      position: "bottom-left",
      greeting: "Welcome",
    });
    assert.equal(next.primaryColor, "#6366F1");
    assert.equal(next.position, "bottom-left");
    assert.equal(next.welcomeMessage, "Welcome");
  });

  it("ignores an unsafe snippet accentColor and keeps the dashboard color", () => {
    for (const accentColor of [
      "red",
      "#fff; } :host { display: none",
      "url(https://evil.test/x)",
    ]) {
      const next = applySnippetAppearance(dashboard, { accentColor });
      assert.equal(next.primaryColor, "#3ECF8E", accentColor);
    }
  });

  it("accepts rgb() and short hex snippet colors", () => {
    assert.equal(
      applySnippetAppearance(dashboard, { accentColor: "rgb(99, 102, 241)" })
        .primaryColor,
      "rgb(99, 102, 241)",
    );
    assert.equal(
      applySnippetAppearance(dashboard, { accentColor: "#60f" }).primaryColor,
      "#60f",
    );
  });

  it("falls back to the default when the dashboard color is unsafe too", () => {
    const next = applySnippetAppearance(
      { ...dashboard, primaryColor: "blue;}" },
      { accentColor: "also bad" },
    );
    assert.equal(next.primaryColor, "#3ECF8E");
  });

  it("allows an empty greeting", () => {
    const next = applySnippetAppearance(dashboard, { greeting: "" });
    assert.equal(next.welcomeMessage, "");
  });
});

describe("shouldHideOnMobile", () => {
  it("hides at or below the 440px layout breakpoint", () => {
    assert.equal(shouldHideOnMobile(true, WIDGET_MOBILE_MAX_WIDTH), true);
    assert.equal(shouldHideOnMobile(true, 320), true);
    assert.equal(shouldHideOnMobile(true, 441), false);
    assert.equal(shouldHideOnMobile(false, 320), false);
    assert.equal(shouldHideOnMobile(undefined, 320), false);
  });
});

describe("findWidgetScriptElement", () => {
  it("finds a tag with data-app-id even without a widget src", () => {
    const match = findWidgetScriptElement([
      fakeScript({}, "https://cdn.example/app.js"),
      fakeScript({ "data-app-id": "gd_pub_abc" }, ""),
    ]);
    assert.equal(match?.getAttribute("data-app-id"), "gd_pub_abc");
  });
});
