import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../api/activities.api.js';
import { activitiesKeys } from './useActivities.js';

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }) => activitiesApi.update(id, changes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activitiesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
    },
  });
}

export function useSaveQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questions }) => activitiesApi.saveQuestions(id, questions),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: activitiesKeys.detail(id) });
    },
  });
}

export default { useCreateActivity, useUpdateActivity, useDeleteActivity, useSaveQuestions };
