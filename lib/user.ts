import { findUserByEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await findUserByEmail(prisma, email);

    return user ? { name: user.name, emailVerified: user.emailVerified } : null;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};