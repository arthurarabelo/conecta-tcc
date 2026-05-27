import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  department_id: 1,
  profile_link: null,
}

const mockToken = 'test-token-abc123'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  describe('setAuth', () => {
    it('sets user, token and isAuthenticated to true', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('persists auth_token to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      expect(localStorage.getItem('auth_token')).toBe(mockToken)
    })

    it('persists state to localStorage under conecta-tcc-auth key', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      const stored = localStorage.getItem('conecta-tcc-auth')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.state.user).toEqual(mockUser)
      expect(parsed.state.token).toBe(mockToken)
    })
  })

  describe('clearAuth', () => {
    it('clears user, token and sets isAuthenticated to false', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('removes auth_token from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('isAuthenticated toggle', () => {
    it('starts as false', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('becomes true after setAuth', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('becomes false after clearAuth', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('Zustand persist hydration', () => {
    it('restores state from localStorage on store creation', () => {
      const persistedState = {
        state: { user: mockUser, token: mockToken },
        version: 0,
      }
      localStorage.setItem('conecta-tcc-auth', JSON.stringify(persistedState))
      localStorage.setItem('auth_token', mockToken)

      useAuthStore.persist.rehydrate()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('does not set isAuthenticated when no token in persisted state', () => {
      const persistedState = {
        state: { user: null, token: null },
        version: 0,
      }
      localStorage.setItem('conecta-tcc-auth', JSON.stringify(persistedState))

      useAuthStore.persist.rehydrate()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })
})
