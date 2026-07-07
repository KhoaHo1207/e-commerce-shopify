import { AppError } from "./app-error.js";

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(public readonly issues: ValidationIssue[]) {
    super("Validation failed", 400, "VALIDATION_ERROR");
  }
}
