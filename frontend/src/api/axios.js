import axios from "axios";
import { API_BASE_URL } from "./endpoints.js";

/**
 * Central axios instance:
 * - WithCredentials: true because we use httpOnly cookies for the JWT.
 * - X-API-Key: sent if VITE_API_KEY is set in `.env` (matches backend requireApiKey).
 * - 401: if we ever get an unauthorized response, we broadcast a global
 *   "auth:unauthorized" event so auth store/router can react cleanly.
 */

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const API_KEY = import.meta.env.VITE_API_KEY || "";

if (API_KEY) {
  api.defaults.headers.common["x-api-key"] = API_KEY;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;