import { ENV } from "../config/env.js";

/**
 * Guard every API request with the shared API key from `.env`.
 * The frontend sends it via the `x-api-key` header.
 *
 * If API_KEY is empty the check is skipped, so you can develop without one.
 */
export const requireApiKey = (req, res, next) => {
  if (!ENV.apiKey) return next();

  const provided = req.get("x-api-key");
  if (provided !== ENV.apiKey) {
    return res.status(401).json({ message: "Invalid or missing API key" });
  }

  next();
};

export default requireApiKey;