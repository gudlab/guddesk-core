import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserAuthForm } from "@/components/forms/user-auth-form";
import { canonicalUrl } from "@/lib/canonical";
import { loginErrorMessage } from "@/lib/magic-link";
import { isEmailSendingAllowed } from "@/lib/outbound-email";

export const metadata: Metadata = {
  title: "Login | GudDesk",
  description: "Sign in to your GudDesk account",
  alternates: { canonical: canonicalUrl("/login") },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error } = await searchParams;
  const errorMessage = loginErrorMessage(
    Array.isArray(error) ? error[0] : error,
    isEmailSendingAllowed(),
  );

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4">
        {/* Logo */}
        <Image
          src="/guddesk-logo.png"
          alt="GudDesk"
          width={64}
          height={64}
          className="mb-6 rounded-xl"
          priority
        />

        {/* Heading */}
        <h1 className="font-heading text-2xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your GudDesk account
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
          >
            {errorMessage}
          </p>
        )}

        {/* Form */}
        <div className="mt-8 w-full">
          <Suspense>
            <UserAuthForm />
          </Suspense>
        </div>

        {/* Forgot password */}
        <Link
          href="/forgot-password"
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Forgot your password?
        </Link>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
