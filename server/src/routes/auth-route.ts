import { Router } from "express";

import { register } from "@/controllers/auth-controller.js";

import { validate } from "@/middlewares/validate.js";

import { registerSchema } from "@/validators/auth-validator.js";

const authRoute: Router = Router();

authRoute.post("/register", validate(registerSchema), register);

export default authRoute;
