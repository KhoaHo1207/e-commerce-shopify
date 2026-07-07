import "dotenv/config";
import connectDb from "@/config/db.js";
import { createApp } from "@/app.js";

async function mainEntryFunction() {
  await connectDb();

  const app = createApp();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

mainEntryFunction().catch((err) => {
  console.log("Failed to start", err);
  process.exit(1);
});
