import { getEnv } from "@/util/get-env.js";

export const ENV = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),

  MONGO_URI: getEnv("MONGO_URI"),
};
