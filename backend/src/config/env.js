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

  // CORS: allow a list of origins, including the common Vite dev ports.
  clientUrls: optional(
    "CLIENT_URL",
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
  )
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),

  mongodbUri: required("MONGODB_URI", { devFallback: "mongodb://127.0.0.1:27017/teacher_portal" }),
  mongodbDbName: optional("MONGODB_DB", "teacher_portal"),

  // Empty string disables the x-api-key check entirely.
  apiKey: optional("API_KEY"),

  jwtSecret: required("JWT_SECRET", { devFallback: "dev-only-insecure-secret" }),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),

  cookie: {
    name: optional("COOKIE_NAME", "token"),
    secure: toBoolean(process.env.COOKIE_SECURE, isProduction),
    sameSite: isProduction ? "none" : "lax",
  },

  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
};

export default ENV;