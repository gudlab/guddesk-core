/**
 * Invitation writes that must not race.
 *
 * Every write that changes who holds a seat in a workspace runs inside one
 * interactive transaction that first takes a Postgres advisory lock keyed on
 * the workspace id. The lock is released when the transaction ends, so
 * parallel invites for the same workspace run one at a time: each sees the
 * seats and pending invites the previous one committed.
 *
 * No Prisma import here. Callers pass a Prisma-shaped client so the order of
 * operations can be tested with a fake.
 */

import {
  canAcceptInvitation,
  getSeatDecision,
  type LimitsForPlan,
  type PlanLimitsDb,
  type SeatDecision,
} from "./plan-limits";

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const ALREADY_MEMBER_MESSAGE = "You're already a member of this workspace.";
export const INVITATION_EXPIRED_MESSAGE = "This invitation has expired";
export const INVITATION_USED_MESSAGE = "This invitation has already been used";
export const INVITATION_REVOKED_MESSAGE = "This invitation was revoked";
export const ACCEPT_FAILED_MESSAGE =
  "We couldn't accept this invitation. Try again, or ask for a new invite.";

/**
 * Message for an invitation that is no longer PENDING, when the user is not
 * a member. A second click on an expired link says it expired, not that it
 * was used.
 */
export function closedInvitationMessage(
  invitation: { status: string; expiresAt: Date },
  now: Date = new Date(),
): string {
  if (invitation.status === "EXPIRED") return INVITATION_EXPIRED_MESSAGE;
  if (invitation.status === "PENDING" && invitation.expiresAt < now) {
    return INVITATION_EXPIRED_MESSAGE;
  }
  return INVITATION_USED_MESSAGE;
}

export interface ExpireInvitationDb {
  workspaceInvitation: {
    updateMany(args: {
      where: { token: string; status: "PENDING" };
      data: { status: "EXPIRED" };
    }): Promise<{ count: number }>;
    findUnique(args: {
      where: { token: string };
      select: { status: true };
    }): Promise<{ status: string } | null>;
  };
}

/**
 * Mark a past-expiry invitation EXPIRED and say what the invitee should
 * see. If a revoke deleted the row in the meantime, updateMany matches
 * nothing (an update would throw P2025 and leak Prisma's text).
 */
export async function expireInvitation(db: ExpireInvitationDb, token: string): Promise<string> {
  const { count } = await db.workspaceInvitation.updateMany({
    where: { token, status: "PENDING" },
    data: { status: "EXPIRED" },
  });
  if (count > 0) return INVITATION_EXPIRED_MESSAGE;
  const current = await db.workspaceInvitation.findUnique({
    where: { token },
    select: { status: true },
  });
  if (!current) return INVITATION_REVOKED_MESSAGE;
  return current.status === "ACCEPTED" ? INVITATION_USED_MESSAGE : INVITATION_EXPIRED_MESSAGE;
}

/**
 * What the invitee sees when accepting throws. Only our own "Unauthorized"
 * passes through. Database errors (Prisma codes such as P2025) and anything
 * else get a plain message.
 */
export function acceptInvitationErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Unauthorized") return "Unauthorized";
  return ACCEPT_FAILED_MESSAGE;
}

/**
 * Invite emails are stored trimmed and lowercased. Older rows may be mixed
 * case, so lookups also compare case-insensitively (see emailMatch).
 */
export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Case-insensitive email filter for Prisma (Postgres ILIKE-style equality). */
export function emailMatch(email: string) {
  return { equals: normalizeInviteEmail(email), mode: "insensitive" as const };
}

type Where = Record<string, unknown>;

