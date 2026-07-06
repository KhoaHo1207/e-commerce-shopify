import mongoose from "mongoose";

export default async function connectDb(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  const conn = await mongoose.connect(mongoUri);

  console.info(`MongoDB connected: ${conn.connection.host}`);
}
