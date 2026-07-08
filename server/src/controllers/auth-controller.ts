import type { Request, Response } from "express";

import { authService } from "@/services/index.js";
import { ok } from "@/utils/envelope.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/config/jwt-config.js";
import type { LoginResponseDto } from "@/dto/auth-dto.js";

export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(req.body);

  res.status(201).json(ok(null));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  const body: LoginResponseDto = { user };
  console.log(body);
  res.status(200).json(ok(body));
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { accessToken } = req.cookies;
  await authService.logout(accessToken);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json(ok(null));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken: oldRefreshToken } = req.cookies;
  const { accessToken, refreshToken } = await authService.refresh(
    oldRefreshToken
  );

  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json(ok(null));
}

export async function sendOTP(req: Request, res: Response): Promise<void> {
  const otp = await authService.sendOTP(req.body);
  res.status(200).json(ok(otp));
}

export async function verifyOTP(req: Request, res: Response): Promise<void> {
  await authService.verifyOTP(req.body);
  res.status(200).json(ok(null));
}
