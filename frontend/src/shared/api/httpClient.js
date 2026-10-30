import axios from 'axios'
import { ENV } from '../lib/env.js'

/**
 * Central axios instance used by every feature API module.
 * - baseURL is relative (/api) so requests go through the Vite proxy in dev
 *   and stay same-origin in production.
 * - withCredentials:true because the backend uses httpOnly cookies for JWT.
 * - X-API-Key header sent if VITE_API_KEY is set.
 * - 401 responses emit a global "auth:unauthorized" event so the auth feature
 *   can react without creating a circular dependency.
 */
export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const API_KEY = ENV.API_KEY
if (API_KEY) {
  api.defaults.headers.common['x-api-key'] = API_KEY
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
