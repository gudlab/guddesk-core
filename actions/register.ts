"use server";

import bcrypt from "bcryptjs";

import { findUserByEmail, normalizeEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
import { userRegisterSchema } from "@/lib/validations/auth";

export async function registerUser(values: {
  name: string;
  email: string;
  password: string;
}) {
  const validated = userRegisterSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields" };
  }

  const { name, password } = validated.data;
  const email = normalizeEmail(validated.data.email);

  // Any case, so "Jane@acme.com" can't sign up again as "jane@acme.com".
  const existingUser = await findUserByEmail(prisma, email);

  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  return { success: "Account created! You can now sign in." };
}
