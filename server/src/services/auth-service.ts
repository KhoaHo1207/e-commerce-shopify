import { MongoServerError } from "mongodb";

import User from "@/models/user-model.js";

import { hashPassword } from "@/utils/password-util.js";

import { ConflictError } from "@/errors/conflict-error.js";

import type { RegisterDto } from "@/validators/auth-validator.js";

import { toUserResponse } from "@/mappers/user-mapper.js";

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
}

export const authService = new AuthService();
