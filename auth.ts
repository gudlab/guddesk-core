import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { WorkspaceRole, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { withCaseInsensitiveEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      activeWorkspaceId: string | null;
      activeWorkspaceRole: WorkspaceRole | null;
      activeWorkspaceSlug: string | null;
    } & DefaultSession["user"];
  }
}

export const {
  handlers,
  auth,
} = NextAuth({
  // Magic link and OAuth find a mixed-case account instead of making a second one.
  adapter: withCaseInsensitiveEmail(PrismaAdapter(prisma), prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role as UserRole;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.activeWorkspaceId = (token.activeWorkspaceId as string) ?? null;
        session.user.activeWorkspaceRole = (token.activeWorkspaceRole as WorkspaceRole) ?? null;
        session.user.activeWorkspaceSlug = (token.activeWorkspaceSlug as string) ?? null;
      }

      return session;
    },

    async jwt({ token, trigger }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) return token;

      // Block banned users from getting a valid session
      if (dbUser.isBanned) {
        return {} as typeof token;
      }

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role;

      // On first sign-in or when explicitly triggered, resolve the active workspace
      if (!token.activeWorkspaceId || trigger === "update") {
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: token.sub },
          include: { workspace: { select: { id: true, slug: true } } },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          token.activeWorkspaceId = membership.workspace.id;
          token.activeWorkspaceRole = membership.role;
          token.activeWorkspaceSlug = membership.workspace.slug;
        } else {
          token.activeWorkspaceId = null;
          token.activeWorkspaceRole = null;
          token.activeWorkspaceSlug = null;
        }
      }

      return token;
    },
  },
  ...authConfig,
});
