import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

const start = async () => {
  try {
    await connectDatabase();
    app.listen(ENV.port, () => {
      console.log(`[server] listening on http://localhost:${ENV.port} (${ENV.nodeEnv})`);
    });
  } catch (error) {
    console.error("[server] failed to start", error);
    process.exit(1);
  }
};

start();