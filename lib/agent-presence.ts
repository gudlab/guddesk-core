/**
 * Agent availability as the inbox and the Workload page show it.
 *
 * The stored value (WorkspaceMember.availability) is the starting point.
 * Pusher `agent:availability-changed` events override it once they arrive.
 */

export type Availability = "ONLINE" | "AWAY" | "OFFLINE";

export interface AgentStatus {
  memberId: string;
  userId: string;
  availability: Availability;
}

export interface StoredAvailability {
  userId: string;
  availability: Availability;
  memberId?: string;
  id?: string;
}

const AVAILABILITIES: readonly Availability[] = ["ONLINE", "AWAY", "OFFLINE"];

export function isAvailability(value: unknown): value is Availability {
  return typeof value === "string" && (AVAILABILITIES as readonly string[]).includes(value);
}

/** Build the starting map from the members' stored availability. */
export function seedAgentStatuses(
  members: readonly StoredAvailability[] | undefined,
): Map<string, AgentStatus> {
  const map = new Map<string, AgentStatus>();
  for (const member of members ?? []) {
    if (!member.userId || !isAvailability(member.availability)) continue;
    map.set(member.userId, {
      memberId: member.memberId ?? member.id ?? "",
      userId: member.userId,
      availability: member.availability,
    });
  }
  return map;
}

/** Apply a Pusher event. Malformed events leave the map unchanged. */
export function applyAvailabilityEvent(
  statuses: Map<string, AgentStatus>,
  event: unknown,
): Map<string, AgentStatus> {
  const data = event as Partial<AgentStatus> | null;
  if (!data || typeof data.userId !== "string" || !isAvailability(data.availability)) {
    return statuses;
  }
  const next = new Map(statuses);
  next.set(data.userId, {
    memberId: typeof data.memberId === "string" ? data.memberId : statuses.get(data.userId)?.memberId ?? "",
    userId: data.userId,
    availability: data.availability,
  });
  return next;
}

/** Live status if we have one, then the stored fallback, then OFFLINE. */
export function resolveAvailability(
  statuses: Map<string, AgentStatus>,
  userId: string,
  fallback?: Availability,
): Availability {
  return statuses.get(userId)?.availability ?? fallback ?? "OFFLINE";
}
