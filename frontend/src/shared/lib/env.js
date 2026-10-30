// Centralized environment access for the frontend.
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  API_KEY: import.meta.env.VITE_API_KEY || '',
}
