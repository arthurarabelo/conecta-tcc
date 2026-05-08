import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/models'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth(user, token) {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth() {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'conecta-tcc-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true
        }
      },
    },
  ),
)
