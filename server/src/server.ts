import server from "./app.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} on ${ENV.NODE_ENV} mode`);
});

export default server;
