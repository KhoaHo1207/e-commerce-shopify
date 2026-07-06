import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
/* */
import connectDb from "@/config/db.js";
import { notFound } from "@/middlewares/not-found.js";
import { errorhandler } from "@/middlewares/error-handler.js";

async function mainEntryFunction() {
  await connectDb();

  const app: Express = express();

  const corsOrigins = (process.env.COR_ORIGIN || "")
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

  app.use(notFound);
  app.use(errorhandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

mainEntryFunction().catch((err) => {
  console.log("Failed to start", err), process.exit(1);
});
