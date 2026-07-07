import type { Request, Response } from "express";

import { authService } from "@/services/auth-service.js";
import { ok } from "@/utils/envelope.js";

export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(req.body);

  res.status(201).json(ok(user));
}
