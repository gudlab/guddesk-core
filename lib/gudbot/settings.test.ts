import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_HANDOFF_MESSAGE,
  DISABLED_GUDBOT_SETTINGS,
  hasOptOutTag,
  resolveGudBotSettings,
  settingsAllowChannel,
} from "./settings";

describe("resolveGudBotSettings", () => {
  it("defaults a missing row to disabled", () => {
    assert.deepEqual(resolveGudBotSettings(null), DISABLED_GUDBOT_SETTINGS);
    assert.equal(resolveGudBotSettings(null).enabled, false);
    assert.equal(
      resolveGudBotSettings(null).confidenceThreshold,
      DEFAULT_CONFIDENCE_THRESHOLD,
    );
    assert.equal(
      resolveGudBotSettings(undefined).handoffMessage,
      DEFAULT_HANDOFF_MESSAGE,
    );
  });

  it("clamps threshold and max turns", () => {
    const settings = resolveGudBotSettings({
      enabled: true,
      confidenceThreshold: 0.2,
      maxTurns: 99,
    });
    assert.equal(settings.confidenceThreshold, 0.5);
    assert.equal(settings.maxTurns, 10);
  });
});

describe("settingsAllowChannel", () => {
  it("allows widget by default and not email until enabled", () => {
    const settings = resolveGudBotSettings({ enabled: true });
    assert.equal(settingsAllowChannel(settings, "WIDGET"), true);
    assert.equal(settingsAllowChannel(settings, "EMAIL"), false);
  });
});

describe("hasOptOutTag", () => {
  it("is a silent hook when the conversation carries an opt-out tag", () => {
    assert.equal(hasOptOutTag(["vip"], ["VIP"]), true);
    assert.equal(hasOptOutTag(["billing"], ["vip"]), false);
    assert.equal(hasOptOutTag(["vip"], []), false);
  });
});
