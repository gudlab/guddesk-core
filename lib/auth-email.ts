/**
 * Account emails are compared case-insensitively.
 *
 * New addresses are stored trimmed and lowercased (signup, invites, reset
 * tokens). Older rows may still hold capitals ("Jane@Acme.com"), and the
 * column's unique index is case-sensitive, so a lookup tries the exact
 * normalized value first and then a case-insensitive match. Nothing is
 * rewritten and there is no migration.
 */
import type { Adapter, AdapterUser } from "next-auth/adapters";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type UserRow = { id: string; email: string | null; createdAt?: Date };

export interface UserEmailDb<U extends UserRow = UserRow> {
  user: {
    findUnique(args: { where: { email: string } }): Promise<U | null>;
    findFirst(args: {
      where: { email: { equals: string; mode: "insensitive" } };
      orderBy: { createdAt: "asc" };
    }): Promise<U | null>;
  };
}

/**
 * The account for an address, in any case. If two rows differ only in
 * case (possible before this fix), the exact lowercase one wins, then the
 * oldest.
 */
export async function findUserByEmail<U extends UserRow>(db: UserEmailDb<U>, email: string): Promise<U | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return (
    (await db.user.findUnique({ where: { email: normalized } })) ??
    (await db.user.findFirst({
      where: { email: { equals: normalized, mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
    }))
  );
}

/**
 * Auth.js's Prisma adapter looks users up with an exact match. Magic links
 * (Auth.js lowercases the address) and OAuth sign-ins would then miss a
 * mixed-case row and create a second account. This finds it in any case
 * and stores new users' emails normalized.
 */
export function withCaseInsensitiveEmail(adapter: Adapter, db: UserEmailDb): Adapter {
  return {
    ...adapter,
    async getUserByEmail(email: string) {
      const user = await findUserByEmail(db, email);
      return (user as unknown as AdapterUser | null) ?? null;
    },
    ...(adapter.createUser
      ? {
          createUser: (user: AdapterUser) =>
            adapter.createUser!({ ...user, email: normalizeEmail(user.email) }),
        }
      : {}),
  };
}
