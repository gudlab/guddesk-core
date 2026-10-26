import assert from "node:assert/strict";
import { describe, it } from "node:test";

// actions/invite-workspace-member.ts stores expiresAt = now + 7 days.
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
import { invitationExpiryLabel, invitationExpiryTitle } from "./invitation-expiry";

// The prod invite from the 450ffa2 smoke: sent 25 Oct 2026 23:03:47 UTC,
// stored expiresAt = created + 7 days = 1 Nov 2026 23:03:47 UTC.
const CREATED = new Date("2026-10-25T23:03:47.000Z");
const EXPIRES = new Date(CREATED.getTime() + INVITATION_TTL_MS);
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("invitation expiry display", () => {
  it("the stored expiry is 7 days after creation (what the email promises)", () => {
    assert.equal(EXPIRES.toISOString(), "2026-11-01T23:03:47.000Z");
  });

  it("repro: the old toLocaleDateString() text reads as a past date day-first", () => {
    // The members page rendered new Date(expiresAt).toLocaleDateString()
    // with no locale. Vercel's runtime (and an en-US browser) gives M/D/YYYY.
    const old = EXPIRES.toLocaleDateString("en-US", { timeZone: "UTC" });
    assert.equal(old, "11/1/2026");
    // A UK reader parses that as 11 January 2026, months before the invite
    // was sent, so it contradicts the email's "expires in 7 days".
    const [first, second, year] = old.split("/").map(Number);
    const readDayFirst = new Date(Date.UTC(year, second - 1, first));
    assert.ok(readDayFirst < CREATED, "day-first reading lands in the past");
  });

  it("says 'Expires in 7 days' right after the invite is sent", () => {
    assert.equal(invitationExpiryLabel(EXPIRES, CREATED), "Expires in 7 days");
    // A page load a few seconds or hours later still says 7 days.
    assert.equal(invitationExpiryLabel(EXPIRES, new Date(CREATED.getTime() + 5_000)), "Expires in 7 days");
    assert.equal(invitationExpiryLabel(EXPIRES, new Date(CREATED.getTime() + 3 * HOUR)), "Expires in 7 days");
  });

  it("counts down in days, then hours, then minutes", () => {
    const at = (msLeft: number) => invitationExpiryLabel(EXPIRES, new Date(EXPIRES.getTime() - msLeft));
    assert.equal(at(3 * DAY), "Expires in 3 days");
    assert.equal(at(2 * DAY - 2 * HOUR), "Expires in 2 days");
    assert.equal(at(DAY + HOUR), "Expires in 1 day");
    assert.equal(at(DAY - 1), "Expires in 24 hours");
    assert.equal(at(5 * HOUR + 10 * 60_000), "Expires in 6 hours");
    assert.equal(at(HOUR), "Expires in 1 hour");
    assert.equal(at(59 * 60_000), "Expires in 59 minutes");
    assert.equal(at(30_000), "Expires in 1 minute");
  });

  it("says Expired at or after the expiry", () => {
    assert.equal(invitationExpiryLabel(EXPIRES, EXPIRES), "Expired");
    assert.equal(invitationExpiryLabel(EXPIRES, new Date(EXPIRES.getTime() + DAY)), "Expired");
  });

  it("the absolute date is unambiguous: month name, 24h time, UTC", () => {
    assert.equal(invitationExpiryTitle(EXPIRES), "1 Nov 2026, 23:03 UTC");
  });

  it("does not depend on the server's time zone or locale", () => {
    const original = process.env.TZ;
    try {
      for (const tz of ["UTC", "Europe/London", "America/Los_Angeles", "Pacific/Kiritimati"]) {
        process.env.TZ = tz;
        assert.equal(invitationExpiryLabel(EXPIRES, CREATED), "Expires in 7 days");
        assert.equal(invitationExpiryTitle(EXPIRES), "1 Nov 2026, 23:03 UTC");
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  it("accepts an ISO string as well as a Date", () => {
    assert.equal(invitationExpiryLabel(EXPIRES.toISOString(), CREATED), "Expires in 7 days");
    assert.equal(invitationExpiryTitle(EXPIRES.toISOString()), "1 Nov 2026, 23:03 UTC");
  });

  it("never renders an epoch or Invalid Date for a bad value", () => {
    assert.equal(invitationExpiryLabel("not a date", CREATED), "Expiry unknown");
    assert.equal(invitationExpiryTitle("not a date"), "");
  });
});
