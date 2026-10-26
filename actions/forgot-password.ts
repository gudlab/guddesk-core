"use server";

import crypto from "crypto";
import { after } from "next/server";

import { findUserByEmail, normalizeEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
import { emailFrom } from "@/lib/email/from";
import { sendEmail } from "@/lib/email/send";
import { PASSWORD_RESET_NEUTRAL_MESSAGE } from "@/lib/password-reset-neutral";
import { deferPasswordReset } from "@/lib/password-reset-request";
import { env } from "@/env.mjs";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function forgotPassword(values: { email: string }) {
  const validated = forgotPasswordSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated.data;
  const normalizedEmail = normalizeEmail(email);

  // Answer now, before the lookup. The lookup and the email run after the
  // response, so a known and an unknown address take the same time and get
  // the same answer, and this can't be used to find accounts.
  deferPasswordReset(normalizedEmail, after, sendResetIfAccount);

  return { success: PASSWORD_RESET_NEUTRAL_MESSAGE };
}

/** Runs after the response. Does nothing for an unknown address. */
async function sendResetIfAccount(normalizedEmail: string): Promise<void> {
  const user = await findUserByEmail(prisma, normalizedEmail);

  if (!user || !user.password) return;

  // Delete existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email: normalizedEmail },
  });

  // Generate a secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      token,
      expires,
    },
  });

  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  // A failed send is logged, redacted, inside sendEmail.
  await sendEmail("password-reset", {
    from: emailFrom(),
    to: normalizedEmail,
    subject: "Reset your GudDesk password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 0;">
          <div style="background-color: #3ECF8E; border-radius: 8px 8px 0 0; padding: 20px 24px; text-align: center;">
            <span style="color: white; font-size: 18px; font-weight: 700;">GudDesk</span>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; background: white; padding: 24px;">
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px; color: #1f2937;">Reset your password</h2>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset the password for your GudDesk account.
              Click the button below to choose a new password. This link expires in 1 hour.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #3ECF8E; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
            GudDesk — Open-source customer messaging platform
          </p>
        </div>
      `,
  });
}
