import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLogin, useRegister, useMe } from '@/features/auth/hooks'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken } from '@/test/handlers'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useLogin', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('sets auth state in store after successful login', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ email: 'test@ufmg.br', password: 'password123' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(localStorage.getItem('auth_token')).toBe(mockToken)
  })

  it('sets error state on invalid credentials', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ email: 'wrong@ufmg.br', password: 'wrong' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toMatchObject({ status: 401 })
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('useRegister', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('sets auth state in store after successful registration', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useRegister(), { wrapper })

    act(() => {
      result.current.mutate({
        name: 'Novo Aluno',
        email: 'novo@ufmg.br',
        password: 'senha123',
        password_confirmation: 'senha123',
        role: 'student',
        department_id: 1,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe(mockToken)
  })
})

describe('useMe', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('does not run query when isAuthenticated is false', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useMe(), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('runs query when isAuthenticated is true', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useMe(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockUser)
  })
})
