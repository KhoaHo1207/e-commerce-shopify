import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { notFound } from "@/middlewares/not-found.js";
import { errorHandler } from "@/middlewares/error-handler.js";
import authRoute from "./routes/auth-route.js";

export function createApp(): Express {
  const app: Express = express();

  const corsOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Range", "X-Total-Count"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(helmet());

  app.get("/health", (_req: Request, res: Response) => {
    res.send("Server is running");
  });

  app.use("/api/v1/auth", authRoute);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
