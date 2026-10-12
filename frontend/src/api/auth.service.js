import api from "./axios.js";
import { AUTH_ENDPOINTS } from "./endpoints.js";

/**
 * Thin service layer for auth. Components never touch fetch/axios directly.
 * All API contracts live here so they can be unit-tested or swapped later.
 */
export const authService = {
  async register(name, password) {
    const { data } = await api.post(AUTH_ENDPOINTS.REGISTER, { name, password });
    return data;
  },

  async login(name, password) {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGIN, { name, password });
    return data;
  },

  async logout() {
    const { data } = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return data;
  },

  async me() {
    const { data } = await api.get(AUTH_ENDPOINTS.ME);
    return data;
  },
};

export default authService;