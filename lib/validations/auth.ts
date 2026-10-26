import * as z from "zod"

// Emails are trimmed and lowercased before validation (lib/auth-email.ts).
const email = (message?: string) => z.string().trim().toLowerCase().email(message)

export const userAuthSchema = z.object({
  email: email(),
})

export const userLoginSchema = z.object({
  email: email(),
  password: z.string().min(1, "Password is required"),
})

export const userRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const forgotPasswordSchema = z.object({
  email: email("Please enter a valid email address"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