/** The transaction client the invitation writes use. */
export interface InvitationTx extends PlanLimitsDb {
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<number>;
  user: {
    findFirst(args: { where: Where; select: { id: true } }): Promise<{ id: string } | null>;
  };
  workspaceInvitation: PlanLimitsDb["workspaceInvitation"] & {
    findFirst(args: {
      where: Where;
      select: { id: true; status?: true };
    }): Promise<{ id: string; status?: string } | null>;
    deleteMany(args: { where: Where }): Promise<{ count: number }>;
    findUnique(args: {
      where: { token: string };
      select: { id: true; status: true; expiresAt: true };
    }): Promise<{ id: string; status: string; expiresAt: Date } | null>;
    create(args: {
      data: {
        workspaceId: string;
        email: string;
        role: string;
        invitedById: string;
        expiresAt: Date;
      };
      select: { token: true };
    }): Promise<{ token: string }>;
    updateMany(args: { where: Where; data: { status: string } }): Promise<{ count: number }>;
  };
  workspaceMember: PlanLimitsDb["workspaceMember"] & {
    findUnique(args: {
      where: { workspaceId_userId: { workspaceId: string; userId: string } };
      select: { id: true };
    }): Promise<{ id: string } | null>;
    create(args: {
      data: { workspaceId: string; userId: string; role: string };
    }): Promise<unknown>;
  };
}

export interface InvitationDb {
  $transaction<T>(fn: (tx: InvitationTx) => Promise<T>): Promise<T>;
}

/**
 * Serialises seat changes for one workspace until the transaction ends.
 * The id goes in as a bound parameter, never spliced into the SQL.
 */
