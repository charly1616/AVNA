import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activities.api.js';

export const activitiesKeys = {
  all: ['activities'],
  list: (params) => [...activitiesKeys.all, 'list', params],
  detail: (id) => [...activitiesKeys.all, 'detail', id],
};

export function useActivities({ page = 1, limit = 100 } = {}) {
  return useQuery({
    queryKey: activitiesKeys.list({ page, limit }),
    queryFn: ({ signal }) => activitiesApi.list({ page, limit, signal }),
    keepPreviousData: true,
  });
}

export function useActivity(id) {
  return useQuery({
    queryKey: activitiesKeys.detail(id),
    queryFn: ({ signal }) => activitiesApi.get(id, signal),
    enabled: !!id,
  });
}

export default { useActivities, useActivity, activitiesKeys };
