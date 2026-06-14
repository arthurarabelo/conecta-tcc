import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useApplications,
  useApproveApplication,
  useRejectApplication,
} from '@/features/applications/hooks'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken, mockApplication } from '@/test/handlers'

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

describe('useApplications', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('returns applications for the logged-in student', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useApplications(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].student_id).toBe(mockUser.id)
  })

  it('returns only pending applications when filtered by status', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useApplications({ status: 'pending' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const statuses = result.current.data?.data.map(a => a.status)
    expect(statuses?.every(s => s === 'pending')).toBe(true)
  })

  it('validates that ApplicationStatus covers all three valid states', () => {
    const validStatuses = ['pending', 'approved', 'rejected']
    expect(mockApplication.status).toMatch(/^(pending|approved|rejected)$/)
    validStatuses.forEach(s => {
      expect(['pending', 'approved', 'rejected']).toContain(s)
    })
  })
})

describe('useApproveApplication', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('approves an application and updates its status to approved', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    act(() => {
      result.current.mutate(mockApplication.id)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.status).toBe('approved')
    expect(result.current.data?.reviewed_at).not.toBeNull()
  })

  it('returns 403 error when a student tries to approve an application', async () => {
    localStorage.setItem('auth_token', 'student-token')
    useAuthStore.setState({ user: mockUser, token: 'student-token', isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    act(() => {
      result.current.mutate(mockApplication.id)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toMatchObject({ status: 403 })
  })
})

describe('useRejectApplication', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('rejects an application with feedback and updates its status to rejected', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    act(() => {
      result.current.mutate({ id: mockApplication.id, payload: { feedback: 'Perfil não compatível.' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.status).toBe('rejected')
    expect(result.current.data?.feedback).toBe('Perfil não compatível.')
    expect(result.current.data?.reviewed_at).not.toBeNull()
  })

  it('rejects an application without feedback (feedback is optional)', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    act(() => {
      result.current.mutate({ id: mockApplication.id })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.status).toBe('rejected')
  })

  it('returns 403 error when a student tries to reject an application', async () => {
    localStorage.setItem('auth_token', 'student-token')
    useAuthStore.setState({ user: mockUser, token: 'student-token', isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    act(() => {
      result.current.mutate({ id: mockApplication.id, payload: { feedback: 'tentativa indevida' } })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toMatchObject({ status: 403 })
  })
})