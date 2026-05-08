import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/hooks/use-auth'
import { queryClient } from '@/lib/query-client'
import { QUERY_KEYS } from '@/constants/query-keys'
import { ROUTES } from '@/constants/routes'
import type { LoginPayload, RegisterPayload } from '@/services/auth.service'

export function useLogin() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess({ user, token }) {
      setAuth(user, token)
      navigate({ to: ROUTES.home })
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess({ user, token }) {
      setAuth(user, token)
      navigate({ to: ROUTES.home })
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled() {
      clearAuth()
      queryClient.clear()
      navigate({ to: ROUTES.home })
    },
  })
}

export function useMe() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
  })
}
