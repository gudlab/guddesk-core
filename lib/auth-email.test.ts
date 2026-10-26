import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { Adapter, AdapterUser } from "next-auth/adapters";

import { findUserByEmail, normalizeEmail, withCaseInsensitiveEmail, type UserEmailDb } from "./auth-email";
import { forgotPasswordSchema, userAuthSchema, userLoginSchema, userRegisterSchema } from "./validations/auth";
import { workspaceInviteSchema } from "./validations/workspace";

type Row = { id: string; email: string | null; createdAt: Date; password?: string };

/** users with a case-sensitive unique email, like the real column. */
function fakeDb(rows: Row[]) {
  const calls: string[] = [];
  const db: UserEmailDb<Row> = {
    user: {
      async findUnique({ where }) {
        calls.push("findUnique");
        return rows.find((r) => r.email === where.email) ?? null;
      },
      async findFirst({ where }) {
        calls.push("findFirst");
        const want = where.email.equals.toLowerCase();
        return (
          rows
            .filter((r) => r.email?.toLowerCase() === want)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] ?? null
        );
      },
    },
  };
  return { db, calls };
}

const read = (path: string) => readFileSync(join(__dirname, "..", path), "utf8");

describe("account email lookup ignores case", () => {
  it("normalizes by trimming and lowercasing", () => {
    assert.equal(normalizeEmail("  Jane.Doe@Acme.COM \n"), "jane.doe@acme.com");
  });

  it("finds a stored mixed-case account from any spelling (login with capitals in the row)", async () => {
    const { db } = fakeDb([{ id: "u1", email: "Jane.Doe@Acme.com", createdAt: new Date(1) }]);
    for (const typed of ["jane.doe@acme.com", "JANE.DOE@ACME.COM", " Jane.Doe@Acme.com "]) {
      assert.equal((await findUserByEmail(db, typed))?.id, "u1", typed);
    }
  });

  it("uses the exact normalized row first and only then the case-insensitive match", async () => {
    const lower = fakeDb([{ id: "u1", email: "jane@acme.com", createdAt: new Date(1) }]);
    assert.equal((await findUserByEmail(lower.db, "Jane@Acme.com"))?.id, "u1");
    assert.deepEqual(lower.calls, ["findUnique"]);
    // Two rows differing only in case: the exact lowercase one, else the oldest.
    const both = fakeDb([
      { id: "old", email: "JANE@acme.com", createdAt: new Date(1) },
      { id: "lower", email: "jane@acme.com", createdAt: new Date(2) },
    ]);
    assert.equal((await findUserByEmail(both.db, "Jane@acme.com"))?.id, "lower");
    const mixed = fakeDb([
      { id: "newer", email: "Jane@acme.com", createdAt: new Date(2) },
      { id: "older", email: "JANE@acme.com", createdAt: new Date(1) },
    ]);
    assert.equal((await findUserByEmail(mixed.db, "jane@acme.com"))?.id, "older");
  });

  it("an unknown or empty address finds nothing", async () => {
    const { db, calls } = fakeDb([{ id: "u1", email: "jane@acme.com", createdAt: new Date(1) }]);
    assert.equal(await findUserByEmail(db, "bob@acme.com"), null);
    calls.length = 0;
    assert.equal(await findUserByEmail(db, "   "), null);
    assert.deepEqual(calls, []);
  });

  it("magic link / OAuth: the adapter finds a mixed-case account instead of creating a second one", async () => {
    const { db } = fakeDb([{ id: "u1", email: "Jane@Acme.com", createdAt: new Date(1) }]);
    const created: AdapterUser[] = [];
    const base = {
      getUserByEmail: async () => null,
      createUser: async (user: AdapterUser) => {
        created.push(user);
        return user;
      },
    } as unknown as Adapter;
    const adapter = withCaseInsensitiveEmail(base, db);
    // Auth.js lowercases the magic-link identifier before this call.
    assert.equal((await adapter.getUserByEmail!("jane@acme.com"))?.id, "u1");
    await adapter.createUser!({ id: "x", email: " New@Acme.com ", emailVerified: null });
    assert.equal(created[0].email, "new@acme.com");
  });

  it("signup, login, magic link, reset and invite schemas trim and lowercase the email", () => {
    const typed = "  Jane.Doe@Acme.COM ";
    assert.equal(userLoginSchema.parse({ email: typed, password: "x" }).email, "jane.doe@acme.com");
    assert.equal(userRegisterSchema.parse({ name: "J", email: typed, password: "12345678" }).email, "jane.doe@acme.com");
    assert.equal(userAuthSchema.parse({ email: typed }).email, "jane.doe@acme.com");
    assert.equal(forgotPasswordSchema.parse({ email: typed }).email, "jane.doe@acme.com");
    assert.equal(workspaceInviteSchema.parse({ email: typed, role: "AGENT" }).email, "jane.doe@acme.com");
    assert.equal(userLoginSchema.safeParse({ email: "not an email", password: "x" }).success, false);
  });

  it("every account lookup goes through the case-insensitive helper", () => {
    const login = read("auth.config.ts");
    assert.match(login, /findUserByEmail\(prisma, email\)/);
    assert.doesNotMatch(login, /user\.findUnique\(\{\s*where: \{ email/);
    assert.match(read("auth.ts"), /adapter: withCaseInsensitiveEmail\(PrismaAdapter\(prisma\), prisma\)/);
    const register = read("actions/register.ts");
    assert.match(register, /const email = normalizeEmail\(validated\.data\.email\);/);
    assert.match(register, /findUserByEmail\(prisma, email\)/);
    assert.match(read("actions/forgot-password.ts"), /findUserByEmail\(prisma, normalizedEmail\)/);
    assert.match(read("actions/reset-password.ts"), /findUserByEmail\(prisma, resetToken\.email\)/);
    const invite = read("actions/invite-workspace-member.ts");
    assert.match(invite, /findUserByEmail\(prisma, email\)/);
    assert.match(invite, /email: \{ equals: email, mode: "insensitive" \}/);
    assert.match(read("actions/accept-invitation.ts"), /normalizeEmail\(invitation\.email\) !== normalizeEmail\(session\.user\.email\)/);
    for (const file of ["auth.config.ts", "actions/register.ts", "actions/forgot-password.ts", "actions/reset-password.ts", "actions/invite-workspace-member.ts", "lib/user.ts"]) {
      assert.doesNotMatch(read(file), /user\.findUnique\(\{\s*where: \{\s*email/, file);
    }
  });
});
