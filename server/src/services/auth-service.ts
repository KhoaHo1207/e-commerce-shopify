import { MongoServerError } from "mongodb";

import { User } from "@/models/index.js";

import { hashPassword, verifyPassword } from "@/utils/password-util.js";

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/errors/index.js";

import type {
  LoginDto,
  RegisterDto,
  SendOTPDto,
  VerifyOTPDto,
} from "@/validators/auth-validator.js";

import type { RefreshResponseDto, UserResponseDto } from "@/dto/auth-dto.js";
import { toUserResponse } from "@/mappers/user-mapper.js";
import type { AuthTokens } from "@/types/auth-type.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/utils/jwt-util.js";
import crypto from "node:crypto";
class AuthService {
  async register(data: RegisterDto): Promise<UserResponseDto> {
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
        phone: data.phone,
      });

      return toUserResponse(user);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictError("Email already exists");
      }
      throw error;
    }
  }

  async login(data: LoginDto): Promise<AuthTokens & { user: UserResponseDto }> {
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
      phone: user.phone,
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

  async logout(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new UnauthorizedError("Unauthorized");
    }
    const { userId } = await verifyAccessToken(accessToken);
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { userId } = await verifyRefreshToken(refreshToken);
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(payload);

    await User.findByIdAndUpdate(userId, { refreshToken: newRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async sendOTP(data: SendOTPDto): Promise<string> {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isVerified) {
      throw new ConflictError("User already verified");
    }

    if (
      user.otpSentAt &&
      user.otpSentAt > new Date(Date.now() - 5 * 60 * 1000)
    ) {
      throw new ConflictError(
        "OTP already sent. Please wait 5 minutes before requesting a new OTP."
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await User.findByIdAndUpdate(user.id, {
      $set: {
        otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpSentAt: new Date(),
        otpAttempts: 0,
      },
    });

    return otp;
  }

  async verifyOTP(data: VerifyOTPDto): Promise<void> {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isVerified) {
      throw new ConflictError("User already verified");
    }

    if (user.otpAttempts >= 10) {
      throw new UnauthorizedError(
        "Too many OTP attempts. Please request a new OTP."
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new UnauthorizedError("OTP not found");
    }

    if (user.otpExpiresAt < new Date()) {
      await User.findByIdAndUpdate(user.id, {
        $unset: {
          otp: 1,
          otpExpiresAt: 1,
        },
      });

      throw new UnauthorizedError("OTP has expired");
    }

    if (user.otp !== data.otp) {
      await User.findByIdAndUpdate(user.id, {
        $inc: {
          otpAttempts: 1,
        },
      });

      throw new UnauthorizedError("Invalid OTP");
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        isVerified: true,
        otpAttempts: 0,
      },
      $unset: {
        otp: 1,
        otpExpiresAt: 1,
      },
    });
  }
}

export const authService = new AuthService();
