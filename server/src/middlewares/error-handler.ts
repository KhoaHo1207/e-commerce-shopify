import type { ErrorRequestHandler } from "express";

import { AppError, ValidationError } from "@/errors/index.js";
import { fail, failErrors } from "@/utils/envelope.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(
      failErrors(
        err.issues.map((issue) => ({
          field: issue.field,
          message: issue.message,
          code: err.code,
        }))
      )
    );
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message, err.code));
  }

  console.error(err);

  return res
    .status(500)
    .json(fail("Internal Server Error", "INTERNAL_SERVER_ERROR"));
};
