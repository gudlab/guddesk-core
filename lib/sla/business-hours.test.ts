import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addBusinessMinutes,
  DEFAULT_SCHEDULE,
  isWithinBusinessHours,
  type WeekSchedule,
} from "./business-hours";

const WEEKDAYS_9_TO_5: WeekSchedule = DEFAULT_SCHEDULE;

/** Sync addBusinessMinutes loops must not outlive this. */
const TIMEOUT = { timeout: 5_000 };

/** Tuesday evening is in hours; Wednesday is closed. */
const TUESDAY_UNTIL_18: WeekSchedule = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "18:00" },
  wednesday: null,
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: null,
  sunday: null,
};

describe("isWithinBusinessHours", () => {
  it("is true at the start of a weekday window in UTC", TIMEOUT, () => {
    // Monday 2026-01-05 09:00 UTC
    assert.equal(
      isWithinBusinessHours(
        new Date("2026-01-05T09:00:00Z"),
        WEEKDAYS_9_TO_5,
        "UTC",
      ),
      true,
    );
  });

  it("is false before open and at the exclusive end", TIMEOUT, () => {
    assert.equal(
      isWithinBusinessHours(
        new Date("2026-01-05T08:59:00Z"),
        WEEKDAYS_9_TO_5,
        "UTC",
      ),
      false,
    );
    assert.equal(
      isWithinBusinessHours(
        new Date("2026-01-05T17:00:00Z"),
        WEEKDAYS_9_TO_5,
        "UTC",
      ),
      false,
    );
  });

  it("is false on weekends", TIMEOUT, () => {
    // Saturday 2026-01-10 12:00 UTC
    assert.equal(
      isWithinBusinessHours(
        new Date("2026-01-10T12:00:00Z"),
        WEEKDAYS_9_TO_5,
        "UTC",
      ),
      false,
    );
  });

  it(
    "is false on a configured holiday even during weekday hours",
    TIMEOUT,
    () => {
      // Thursday 2026-01-01 12:00 UTC
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-01-01T12:00:00Z"),
          WEEKDAYS_9_TO_5,
          "UTC",
          ["2026-01-01"],
        ),
        false,
      );
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-01-01T12:00:00Z"),
          WEEKDAYS_9_TO_5,
          "UTC",
          [],
        ),
        true,
      );
    },
  );

  it(
    "evaluates holidays on the civil date in the workspace timezone",
    TIMEOUT,
    () => {
      const instant = new Date("2026-12-25T00:30:00Z");
      const holidays = ["2026-12-25"];
      // UTC: Friday 00:30 on the holiday.
      assert.equal(
        isWithinBusinessHours(instant, WEEKDAYS_9_TO_5, "UTC", holidays),
        false,
      );
      // America/Los_Angeles: Thursday 16:30 on the 24th, still in hours.
      assert.equal(
        isWithinBusinessHours(
          instant,
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
          holidays,
        ),
        true,
      );
      // 2026-12-25 09:00 PST is the holiday in LA.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-12-25T17:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
          holidays,
        ),
        false,
      );
    },
  );

  it(
    "uses the workspace timezone, not UTC, for the wall clock",
    TIMEOUT,
    () => {
      // Wednesday 2026-09-16 16:00 UTC = 09:00 PDT in America/Los_Angeles.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-09-16T16:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
        ),
        true,
      );
      // Same instant is 04:00 on Thursday in Pacific/Auckland (NZST, UTC+12).
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-09-16T16:00:00Z"),
          WEEKDAYS_9_TO_5,
          "Pacific/Auckland",
        ),
        false,
      );
    },
  );

  it(
    "uses PDT vs PST offsets around the 2026 US DST transitions",
    TIMEOUT,
    () => {
      // Friday 2026-03-06 09:00 PST (UTC-8), before spring-forward.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-03-06T17:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
        ),
        true,
      );
      // Monday 2026-03-09 09:00 PDT (UTC-7), after spring-forward.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-03-09T16:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
        ),
        true,
      );
      // Friday 2026-10-30 09:00 PDT (UTC-7), before fall-back.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-10-30T16:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
        ),
        true,
      );
      // Monday 2026-11-02 09:00 PST (UTC-8), after fall-back.
      assert.equal(
        isWithinBusinessHours(
          new Date("2026-11-02T17:00:00Z"),
          WEEKDAYS_9_TO_5,
          "America/Los_Angeles",
        ),
        true,
      );
    },
  );
});

