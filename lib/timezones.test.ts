import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FALLBACK_TIME_ZONES,
  formatUtcOffset,
  isIanaTimeZone,
  listTimeZones,
  normaliseTimeZone,
  resolveStoredTimeZone,
} from "./timezones";

describe("normaliseTimeZone", () => {
  it("accepts IANA names, including every name the old picker offered", () => {
    for (const name of [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Australia/Sydney",
      "America/Argentina/Buenos_Aires",
      "Etc/GMT+5",
      "Pacific/Apia",
    ]) {
      assert.equal(normaliseTimeZone(name), name, name);
    }
  });

  it("keeps valid aliases as given", () => {
    assert.equal(normaliseTimeZone("Asia/Calcutta"), "Asia/Calcutta");
    assert.equal(normaliseTimeZone("US/Eastern"), "US/Eastern");
  });

  it("fixes letter case and trims spaces", () => {
    assert.equal(normaliseTimeZone("europe/london"), "Europe/London");
    assert.equal(normaliseTimeZone("utc"), "UTC");
    assert.equal(normaliseTimeZone("  Asia/Tokyo "), "Asia/Tokyo");
  });

  it("rejects offsets, unknown zones and non-strings", () => {
    for (const value of [
      "+05:30",
      "-08:00",
      "UTC+1",
      "GMT+5",
      "Foo/Bar",
      "Europe/Atlantis",
      "",
      "   ",
      "Europe/London; DROP TABLE",
      "../etc/passwd",
      "A".repeat(65),
      null,
      undefined,
      42,
      {},
    ]) {
      assert.equal(normaliseTimeZone(value), null, String(value));
      assert.equal(isIanaTimeZone(value), false, String(value));
    }
  });
});

describe("listTimeZones", () => {
  it("uses Intl.supportedValuesOf and adds the fallback names", () => {
    const list = listTimeZones();
    assert.equal(list[0], "UTC");
    assert.ok(list.length > 300, `only ${list.length} zones`);
    assert.ok(list.includes("Asia/Kolkata"));
    assert.ok(list.includes("America/New_York"));
    assert.equal(new Set(list).size, list.length);
  });

  it("falls back to the built-in list without Intl.supportedValuesOf", () => {
    const list = listTimeZones(() => null);
    assert.equal(list[0], "UTC");
    assert.ok(list.length >= FALLBACK_TIME_ZONES.length - 2);
    assert.ok(list.every((name) => FALLBACK_TIME_ZONES.includes(name)));
  });

  it("drops names the runtime cannot resolve", () => {
    const list = listTimeZones(() => ["Europe/Atlantis", "Asia/Tokyo"]);
    assert.ok(!list.includes("Europe/Atlantis"));
    assert.ok(list.includes("Asia/Tokyo"));
  });

  it("only lists names the validator accepts", () => {
    for (const name of listTimeZones()) {
      assert.equal(normaliseTimeZone(name), name, name);
    }
  });
});

function intlAcceptsOffsets(): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: "+05:30" });
    return true;
  } catch {
    return false;
  }
}

describe("resolveStoredTimeZone", () => {
  it("keeps every stored value Intl can resolve, including offsets", () => {
    assert.equal(resolveStoredTimeZone("UTC"), "UTC");
    assert.equal(resolveStoredTimeZone("Asia/Kolkata"), "Asia/Kolkata");
    assert.equal(resolveStoredTimeZone("US/Eastern"), "US/Eastern");
    // Offset zones need a newer Intl (Node 22+). Where Intl rejects them,
    // they fall back to UTC instead of throwing.
    assert.equal(
      resolveStoredTimeZone("+05:30"),
      intlAcceptsOffsets() ? "+05:30" : "UTC",
    );
  });

  it("falls back to UTC for missing or broken values", () => {
    assert.equal(resolveStoredTimeZone(null), "UTC");
    assert.equal(resolveStoredTimeZone(undefined), "UTC");
    assert.equal(resolveStoredTimeZone(""), "UTC");
    assert.equal(resolveStoredTimeZone("Foo/Bar"), "UTC");
  });
});

describe("formatUtcOffset", () => {
  it("shows the offset in effect at the given instant", () => {
    const winter = new Date("2026-01-15T12:00:00Z");
    const summer = new Date("2026-07-15T12:00:00Z");
    assert.equal(formatUtcOffset("UTC", winter), "UTC+00:00");
    assert.equal(formatUtcOffset("Europe/London", winter), "UTC+00:00");
    assert.equal(formatUtcOffset("Europe/London", summer), "UTC+01:00");
    assert.equal(formatUtcOffset("America/New_York", winter), "UTC-05:00");
    assert.equal(formatUtcOffset("Asia/Kolkata", winter), "UTC+05:30");
    assert.equal(formatUtcOffset("Asia/Kathmandu", winter), "UTC+05:45");
    assert.equal(formatUtcOffset("Pacific/Kiritimati", winter), "UTC+14:00");
  });

  it("returns null for a zone Intl cannot resolve", () => {
    assert.equal(formatUtcOffset("Foo/Bar"), null);
  });
});
