import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types/models'

interface ProtectedRouteProps {
  role?: UserRole
  children: React.ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const shouldRedirectToLogin = !isAuthenticated
  const shouldRedirectToHome = isAuthenticated && role !== undefined && user?.role !== role

  useEffect(() => {
    if (shouldRedirectToLogin) {
      navigate({ to: '/entrar' })
    } else if (shouldRedirectToHome) {
      navigate({ to: '/' })
    }
  }, [shouldRedirectToLogin, shouldRedirectToHome, navigate])

  if (shouldRedirectToLogin || shouldRedirectToHome) {
    return null
  }

  return <>{children}</>
}
