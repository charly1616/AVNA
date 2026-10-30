import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi } from '../api/results.api.js';
import { resultsKeys } from './useActivityResults.js';

export function useUpdateAnswerCorrectness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, attemptId, questionId, isCorrect }) =>
      resultsApi.updateAnswerCorrectness(activityId, attemptId, questionId, isCorrect),
    onSuccess: (_, { activityId, attemptId }) => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.attempt(activityId, attemptId) });
      queryClient.invalidateQueries({ queryKey: resultsKeys.dashboard(activityId) });
    },
  });
}

export default { useUpdateAnswerCorrectness };
