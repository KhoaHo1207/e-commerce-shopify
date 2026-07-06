import argon2 from "argon2";
import { passwordConfig } from "@/config/password-config.js";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, passwordConfig);
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> {
  return argon2.verify(hashedPassword, plainPassword);
}
