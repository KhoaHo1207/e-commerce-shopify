import type { RequestHandler } from "express";

import { fail } from "@/utils/envelope.js";

export const notFound: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(fail(`Cannot ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};
