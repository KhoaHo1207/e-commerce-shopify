// Input DTOs — schema Zod validate request body + type suy ra từ schema.

import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50),

  email: z.email("Invalid email").transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100),

  phone: z.string().length(10, "Phone must contain 10 characters"),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email").transform((email) => email.toLowerCase()),

  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const sendOTPSchema = z.object({
  email: z.email("Invalid email").transform((email) => email.toLowerCase()),
});

export type SendOTPDto = z.infer<typeof sendOTPSchema>;

export const verifyOTPSchema = z.object({
  email: z.email("Invalid email").transform((email) => email.toLowerCase()),
  otp: z.string().length(6, "OTP must contain 6 characters"),
});

export type VerifyOTPDto = z.infer<typeof verifyOTPSchema>;
