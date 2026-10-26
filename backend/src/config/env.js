import "dotenv/config";

/**
 * Every environment variable is read here, once, and validated.
 * Nothing else in the codebase should touch `process.env` directly,
 * so there is a single file to look at when a variable is missing.
 */

const required = (key, { devFallback } = {}) => {
  const value = process.env[key];

  if (value) return value;

  if (process.env.NODE_ENV !== "production" && devFallback !== undefined) {
    return String(devFallback);
  }

  throw new Error(
    `Missing required environment variable: ${key}. Copy backend/.env.example to backend/.env and set it.`
  );
};

const optional = (key, fallback = "") => process.env[key] ?? fallback;

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
};

const isProduction = process.env.NODE_ENV === "production";

export const ENV = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,

  port: toNumber(process.env.PORT, 4000),

  // CORS: allowed origins. In development the common Vite ports are allowed
  // automatically; in production only CLIENT_URL is trusted.
  clientUrls: optional(
    "CLIENT_URL",
    isProduction
      ? ""
      : "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176"
  )
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),

  mongodbUri: required("MONGODB_URI", { devFallback: "mongodb://127.0.0.1:27017/teacher_portal" }),
  mongodbDbName: optional("MONGODB_DB", "teacher_portal"),

  // Empty string disables the x-api-key check entirely.
  apiKey: optional("API_KEY"),

  // Where the public quiz app is served. The share link teachers copy points here.
  quizAppUrl: optional("QUIZ_APP_URL", "http://localhost:5176"),

  // Gemini is used to verify free-text (concepts) answers. Empty disables
  // the check and the quiz keeps working with manual teacher review.
  geminiApiKey: optional("GEMINI_API_KEY"),
  geminiModel: optional("GEMINI_MODEL", "gemini-3.1-flash-lite"),
  geminiBaseUrl: optional(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta"
  ).replace(/\/+$/, ""),
  geminiTimeoutMs: toNumber(process.env.GEMINI_TIMEOUT_MS, 30000),

  jwtSecret: required("JWT_SECRET", { devFallback: "dev-only-insecure-secret" }),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  activityLinkSecret: required("ACTIVITY_LINK_SECRET", { devFallback: "dev-only-insecure-activity-link-secret" }),

  cookie: {
    name: optional("COOKIE_NAME", "token"),
    secure: toBoolean(process.env.COOKIE_SECURE, isProduction),
    sameSite: isProduction ? "none" : "lax",
  },

  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
};

export default ENV;
