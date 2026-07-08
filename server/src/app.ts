import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { notFound } from "@/middlewares/not-found.js";
import { errorHandler } from "@/middlewares/error-handler.js";
import { apiRoutes } from "@/routes/index.js";
import cookieParser from "cookie-parser";

export function createApp(): Express {
  const app: Express = express();

  const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
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
  app.use(cookieParser());

  app.get("/health", (_req: Request, res: Response) => {
    res.send("Server is running");
  });

  app.use("/api/v1", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
