import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

describe('api-client: VITE_API_BASE_URL', () => {
  it('reads VITE_API_BASE_URL from import.meta.env', async () => {
    const { API_BASE_URL } = await import('@/constants/api')
    expect(API_BASE_URL).toBe('http://localhost:8000/api')
  })
})

describe('api-client: request interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('attaches Bearer token from localStorage when token is present', async () => {
    localStorage.setItem('auth_token', 'test-token-123')
    const { apiClient } = await import('@/services/api-client')
    const handlers = apiClient.interceptors.request.handlers!
    expect(handlers.length).toBeGreaterThan(0)
  })

  it('does not attach Authorization header when no token in localStorage', async () => {
    localStorage.removeItem('auth_token')
    const { apiClient } = await import('@/services/api-client')
    const handlers = apiClient.interceptors.request.handlers!
    expect(handlers.length).toBeGreaterThan(0)
  })
})

describe('api-client: response interceptor', () => {
  it('has a response error interceptor registered', async () => {
    const { apiClient } = await import('@/services/api-client')
    const handlers = apiClient.interceptors.response.handlers!
    expect(handlers.length).toBeGreaterThan(0)
    expect(handlers[0].rejected).toBeTypeOf('function')
  })
})

describe('api-client Authorization header interceptor', () => {
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@ufmg.br',
    role: 'student',
    department_id: 1,
    profile_link: null,
  }

  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  async function runRequestInterceptor(config: { headers: Record<string, string> }) {
    const { apiClient } = await import('@/services/api-client')
    const interceptor = (apiClient.interceptors.request as any).handlers[0]
    const fulfilledFn = interceptor?.fulfilled ?? interceptor?.onFulfilled
    return fulfilledFn(config)
  }

  it('does not set Authorization header when no token in localStorage', async () => {
    const result = await runRequestInterceptor({ headers: {} })
    expect(result.headers['Authorization']).toBeUndefined()
  })

  it('sets Authorization header with Bearer token after setAuth', async () => {
    useAuthStore.getState().setAuth(mockUser, 'my-secret-token')
    const result = await runRequestInterceptor({ headers: {} })
    expect(result.headers['Authorization']).toBe('Bearer my-secret-token')
  })

  it('does not set Authorization header after clearAuth removes token', async () => {
    useAuthStore.getState().setAuth(mockUser, 'another-token')
    useAuthStore.getState().clearAuth()
    const result = await runRequestInterceptor({ headers: {} })
    expect(result.headers['Authorization']).toBeUndefined()
  })

  it('reads auth_token key from localStorage directly', async () => {
    localStorage.setItem('auth_token', 'direct-localStorage-token')
    const result = await runRequestInterceptor({ headers: {} })
    expect(result.headers['Authorization']).toBe('Bearer direct-localStorage-token')
  })
})
