import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildGudBotUserMessage,
  GUDBOT_SYSTEM,
  SUBMIT_RESPONSE_TOOL,
} from "./prompt";
import type { RankedArticle } from "./retrieve";

const article: RankedArticle = {
  id: "art_install",
  title: "Install the chat widget",
  excerpt:
    'Set window.GudDeskSettings = { appId: "gd_pub_YOUR_APP_ID" } then load widget.js. HTML-only install is not supported yet.',
  slug: "install-widget",
  collectionSlug: "widget",
  score: 9,
};

describe("GUDBOT_SYSTEM", () => {
  it("tells the model to quote identifiers and to answer when the articles cover the question", () => {
    assert.match(GUDBOT_SYSTEM, /GudDeskSettings/);
    assert.match(GUDBOT_SYSTEM, /gd_pub_/);
    assert.match(GUDBOT_SYSTEM, /openOnLoad/);
    assert.match(GUDBOT_SYSTEM, /Bearer/);
    assert.match(GUDBOT_SYSTEM, /verbatim|exactly as they appear/i);
    assert.match(GUDBOT_SYSTEM, /submit_response even when the visitor phrased/i);
  });
});

describe("SUBMIT_RESPONSE_TOOL", () => {
  it("asks for verbatim identifiers in the visitor-visible reply", () => {
    assert.match(SUBMIT_RESPONSE_TOOL.description, /exactly/i);
    const text = SUBMIT_RESPONSE_TOOL.input_schema.properties.text.description;
    assert.match(text, /verbatim/i);
  });
});

describe("buildGudBotUserMessage", () => {
  it("sends article text (not a title-only teaser) to the model", () => {
    const message = buildGudBotUserMessage({
      visitorMessage: "Can I install the widget with only an HTML tag?",
      history: [],
      articles: [article],
    });
    assert.match(message, /Article:/);
    assert.match(message, /GudDeskSettings/);
    assert.match(message, /gd_pub_/);
    assert.match(message, /not supported yet/);
  });
});
