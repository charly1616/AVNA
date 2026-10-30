export const RESULTS_ENDPOINTS = {
  ACTIVITY_RESULTS: (activityId) => `/activities/${encodeURIComponent(activityId)}/results`,
  ATTEMPT_RESULT: (activityId, attemptId) =>
    `/activities/${encodeURIComponent(activityId)}/results/${encodeURIComponent(attemptId)}`,
  ATTEMPT_ANSWER: (activityId, attemptId, questionId) =>
    `/activities/${encodeURIComponent(activityId)}/results/${encodeURIComponent(attemptId)}/answers/${encodeURIComponent(questionId)}`,
};
