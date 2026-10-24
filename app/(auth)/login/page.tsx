import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserAuthForm } from "@/components/forms/user-auth-form";

export const metadata: Metadata = {
  title: "Login | GudDesk",
  description: "Sign in to your GudDesk account",
};

export default function LoginPage() {
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
