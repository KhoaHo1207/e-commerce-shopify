import { Router } from "express";

import { login, register } from "@/controllers/index.js";
import { asyncHandler } from "@/middlewares/async-handler.js";
import { validate } from "@/middlewares/validate.js";
import { loginSchema, registerSchema } from "@/validators/auth-validator.js";

const authRoute: Router = Router();

authRoute.post("/register", validate(registerSchema), asyncHandler(register));

authRoute.post("/login", validate(loginSchema), asyncHandler(login));

export default authRoute;
