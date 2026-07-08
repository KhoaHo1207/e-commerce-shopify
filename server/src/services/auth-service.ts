import { MongoServerError } from "mongodb";

import { User } from "@/models/index.js";

import { hashPassword, verifyPassword } from "@/utils/password-util.js";

import {
  ConflictError,
  InternalServerError,
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
import { mailService } from "./mail-service.js";

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

class AuthService {
  async register(data: RegisterDto): Promise<void> {
    const existedUser = await User.findOne({
      email: data.email,
    });
    if (existedUser) {
      throw new ConflictError("Email already exists");
    }
    const hashedPassword = await hashPassword(data.password);

    const isPhoneNumberExists = await User.findOne({
      phone: data.phone,
    });

    if (isPhoneNumberExists) {
      throw new ConflictError("Phone number already exists");
    }

    try {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
      });
      const otp = crypto.randomInt(100000, 1000000).toString();

      await User.findByIdAndUpdate(user.id, {
        $set: {
          otp: hashOtp(otp),
          otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          otpSentAt: new Date(),
          otpAttempts: 0,
        },
      });

      try {
        await mailService.sendOTP(user.email, otp);
      } catch (error) {
        throw new InternalServerError("Failed to send email");
      }
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        if (error.keyPattern?.phone) {
          throw new ConflictError("Phone number already exists");
        }
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

    await User.findByIdAndUpdate(user.id, { refreshToken });

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
    let userId: string | undefined;
    try {
      ({ userId } = await verifyAccessToken(accessToken));
    } catch {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }
    await User.findByIdAndUpdate(userId, { refreshToken: "" });
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedError("Unauthorized");
    }

    let userId: string | undefined;
    try {
      ({ userId } = await verifyRefreshToken(refreshToken));
    } catch {
      throw new UnauthorizedError("Unauthorized");
    }

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Unauthorized");
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

  async sendOTP(data: SendOTPDto): Promise<void> {
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

    try {
      await mailService.sendOTP(user.email, otp);
    } catch (error) {
      throw new InternalServerError("Failed to send email");
    }

    await User.findByIdAndUpdate(user.id, {
      $set: {
        otp: hashOtp(otp),
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpSentAt: new Date(),
        otpAttempts: 0,
      },
    });
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

    if (user.otp !== hashOtp(data.otp)) {
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
