import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../api/results.api.js';

export const resultsKeys = {
  all: ['results'],
  dashboard: (activityId) => [...resultsKeys.all, 'dashboard', activityId],
  attempt: (activityId, attemptId) => [...resultsKeys.all, 'attempt', activityId, attemptId],
};

export function useActivityResults(activityId) {
  return useQuery({
    queryKey: resultsKeys.dashboard(activityId),
    queryFn: ({ signal }) => resultsApi.getActivityResults(activityId, { signal }),
    enabled: !!activityId,
  });
}

export function useAttemptResult(activityId, attemptId) {
  return useQuery({
    queryKey: resultsKeys.attempt(activityId, attemptId),
    queryFn: ({ signal }) => resultsApi.getAttemptResult(activityId, attemptId, { signal }),
    enabled: !!activityId && !!attemptId,
  });
}

export default { useActivityResults, useAttemptResult, resultsKeys };
