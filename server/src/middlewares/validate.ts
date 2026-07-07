import type { NextFunction, Request, Response } from "express";

import type { ZodTypeAny } from "zod";

import { ValidationError } from "@/errors/validation-error.js";

export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new ValidationError(errors);
    }

    req.body = result.data;

    next();
  };
}
