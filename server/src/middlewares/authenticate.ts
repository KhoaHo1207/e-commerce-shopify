import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "@/errors/index.js";
import { verifyAccessToken } from "@/utils/jwt-util.js";
import { asyncHandler } from "@/middlewares/async-handler.js";

async function authenticateHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Access token required"));
  }

  const token = authHeader.slice(7);

  try {
    req.user = await verifyAccessToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export const authenticate = asyncHandler(authenticateHandler);
