import type { JWTPayload } from "jose";

export type UserRole = "user" | "admin";

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}
