import { AppError } from "./app-error.js";

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

//email đã tồn tại, tên đã tồn tại, số điện thoại đã tồn tại
