import type { UserResponseDto } from "@/dto/auth-dto.js";

import type { IUser } from "@/models/user-model.js";

import type { HydratedDocument } from "mongoose";

export function toUserResponse(user: HydratedDocument<IUser>): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}
