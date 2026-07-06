import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/app-error.js";
import { fail } from "@/utils/envelope.js";

export function errorhandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message, "APP_ERROR"));
  }

  console.error(err);

  return res
    .status(500)
    .json(fail("Internal Server Error", "INTERNAL_SERVER_ERROR"));
}
