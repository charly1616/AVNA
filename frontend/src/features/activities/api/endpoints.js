export const ACTIVITY_ENDPOINTS = {
  LIST: "/activities",
  DETAIL: (id) => `/activities/${encodeURIComponent(id)}`,
  RESULTS: (id) => `/activities/${encodeURIComponent(id)}/results`,
  RESULT_DETAIL: (id, attemptId) => `/activities/${encodeURIComponent(id)}/results/${encodeURIComponent(attemptId)}`,
  RESULT_ANSWER: (id, attemptId, questionId) =>
    `/activities/${encodeURIComponent(id)}/results/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(questionId)}`,
  SAVE_QUESTIONS: (id) => `/activities/${encodeURIComponent(id)}/questions`,
};
