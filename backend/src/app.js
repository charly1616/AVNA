import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { requireApiKey } from "./middleware/requireApiKey.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import activityRouter from "./routes/activity.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & parsers
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS - httpOnly cookies require `credentials: true`
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowedOrigins = new Set(ENV.clientUrls);
      const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i;

      if (allowedOrigins.has(origin) || localhostPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Global middleware
app.use(requireApiKey);

// Health check (no auth/api-key friction if you want to call from infra)
app.get("/healthz", (_req, res) => res.json({ ok: true, env: ENV.nodeEnv }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/activities", activityRouter);

// Serve built frontend in production
if (ENV.isProduction) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// 404 + error handler - always last
app.use(notFound);
app.use(errorHandler);

export default app;