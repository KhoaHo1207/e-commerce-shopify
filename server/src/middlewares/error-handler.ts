import type { ErrorRequestHandler } from "express";

import { AppError } from "@/errors/app-error.js";

import { ValidationError } from "@/errors/validation-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,

      status: "error",

      errors: err.issues,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,

      status: "error",

      errors: [
        {
          message: err.message,

          code: err.code,
        },
      ],
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,

    status: "error",

    errors: [
      {
        message: "Internal Server Error",
      },
    ],
  });
};
