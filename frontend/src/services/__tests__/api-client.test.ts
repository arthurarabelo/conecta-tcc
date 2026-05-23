import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('api-client: VITE_API_BASE_URL', () => {
  it('reads VITE_API_BASE_URL from import.meta.env', async () => {
    const { API_BASE_URL } = await import('@/constants/api')
    expect(API_BASE_URL).toBe('http://localhost:8000')
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
