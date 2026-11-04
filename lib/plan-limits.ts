/**
 * Plan limit checks for the hosted (cloud) edition.
 *
 * Nothing in here imports Prisma or hard-codes plan numbers. Callers pass a
 * Prisma-shaped client and a limits lookup, so the rules can be tested with
 * an in-memory fake. lib/feature-flags.ts wires it to the real client and
 * PLAN_LIMITS. The public core replaces lib/feature-flags.ts with an
 * uncapped stub (scripts/sync-oss.sh), so self-host never hits these caps.
 */

export interface SeatLimits {
  maxSeats: number;
  maxConversationsPerMonth: number;
}

type CountArgs = { where: Record<string, unknown> };

/** The subset of the Prisma client these checks use. */
export interface PlanLimitsDb {
  workspace: {
    findUnique(args: {
      where: { id: string };
      select: { plan: true };
    }): Promise<{ plan: string } | null>;
  };
  workspaceMember: { count(args: CountArgs): Promise<number> };
  workspaceInvitation: { count(args: CountArgs): Promise<number> };
  conversation: { count(args: CountArgs): Promise<number> };
}

export type LimitsForPlan = (plan: string) => SeatLimits;

/** Start of the calendar month that contains `now`, in UTC. */
export function monthStartUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** "2026-10" for any time in October 2026 UTC. */
export function monthKeyUtc(now: Date): string {
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

// ─── Seats ──────────────────────────────────────────────

export interface SeatDecision {
  allowed: boolean;
  plan: string;
  members: number;
  pendingInvites: number;
  /** members + pending invites */
  used: number;
  maxSeats: number;
}

/**
 * A seat is a member or a pending, unexpired invitation. A new invite is
 * allowed only while used < maxSeats. Workspaces already over the limit
 * keep every member; they just can't invite more.
 */
export function decideSeat(
  plan: string,
  maxSeats: number,
  members: number,
  pendingInvites: number,
): SeatDecision {
  const used = members + pendingInvites;
  return {
    allowed: used < maxSeats,
    plan,
    members,
    pendingInvites,
    used,
    maxSeats,
  };
}

export async function getSeatDecision(
  db: PlanLimitsDb,
  limitsFor: LimitsForPlan,
  workspaceId: string,
  now: Date = new Date(),
): Promise<SeatDecision> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  const plan = workspace?.plan ?? "FREE";
  const { maxSeats } = limitsFor(plan);

  const [members, pendingInvites] = await Promise.all([
    db.workspaceMember.count({ where: { workspaceId } }),
    db.workspaceInvitation.count({
      where: { workspaceId, status: "PENDING", expiresAt: { gt: now } },
    }),
  ]);

  return decideSeat(plan, maxSeats, members, pendingInvites);
}

/** "The Free plan includes 2 seats, and this workspace is using 2 (members and pending invites)." */
export function seatLimitSummary(used: number, maxSeats: number): string {
  return `The Free plan includes ${maxSeats} seats, and this workspace is using ${used} (members and pending invites).`;
}

export function seatLimitMessage(decision: SeatDecision): string {
  return `${seatLimitSummary(decision.used, decision.maxSeats)} Upgrade to Pro to invite more people.`;
}

/**
 * Accepting an invitation never checks seats. A pending invitation already
 * counts as a seat, so new invites stop once members + pending invites
 * reach the limit, and accepting one doesn't raise that total. Invitations
 * sent before limits were enforced can still be accepted even if that puts
 * a workspace over the limit. Breaking a link someone was already sent
 * would be worse than one extra seat.
 */
export function canAcceptInvitation(invitation: {
  status: string;
  expiresAt: Date;
}, now: Date = new Date()): boolean {
  return invitation.status === "PENDING" && invitation.expiresAt > now;
}

// ─── Conversations ──────────────────────────────────────

/** Share of the monthly allowance at which the warning banner starts. */
export const CONVERSATION_WARNING_RATIO = 0.8;

export interface ConversationBanner {
  level: "warning" | "over";
  count: number;
  limit: number;
  /** UTC month, for the per-session dismiss key. */
  monthKey: string;
}

/**
 * Banner state for the monthly conversation allowance. Never blocks
 * anything: visitors can always start conversations.
 * - over: count > limit
 * - warning: count >= 80% of limit (and not over)
 */
export function conversationBanner(
  limit: number,
  count: number,
  monthKey: string,
): ConversationBanner | null {
  if (!Number.isFinite(limit) || limit <= 0) return null;
  if (count > limit) return { level: "over", count, limit, monthKey };
  if (count >= Math.ceil(limit * CONVERSATION_WARNING_RATIO)) {
    return { level: "warning", count, limit, monthKey };
  }
  return null;
}

/**
 * Counts conversations created since the UTC month start. Skips the count
 * entirely for plans without a monthly limit.
 */
export async function getConversationBanner(
  db: PlanLimitsDb,
  limitsFor: LimitsForPlan,
  workspaceId: string,
  now: Date = new Date(),
): Promise<ConversationBanner | null> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  const plan = workspace?.plan ?? "FREE";
  const limit = limitsFor(plan).maxConversationsPerMonth;
  if (!Number.isFinite(limit)) return null;

  const count = await db.conversation.count({
    where: { workspaceId, createdAt: { gte: monthStartUtc(now) } },
  });
  return conversationBanner(limit, count, monthKeyUtc(now));
}
