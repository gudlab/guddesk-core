import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyAvailabilityEvent,
  resolveAvailability,
  seedAgentStatuses,
} from "./agent-presence";

const members = [
  { id: "m_a", userId: "u_a", availability: "ONLINE" as const },
  { memberId: "m_b", userId: "u_b", availability: "AWAY" as const },
  { id: "m_c", userId: "u_c", availability: "OFFLINE" as const },
];

describe("agent presence after a reload", () => {
  it("starts from the stored availability, not OFFLINE", () => {
    const statuses = seedAgentStatuses(members);
    assert.equal(resolveAvailability(statuses, "u_a"), "ONLINE");
    assert.equal(resolveAvailability(statuses, "u_b"), "AWAY");
    assert.equal(resolveAvailability(statuses, "u_c"), "OFFLINE");
    assert.equal(statuses.get("u_a")?.memberId, "m_a");
    assert.equal(statuses.get("u_b")?.memberId, "m_b");
  });

  it("counts stored ONLINE agents the way the Workload page does", () => {
    const statuses = seedAgentStatuses(members);
    const online = members.filter((m) => resolveAvailability(statuses, m.userId) === "ONLINE");
    assert.equal(online.length, 1);
  });

  it("uses the fallback, then OFFLINE, for unknown users", () => {
    const statuses = seedAgentStatuses(members);
    assert.equal(resolveAvailability(statuses, "u_new", "AWAY"), "AWAY");
    assert.equal(resolveAvailability(statuses, "u_new"), "OFFLINE");
    assert.equal(resolveAvailability(seedAgentStatuses(undefined), "u_a", "ONLINE"), "ONLINE");
  });

  it("lets a Pusher event override the stored value", () => {
    const seeded = seedAgentStatuses(members);
    const next = applyAvailabilityEvent(seeded, { memberId: "m_a", userId: "u_a", availability: "OFFLINE" });
    assert.equal(resolveAvailability(next, "u_a", "ONLINE"), "OFFLINE");
    assert.equal(resolveAvailability(next, "u_b"), "AWAY");
    // The seeded map is not mutated.
    assert.equal(resolveAvailability(seeded, "u_a"), "ONLINE");
  });

  it("ignores malformed events and stored rows", () => {
    const seeded = seedAgentStatuses([
      ...members,
      { id: "m_x", userId: "u_x", availability: "BUSY" as never },
    ]);
    assert.equal(seeded.has("u_x"), false);
    for (const bad of [null, {}, { userId: "u_a" }, { userId: "u_a", availability: "BUSY" }]) {
      assert.equal(applyAvailabilityEvent(seeded, bad), seeded);
    }
  });
});