export async function lockWorkspaceSeats(tx: InvitationTx, workspaceId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${workspaceId}))`;
}

export type CreateInvitationResult =
  | { status: "created"; token: string }
  | { status: "already_member" }
  | { status: "duplicate" }
  | { status: "seat_limit"; decision: SeatDecision };

/**
 * Locks the workspace, then checks for a live pending invite to the same
 * email, counts seats and creates the invitation, all in one transaction.
 * Expired pending invites for the email are marked EXPIRED first, so they
 * neither block a new invite nor show as pending.
 */
export async function createInvitationWithSeatLock(
  db: InvitationDb,
  limitsFor: LimitsForPlan,
  input: { workspaceId: string; email: string; role: string; invitedById: string },
  now: Date = new Date(),
): Promise<CreateInvitationResult> {
  const { workspaceId, role, invitedById } = input;
  const email = normalizeInviteEmail(input.email);
  return db.$transaction(async (tx) => {
    await lockWorkspaceSeats(tx, workspaceId);

    const user = await tx.user.findFirst({
      where: { email: emailMatch(email) },
      select: { id: true },
    });
    if (user) {
      const member = await tx.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } },
        select: { id: true },
      });
      if (member) return { status: "already_member" };
    }

    await tx.workspaceInvitation.updateMany({
      where: { workspaceId, email: emailMatch(email), status: "PENDING", expiresAt: { lte: now } },
      data: { status: "EXPIRED" },
    });

    const duplicate = await tx.workspaceInvitation.findFirst({
      where: { workspaceId, email: emailMatch(email), status: "PENDING", expiresAt: { gt: now } },
      select: { id: true },
    });
    if (duplicate) return { status: "duplicate" };

    const decision = await getSeatDecision(tx, limitsFor, workspaceId, now);
    if (!decision.allowed) return { status: "seat_limit", decision };

    const invitation = await tx.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        invitedById,
        expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
      },
      select: { token: true },
    });
    return { status: "created", token: invitation.token };
  });
}

export type AcceptInvitationResult =
  | { status: "accepted" }
  | { status: "already_member" }
  | { status: "revoked" }
  | { status: "invalid" };

/**
 * Accepting doesn't count seats (a pending invite already holds one; see
 * canAcceptInvitation), but it is still check-then-write: two clicks on the
 * same link could both see PENDING. Under the same workspace lock, re-read
 * the invitation, then add the member and mark it accepted.
 */
export async function acceptInvitationWithLock(
  db: InvitationDb,
  input: { token: string; workspaceId: string; userId: string; role: string },
  now: Date = new Date(),
): Promise<AcceptInvitationResult> {
  const { token, workspaceId, userId, role } = input;
  return db.$transaction(async (tx) => {
    await lockWorkspaceSeats(tx, workspaceId);

    const current = await tx.workspaceInvitation.findUnique({
      where: { token },
      select: { id: true, status: true, expiresAt: true },
    });
    const member = await tx.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { id: true },
    });
    if (member) {
      // Already in (for example the first of two clicks). Close the invite.
      await tx.workspaceInvitation.updateMany({
        where: { token, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
      return { status: "already_member" };
    }

    // Revoked (deleted) while this request waited for the lock.
    if (!current) return { status: "revoked" };
    if (!canAcceptInvitation(current, now)) return { status: "invalid" };

    // Claim the invite before adding the member. Only a row that is still
    // PENDING flips to ACCEPTED, so if anything removed or used it after
    // the read above, no member is created. The lock already orders accept
    // and revoke; this is a second guard.
    const claimed = await tx.workspaceInvitation.updateMany({
      where: { id: current.id, status: "PENDING" },
      data: { status: "ACCEPTED" },
    });
    if (claimed.count !== 1) return { status: "revoked" };

    await tx.workspaceMember.create({ data: { workspaceId, userId, role } });
    return { status: "accepted" };
  });
}

/** Roles that can invite people and revoke invitations. */
export const INVITATION_MANAGER_ROLES = ["OWNER", "ADMIN"] as const;

export function canManageInvitations(role: string): boolean {
  return (INVITATION_MANAGER_ROLES as readonly string[]).includes(role);
}

export type RevokeInvitationResult =
  | { status: "revoked" }
  | { status: "already_accepted" }
  | { status: "not_found" };

/**
 * Deletes a pending invitation (expired or not) in this workspace, under
 * the same workspace lock as accept, so a revoke and an accept of one
 * invitation can't interleave: whichever takes the lock first wins. The
 * workspace id is part of the filter, so an id from another workspace
 * matches nothing. Accepted invitations are left alone.
 */
export async function revokePendingInvitation(
  db: InvitationDb,
  workspaceId: string,
  invitationId: string,
): Promise<RevokeInvitationResult> {
  return db.$transaction(async (tx) => {
    await lockWorkspaceSeats(tx, workspaceId);
    const { count } = await tx.workspaceInvitation.deleteMany({
      where: { id: invitationId, workspaceId, status: "PENDING" },
    });
    if (count > 0) return { status: "revoked" };
    const existing = await tx.workspaceInvitation.findFirst({
      where: { id: invitationId, workspaceId },
      select: { id: true, status: true },
    });
    return existing?.status === "ACCEPTED"
      ? { status: "already_accepted" }
      : { status: "not_found" };
  });
}

/** Splits PENDING rows into live invites (holding a seat) and expired ones. */
export function splitInvitations<T extends { expiresAt: Date }>(
  invitations: T[],
  now: Date = new Date(),
): { active: T[]; expired: T[] } {
  const active: T[] = [];
  const expired: T[] = [];
  for (const invitation of invitations) {
    (invitation.expiresAt > now ? active : expired).push(invitation);
  }
  return { active, expired };
}

export interface InvitationLinkDb {
  workspaceInvitation: {
    findFirst(args: {
      where: { id: string; workspaceId: string; status: "PENDING" };
      select: { token: true; expiresAt: true };
    }): Promise<{ token: string; expiresAt: Date } | null>;
  };
}

export type InvitationLinkResult =
  | { status: "ok"; inviteUrl: string }
  | { status: "expired" }
  | { status: "not_found" };

/**
 * The invite link for a live pending invitation in this workspace, for an
 * owner or admin to copy (the caller checks the role). The token is read
 * only on request and is never put in the members page HTML. Accepted,
 * expired and other workspaces' invitations give no link.
 */
export async function pendingInvitationLink(
  db: InvitationLinkDb,
  workspaceId: string,
  invitationId: string,
  appUrl: string,
  now: Date = new Date(),
): Promise<InvitationLinkResult> {
  const invitation = await db.workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId, status: "PENDING" },
    select: { token: true, expiresAt: true },
  });
  if (!invitation) return { status: "not_found" };
  if (invitation.expiresAt <= now) return { status: "expired" };
  return {
    status: "ok",
    inviteUrl: `${appUrl}/invitation?token=${encodeURIComponent(invitation.token)}`,
  };
}
