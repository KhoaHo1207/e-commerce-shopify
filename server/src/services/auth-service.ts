import { MongoServerError } from "mongodb";

import { User } from "@/models/index.js";

import { hashPassword, verifyPassword } from "@/utils/password-util.js";

import { ConflictError, UnauthorizedError } from "@/errors/index.js";

import type { LoginDto, RegisterDto } from "@/validators/auth-validator.js";

import { toUserResponse } from "@/mappers/user-mapper.js";
import { signAccessToken, signRefreshToken } from "@/utils/jwt-util.js";
import type { UserResponseDto } from "@/dto/auth-dto.js";
class AuthService {
  async register(data: RegisterDto) {
    const existedUser = await User.findOne({
      email: data.email,
    });

    if (existedUser) {
      throw new ConflictError("Email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    try {
      const user = await User.create({
        name: data.name,

        email: data.email,

        password: hashedPassword,
      });

      return toUserResponse(user);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictError("Email already exists");
      }

      throw error;
    }
  }
  async login(data: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const user = await User.findOne({
      email: data.email,
    }).select("+password");

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const matched = await verifyPassword(user.password, data.password);

    if (!matched) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload = {
      userId: user.id,

      email: user.email,

      role: user.role,
    };

    const accessToken = await signAccessToken(payload);

    const refreshToken = await signRefreshToken(payload);

    return {
      accessToken,

      refreshToken,

      user: toUserResponse(user),
    };
  }
}

export const authService = new AuthService();
