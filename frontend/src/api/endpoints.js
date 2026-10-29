// In a modular, extensible app, API calls are centralized.
// Change the base path here if you rename the API prefix.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Auth endpoints - only the ones required for Login/Register and session check.
export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
};

export const ACTIVITY_ENDPOINTS = {
  LIST: "/activities",
  DETAIL: (id) => `/activities/${encodeURIComponent(id)}`,
  RESULTS: (id) => `/activities/${encodeURIComponent(id)}/results`,
  RESULT_DETAIL: (id, attemptId) =>
    `/activities/${encodeURIComponent(id)}/results/${encodeURIComponent(attemptId)}`,
  RESULT_ANSWER: (id, attemptId, questionId) =>
    `/activities/${encodeURIComponent(id)}/results/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(questionId)}`,
};