describe("addBusinessMinutes", () => {
  it("adds minutes inside a single window", TIMEOUT, () => {
    const deadline = addBusinessMinutes(
      new Date("2026-01-05T09:00:00Z"),
      60,
      WEEKDAYS_9_TO_5,
      [],
      "UTC",
    );
    assert.equal(deadline.toISOString(), "2026-01-05T10:00:00.000Z");
  });

  it("rolls leftover minutes into the next weekday", TIMEOUT, () => {
    const deadline = addBusinessMinutes(
      new Date("2026-01-05T16:30:00Z"),
      60,
      WEEKDAYS_9_TO_5,
      [],
      "UTC",
    );
    assert.equal(deadline.toISOString(), "2026-01-06T09:30:00.000Z");
  });

  it("skips Saturday and Sunday", TIMEOUT, () => {
    const deadline = addBusinessMinutes(
      new Date("2026-01-09T16:00:00Z"),
      120,
      WEEKDAYS_9_TO_5,
      [],
      "UTC",
    );
    // Friday 16:00 + 60 remaining Friday, 60 on Monday 09:00 → 10:00.
    assert.equal(deadline.toISOString(), "2026-01-12T10:00:00.000Z");
  });

  it("skips configured holidays", TIMEOUT, () => {
    const deadline = addBusinessMinutes(
      new Date("2025-12-31T16:00:00Z"),
      120,
      WEEKDAYS_9_TO_5,
      ["2026-01-01"],
      "UTC",
    );
    // Wed 16:00 + 60, skip New Year's Day Thursday, Friday 09:00 + 60.
    assert.equal(deadline.toISOString(), "2026-01-02T10:00:00.000Z");
  });

  it("starts the countdown at the next open window", TIMEOUT, () => {
    const deadline = addBusinessMinutes(
      new Date("2026-01-05T08:00:00Z"),
      30,
      WEEKDAYS_9_TO_5,
      [],
      "UTC",
    );
    assert.equal(deadline.toISOString(), "2026-01-05T09:30:00.000Z");
  });

  it("returns the start time when minutes are not positive", TIMEOUT, () => {
    const start = new Date("2026-01-05T12:00:00Z");
    assert.equal(
      addBusinessMinutes(start, 0, WEEKDAYS_9_TO_5, [], "UTC").toISOString(),
      start.toISOString(),
    );
    assert.equal(
      addBusinessMinutes(start, -15, WEEKDAYS_9_TO_5, [], "UTC").toISOString(),
      start.toISOString(),
    );
  });

  it(
    "counts minutes on the workspace civil clock, including Auckland",
    TIMEOUT,
    () => {
      // Friday 2026-09-18 16:00 NZST (UTC+12) = 04:00 UTC.
      const deadline = addBusinessMinutes(
        new Date("2026-09-18T04:00:00Z"),
        120,
        WEEKDAYS_9_TO_5,
        [],
        "Pacific/Auckland",
      );
      // 60 min left Friday, skip weekend, Monday 10:00 NZST = 2026-09-20 22:00 UTC.
      assert.equal(deadline.toISOString(), "2026-09-20T22:00:00.000Z");
    },
  );

  it(
    "skips the US spring-forward weekend without dropping Monday minutes",
    TIMEOUT,
    () => {
      // Friday 2026-03-06 16:00 PST (UTC-8).
      const deadline = addBusinessMinutes(
        new Date("2026-03-07T00:00:00Z"),
        120,
        WEEKDAYS_9_TO_5,
        [],
        "America/Los_Angeles",
      );
      // 60 min Friday + 60 min Monday 09:00 PDT → 10:00 PDT = 17:00 UTC.
      assert.equal(deadline.toISOString(), "2026-03-09T17:00:00.000Z");
    },
  );

  it(
    "skips the Europe/London fall-back weekend with the GMT offset on Monday",
    TIMEOUT,
    () => {
      // Friday 2026-10-23 16:00 BST (UTC+1). UK clocks fall back on Sunday 25 Oct.
      const deadline = addBusinessMinutes(
        new Date("2026-10-23T15:00:00Z"),
        120,
        WEEKDAYS_9_TO_5,
        [],
        "Europe/London",
      );
      // 60 min Friday + 60 min Monday 09:00 GMT → 10:00 GMT = 10:00 UTC.
      assert.equal(deadline.toISOString(), "2026-10-26T10:00:00.000Z");
    },
  );

  it(
    "starts Tuesday after hours in Los Angeles, not Wednesday UTC",
    TIMEOUT,
    () => {
      // 2026-09-16T00:30:00Z is Tuesday 17:30 PDT (after 17:00).
      const deadline = addBusinessMinutes(
        new Date("2026-09-16T00:30:00Z"),
        60,
        WEEKDAYS_9_TO_5,
        [],
        "America/Los_Angeles",
      );
      // Next window is Wednesday 09:00 PDT + 60 → 10:00 PDT = 17:00 UTC.
      assert.equal(deadline.toISOString(), "2026-09-16T17:00:00.000Z");
    },
  );

  // advanceToNextDay compares candidateDay === day + 1, so 31 Oct looks
  // for day 32 and never reaches Monday. The body is omitted because
  // the 365-day cap is a tight sync loop that timeouts cannot interrupt.
  it.todo(
    "rolls leftover minutes from 2026-10-30 16:00 PDT across fall-back (issue #8)",
  );
});

describe("toLocaleString weekday (issue #8)", () => {
  // 2026-09-16T00:30:00Z is Tuesday 15 Sep 17:30 PDT, not Wednesday UTC.
  // getDayName parses date.toLocaleString("en-US", { timeZone }) — the
  // same class of bug as civil-date off-by-ones tracked in issue #8.
  const instant = new Date("2026-09-16T00:30:00Z");

  it(
    "treats 2026-09-16T00:30:00Z as Tuesday evening in America/Los_Angeles",
    TIMEOUT,
    () => {
      assert.equal(
        isWithinBusinessHours(instant, TUESDAY_UNTIL_18, "America/Los_Angeles"),
        true,
      );
    },
  );

  it("does not treat that instant as Wednesday in Los Angeles", TIMEOUT, () => {
    const wednesdayOnly: WeekSchedule = {
      wednesday: { start: "00:00", end: "01:00" },
    };
    assert.equal(
      isWithinBusinessHours(instant, wednesdayOnly, "America/Los_Angeles"),
      false,
    );
  });
});
