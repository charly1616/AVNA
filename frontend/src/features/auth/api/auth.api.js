import { api } from '@/shared/api/httpClient.js';
import { AUTH_ENDPOINTS } from './endpoints.js';

/**
 * Auth API layer. Transport lives in shared/api/httpClient.js; this module only
 * owns auth endpoint contracts.
 */
export const authApi = {
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

export default authApi;
