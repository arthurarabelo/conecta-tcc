import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProposals, useProposal, useCreateProposal, useApplyToProposal } from '../index'
import { useAuthStore } from '@/store/auth.store'
import { mockProposals } from '@/test/handlers/proposals'
import type { User } from '@/types/models'

const mockProfessor: User = {
  id: 10, name: 'Prof. Silva', email: 'silva@ufmg.br',
  role: 'professor', department_id: 1, profile_link: null,
}

const mockStudent: User = {
  id: 2, name: 'Aluno', email: 'aluno@ufmg.br',
  role: 'student', department_id: 1, profile_link: null,
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useProposals', () => {
  it('returns paginated list of proposals', async () => {
    const { result } = renderHook(() => useProposals(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(3)
    expect(result.current.data?.meta.total).toBe(3)
  })

  it('filters by status=open and returns only open proposals', async () => {
    const { result } = renderHook(() => useProposals({ status: 'open' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const proposals = result.current.data?.data ?? []
    expect(proposals.every((p) => p.status === 'open')).toBe(true)
    expect(proposals).toHaveLength(2)
  })

  it('works without authentication', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    const { result } = renderHook(() => useProposals(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBeGreaterThan(0)
  })
})

describe('useProposal', () => {
  it('returns a single proposal with professor, department, and area', async () => {
    const { result } = renderHook(() => useProposal(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const proposal = result.current.data!
    expect(proposal.id).toBe(1)
    expect(proposal.title).toBe(mockProposals[0].title)
    expect(proposal.professor).toBeDefined()
    expect(proposal.department).toBeDefined()
    expect(proposal.area).toBeDefined()
  })

  it('is disabled for id=0', () => {
    const { result } = renderHook(() => useProposal(0), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateProposal', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockProfessor, token: 'prof-token', isAuthenticated: true })
    localStorage.setItem('auth_token', 'prof-token')
  })

  it('creates a proposal as professor and returns the new proposal', async () => {
    const { result } = renderHook(() => useCreateProposal(), { wrapper })

    await act(async () => {
      result.current.mutate({
        title: 'Nova Proposta de TCC',
        description: 'Descrição detalhada da proposta com pelo menos 20 caracteres.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(99)
    expect(result.current.data?.status).toBe('open')
  })

  it('fails without authentication token', async () => {
    localStorage.removeItem('auth_token')
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })

    const { result } = renderHook(() => useCreateProposal(), { wrapper })

    await act(async () => {
      result.current.mutate({
        title: 'Nova Proposta de TCC',
        description: 'Descrição detalhada da proposta com pelo menos 20 caracteres.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useApplyToProposal', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockStudent, token: 'student-token', isAuthenticated: true })
    localStorage.setItem('auth_token', 'student-token')
  })

  it('applies to an open proposal as a student', async () => {
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => { result.current.mutate(1) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.proposal_id).toBe(1)
    expect(result.current.data?.status).toBe('pending')
  })

  it('returns error when applying to a closed proposal', async () => {
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => { result.current.mutate(3) })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('fails without authentication token', async () => {
    localStorage.removeItem('auth_token')
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => { result.current.mutate(1) })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
