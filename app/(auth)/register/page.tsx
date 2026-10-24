import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { UserAuthForm } from "@/components/forms/user-auth-form";

export const metadata: Metadata = {
  title: "Sign Up | GudDesk",
  description: "Create your GudDesk account",
};

export default function RegisterPage() {
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
        <h1 className="font-heading text-2xl">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with GudDesk for free
        </p>

        {/* Form */}
        <div className="mt-8 w-full">
          <Suspense>
            <UserAuthForm type="register" />
          </Suspense>
        </div>

        {/* Terms */}
        <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* Login link */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
