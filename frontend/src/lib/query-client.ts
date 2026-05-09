import { QueryClient } from '@tanstack/react-query'
import { AuthError } from './error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof AuthError) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
