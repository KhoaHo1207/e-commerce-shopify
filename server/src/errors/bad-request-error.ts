import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

//sai format request, thiếu dữ liệu, business rule không hợp lệ
