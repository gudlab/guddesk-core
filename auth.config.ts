import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { emailFrom } from "@/lib/email/from";
import { sendMagicLinkSafely } from "@/lib/email/send";
import { userLoginSchema } from "@/lib/validations/auth";

const MAGIC_LINK_FROM = emailFrom();

// Auth.js's own Resend send, wrapped so a failure is logged redacted and
// rethrown without addresses.
const magicLink = Resend({
  apiKey: env.RESEND_API_KEY,
  from: MAGIC_LINK_FROM,
});

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    {
      ...magicLink,
      options: {
        ...magicLink.options,
        sendVerificationRequest: (params) =>
          sendMagicLinkSafely(params.identifier, () =>
            magicLink.sendVerificationRequest(params),
          ),
      },
    },
    Credentials({
      async authorize(credentials) {
        const validated = userLoginSchema.safeParse(credentials);

        if (!validated.success) return null;

        const { email, password } = validated.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return null;

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
