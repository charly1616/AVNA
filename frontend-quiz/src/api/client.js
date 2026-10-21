import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const API_KEY = import.meta.env.VITE_API_KEY || "";
if (API_KEY) api.defaults.headers.common["x-api-key"] = API_KEY;
