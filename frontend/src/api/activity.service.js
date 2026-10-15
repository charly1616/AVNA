import api from "./axios.js";
import { ACTIVITY_ENDPOINTS } from "./endpoints.js";

export const activityService = {
  async list({ page = 1, limit = 100, signal } = {}) {
    const { data } = await api.get(ACTIVITY_ENDPOINTS.LIST, {
      params: { page, limit },
      signal,
    });
    return data;
  },

  async get(id, signal) {
    const { data } = await api.get(ACTIVITY_ENDPOINTS.DETAIL(id), { signal });
    return data.activity;
  },

  async create(activity) {
    const { data } = await api.post(ACTIVITY_ENDPOINTS.LIST, activity);
    return data.activity;
  },

  async update(id, changes) {
    const { data } = await api.patch(ACTIVITY_ENDPOINTS.DETAIL(id), changes);
    return data.activity;
  },

  async saveQuestions(id, questions) {
    const { data } = await api.put(`${ACTIVITY_ENDPOINTS.DETAIL(id)}/questions`, { questions });
    return data.activity;
  },

  async remove(id) {
    const { data } = await api.delete(ACTIVITY_ENDPOINTS.DETAIL(id));
    return data;
  },
};

export default activityService;