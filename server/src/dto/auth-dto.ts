// Response DTOs — hình dạng dữ liệu trả về client (nằm trong `data` của envelope).

import type { UserRole } from "@/types/auth-type.js";

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

// Body của POST /auth/login — token đi qua cookie nên chỉ trả về user.
export interface LoginResponseDto {
  user: UserResponseDto;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}
