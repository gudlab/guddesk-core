"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";
import { forgotPassword } from "@/actions/forgot-password";

type FormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const result = await forgotPassword(data);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        setIsSubmitted(true);
        toast.success(result.success);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }

    setIsLoading(false);
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Icons.mail className="size-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-heading text-lg">Check your email</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for that email, you&apos;ll get a reset link
            shortly. The link expires in 1 hour.
          </p>
        </div>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", rounded: "xl" }),
            "mt-4",
          )}
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            className={cn(buttonVariants(), "mt-1")}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Send Reset Link
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
