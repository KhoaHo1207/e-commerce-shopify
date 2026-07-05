import express, { type Express, type Request, type Response } from "express";
import connectDb from "./config/db.js";
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

app.get("/", (_req: Request, res: Response) => {
  res.send("E-commerce Shopify Server is running");
});

export default app;
