import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | GudDesk",
  description: "Set a new password for your GudDesk account",
};

export default function ResetPasswordPage() {
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
        <h1 className="font-heading text-2xl">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>

        {/* Form */}
        <div className="mt-8 w-full">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
