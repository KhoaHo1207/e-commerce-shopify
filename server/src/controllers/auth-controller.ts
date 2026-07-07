import type { Request, Response } from "express";

import { authService } from "@/services/index.js";
import { ok } from "@/utils/envelope.js";

export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(req.body);

  res.status(201).json(ok(user));
}

export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  res.cookie(
    "refreshToken",

    refreshToken,

    {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "strict",

      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "0"),
    }
  );

  res.json(
    ok({
      accessToken,
      user,
    })
  );
}
