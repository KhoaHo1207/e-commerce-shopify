import { Router } from "express";

import {
  login,
  register,
  logout,
  refresh,
  sendOTP,
  verifyOTP,
} from "@/controllers/index.js";
import { asyncHandler } from "@/middlewares/async-handler.js";
import { validate } from "@/middlewares/validate.js";
import {
  loginSchema,
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from "@/validators/auth-validator.js";

const authRoute: Router = Router();

authRoute.post("/register", validate(registerSchema), asyncHandler(register));
authRoute.post("/login", validate(loginSchema), asyncHandler(login));
authRoute.post("/logout", asyncHandler(logout));
authRoute.post("/refresh-token", asyncHandler(refresh));
authRoute.post("/send-otp", validate(sendOTPSchema), asyncHandler(sendOTP));
authRoute.post(
  "/verify-otp",
  validate(verifyOTPSchema),
  asyncHandler(verifyOTP)
);
export default authRoute;
