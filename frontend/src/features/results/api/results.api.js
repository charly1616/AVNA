import { api } from '@/shared/api/httpClient.js';
import { RESULTS_ENDPOINTS } from './endpoints.js';

/**
 * Results API layer. Transport lives in shared/api/httpClient.js.
 */
export const resultsApi = {
  async getActivityResults(activityId, { signal } = {}) {
    const { data } = await api.get(RESULTS_ENDPOINTS.ACTIVITY_RESULTS(activityId), { signal });
    return data.results;
  },
  async getAttemptResult(activityId, attemptId, { signal } = {}) {
    const { data } = await api.get(RESULTS_ENDPOINTS.ATTEMPT_RESULT(activityId, attemptId), { signal });
    return data.result;
  },
  async updateAnswerCorrectness(activityId, attemptId, questionId, isCorrect) {
    const { data } = await api.patch(RESULTS_ENDPOINTS.ATTEMPT_ANSWER(activityId, attemptId, questionId), { isCorrect });
    return data.result;
  },
};

export default resultsApi;
