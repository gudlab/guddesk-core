"use server";

import bcrypt from "bcryptjs";

import { findUserByEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function resetPassword(values: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const validated = resetPasswordSchema.safeParse(values);

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" };
  }

  const { token, password } = validated.data;

  // Find the token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { error: "Invalid or expired reset link. Please request a new one." };
  }

  // Check expiry
  if (resetToken.expires < new Date()) {
    // Clean up expired token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { error: "This reset link has expired. Please request a new one." };
  }

  // Find the user, in any case (the token holds the normalized address).
  const user = await findUserByEmail(prisma, resetToken.email);

  if (!user) {
    return { error: "Account not found." };
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete the used token (and any other tokens for this email)
  await prisma.passwordResetToken.deleteMany({
    where: { email: resetToken.email },
  });

  return { success: "Password reset successfully. You can now sign in." };
}
