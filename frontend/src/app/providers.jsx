import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/api/queryClient.js'
import { useAuthStore } from '@/features/auth/store/auth.store.js'

/**
 * App shell providers.
 * - QueryClientProvider makes TanStack Query available to every feature.
 * - Auth bootstrap runs once on mount so the session is restored before pages render.
 */
export function Providers({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default Providers
