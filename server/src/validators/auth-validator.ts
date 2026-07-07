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
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email").transform((email) => email.toLowerCase()),

  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof loginSchema>;
