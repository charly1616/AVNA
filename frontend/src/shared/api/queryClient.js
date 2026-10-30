import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack Query client used by every feature.
 * Defaults keep server responses fresh briefly, avoid aggressive refetching,
 * and retry once on transient failures.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
