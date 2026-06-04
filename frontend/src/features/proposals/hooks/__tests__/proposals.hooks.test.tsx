import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import {
  useProposals,
  useProposal,
  useCreateProposal,
  useDeleteProposal,
  useApplyToProposal,
} from '..'
import type { ReactNode } from 'react'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { wrapper: Wrapper, queryClient }
}

describe('useProposals', () => {
  it('returns paginated proposal list with data and meta', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(2)
    expect(result.current.data?.meta.total).toBe(2)
  })

  it('passes filters to the API', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals({ status: 'open' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.every((p) => p.status === 'open')).toBe(true)
  })

  it('starts in loading state', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useProposal', () => {
  it('returns a single proposal by id', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(1)
    expect(result.current.data?.title).toBe('Redes Neurais para Reconhecimento de Imagens')
  })

  it('is disabled when id is 0', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(0), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('enters error state for a non-existent id', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(9999), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateProposal', () => {
  it('creates a proposal and resolves with the new resource', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        title: 'Proposta via Hook',
        description: 'Descrição da proposta criada através do hook useCreateProposal no teste.',
        max_slots: 1,
        department_id: 1,
        area_id: 1,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(99)
  })

  it('invalidates the proposals cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        title: 'Proposta Invalidação',
        description: 'Verificar se o cache de propostas é invalidado após criação bem-sucedida.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      })
    })
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['proposals'] }),
    )
  })
})

describe('useDeleteProposal', () => {
  it('deletes a proposal without error', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    expect(result.current.isSuccess).toBe(true)
  })

  it('invalidates proposals cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(2)
    })
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['proposals'] }),
    )
  })
})

describe('useApplyToProposal', () => {
  it('creates an application for an open proposal', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data?.status).toBe('pending')
  })

  it('invalidates applications cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(1)
    })
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['applications'] }),
    )
  })

  it('enters error state when proposal is closed (id=5)', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })
    await act(async () => {
      try {
        await result.current.mutateAsync(5)
      } catch {
        /* expected */
      }
    })
    expect(result.current.isError).toBe(true)
    expect((result.current.error as unknown as { status: number })?.status).toBe(422)
  })
})
