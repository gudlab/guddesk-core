import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_SCHEDULE } from "./business-hours";
import {
  saveBusinessHours,
  type BusinessHoursInput,
  type BusinessHoursWrite,
} from "./save-business-hours";

function harness() {
  const writes: { workspaceId: string; data: BusinessHoursWrite }[] = [];
  const deps = {
    async upsert(workspaceId: string, data: BusinessHoursWrite) {
      writes.push({ workspaceId, data });
    },
  };
  const save = (input: BusinessHoursInput) =>
    saveBusinessHours(deps, "ws_1", input);
  return { writes, save };
}

const valid = {
  schedule: DEFAULT_SCHEDULE,
  holidays: ["2026-12-25"],
};

describe("saveBusinessHours", () => {
  it("saves a valid IANA timezone", async () => {
    const { writes, save } = harness();
    const result = await save({ ...valid, timezone: "Pacific/Auckland" });
    assert.deepEqual(result, {
      status: "success",
      timezone: "Pacific/Auckland",
    });
    assert.deepEqual(writes, [
      {
        workspaceId: "ws_1",
        data: {
          timezone: "Pacific/Auckland",
          schedule: DEFAULT_SCHEDULE,
          holidays: ["2026-12-25"],
        },
      },
    ]);
  });

  it("saves a zone the old fixed list did not offer", async () => {
    const { writes, save } = harness();
    const result = await save({ ...valid, timezone: "Africa/Lagos" });
    assert.equal(result.status, "success");
    assert.equal(writes[0].data.timezone, "Africa/Lagos");
  });

  it("stores the name with corrected letter case", async () => {
    const { writes, save } = harness();
    await save({ ...valid, timezone: "europe/london" });
    assert.equal(writes[0].data.timezone, "Europe/London");
  });

  it("rejects an invalid timezone and writes nothing", async () => {
    for (const timezone of ["Mars/Olympus_Mons", "+05:30", "GMT+5", 123]) {
      const { writes, save } = harness();
      const result = await save({ ...valid, timezone });
      assert.equal(result.status, "error", String(timezone));
      assert.deepEqual(writes, []);
    }
    const { save } = harness();
    assert.deepEqual(await save({ ...valid, timezone: "Mars/Olympus_Mons" }), {
      status: "error",
      message:
        '"Mars/Olympus_Mons" is not a valid timezone. Choose one from the list.',
    });
  });

  it("requires a timezone", async () => {
    const { writes, save } = harness();
    assert.deepEqual(await save({ ...valid, timezone: "" }), {
      status: "error",
      message: "Timezone is required",
    });
    assert.deepEqual(await save({ ...valid }), {
      status: "error",
      message: "Timezone is required",
    });
    assert.deepEqual(writes, []);
  });

  it("re-saves the values existing workspaces already have", async () => {
    // Today's stored values: the "UTC" default plus the old fixed list.
    for (const timezone of ["UTC", "Asia/Kolkata", "America/New_York"]) {
      const { writes, save } = harness();
      const result = await save({ ...valid, timezone });
      assert.deepEqual(result, { status: "success", timezone });
      assert.equal(writes[0].data.timezone, timezone);
    }
  });

  it("keeps the existing schedule and holiday checks", async () => {
    const { writes, save } = harness();
    assert.deepEqual(
      await save({ timezone: "UTC", schedule: { monday: null }, holidays: [] }),
      { status: "error", message: "At least one working day is required" },
    );
    assert.deepEqual(
      await save({ timezone: "UTC", schedule: null, holidays: [] }),
      { status: "error", message: "At least one working day is required" },
    );
    assert.deepEqual(
      await save({ ...valid, timezone: "UTC", holidays: ["25/12/2026"] }),
      { status: "error", message: "Invalid holiday date format: 25/12/2026" },
    );
    assert.deepEqual(writes, []);
  });
});
