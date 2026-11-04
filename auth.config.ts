import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";

import { env } from "@/env.mjs";
import { findUserByEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/db";
import { userLoginSchema } from "@/lib/validations/auth";
import { sendMagicLink } from "@/lib/magic-link";
import { emailFrom } from "@/lib/email/from";

const MAGIC_LINK_FROM = emailFrom();
const defaultMagicLinkSend = Resend({
  apiKey: env.RESEND_API_KEY,
  from: MAGIC_LINK_FROM,
}).sendVerificationRequest;

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: MAGIC_LINK_FROM,
      // Same email as Auth.js sends, but through the gate in
      // lib/outbound-email.ts.
      // The signIn callback in auth.ts stops a blocked magic link first.
      // This still throws if the gate skips the email, so the user never
      // sees "check your email" for a link that was not sent.
      sendVerificationRequest: (params) =>
        sendMagicLink(params.identifier, () => defaultMagicLinkSend(params)),
    }),
    Credentials({
      async authorize(credentials) {
        const validated = userLoginSchema.safeParse(credentials);

        if (!validated.success) return null;

        const { email, password } = validated.data;

        // Any case: older accounts may be stored with capitals.
        const user = await findUserByEmail(prisma, email);

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
