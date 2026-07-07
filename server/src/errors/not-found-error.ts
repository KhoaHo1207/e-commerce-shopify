import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

//resource không tồn tại, user không tồn tại, product không tồn tại...
