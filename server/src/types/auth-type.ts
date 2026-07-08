// Internal types — dùng trong backend, KHÔNG phải contract HTTP.

import type { JWTPayload } from "jose";

export type UserRole = "user" | "admin";

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Cặp token sinh ra khi đăng nhập — gửi qua cookie, không nằm trong response body.
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
