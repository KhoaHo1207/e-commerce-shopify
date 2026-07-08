import { Router } from "express";

import authRoute from "./auth-route.js";

export const apiRoutes: Router = Router();

apiRoutes.use("/auth", authRoute);

export { authRoute };
