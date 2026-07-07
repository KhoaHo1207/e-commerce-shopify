import type { Request, Response } from "express";

import { authService } from "@/services/index.js";
import { ok } from "@/utils/envelope.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/config/jwt-config.js";

export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(req.body);

  res.status(201).json(ok(user));
}

export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.json(
    ok({
      user,
    })
  );
}
