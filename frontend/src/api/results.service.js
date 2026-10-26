import api from "./axios.js";
import { ACTIVITY_ENDPOINTS } from "./endpoints.js";

export const resultsService = {
  async get(activityId, { signal } = {}) {
    const { data } = await api.get(ACTIVITY_ENDPOINTS.RESULTS(activityId), { signal });
    return data.results;
  },

  async getAttempt(activityId, attemptId, { signal } = {}) {
    const { data } = await api.get(
      ACTIVITY_ENDPOINTS.RESULT_DETAIL(activityId, attemptId),
      { signal }
    );
    return data.result;
  },

  async updateAnswerCorrectness(activityId, attemptId, questionId, isCorrect) {
    const { data } = await api.patch(
      ACTIVITY_ENDPOINTS.RESULT_ANSWER(activityId, attemptId, questionId),
      { isCorrect }
    );
    return data.result;
  },
};

export default resultsService;
