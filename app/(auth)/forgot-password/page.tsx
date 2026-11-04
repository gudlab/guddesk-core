import { Metadata } from "next";
import Image from "next/image";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { canonicalUrl } from "@/lib/canonical";

export const metadata: Metadata = {
  title: "Forgot Password | GudDesk",
  description: "Reset your GudDesk account password",
  alternates: { canonical: canonicalUrl("/forgot-password") },
};

export default function ForgotPasswordPage() {
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
        <h1 className="font-heading text-2xl">Forgot your password?</h1>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </p>

        {/* Form */}
        <div className="mt-8 w-full">
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
