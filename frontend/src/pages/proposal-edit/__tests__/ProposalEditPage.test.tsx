import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import ProposalEditPage from '../index'
import type { Proposal, User } from '@/types/models'

vi.mock('@/store/auth.store', () => ({ useAuthStore: vi.fn() }))
vi.mock('@/features/proposals/hooks', () => ({
  useProposal: vi.fn(),
  useUpdateProposal: vi.fn(),
  useDeleteProposal: vi.fn(),
  useCreateProposal: vi.fn(),
  useDepartments: () => ({ data: [{ id: 1, name: 'DCC', code: 'DCC' }] }),
  useKnowledgeAreas: () => ({ data: [{ id: 1, name: 'Inteligência Artificial' }] }),
}))
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true, user: { id: 10, role: 'professor' } })),
}))

import { useAuthStore } from '@/store/auth.store'
import { useProposal, useUpdateProposal, useDeleteProposal, useCreateProposal } from '@/features/proposals/hooks'

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockUseProposal = vi.mocked(useProposal)
const mockUseUpdateProposal = vi.mocked(useUpdateProposal)
const mockUseDeleteProposal = vi.mocked(useDeleteProposal)
const mockUseCreateProposal = vi.mocked(useCreateProposal)

const ownerProf: User = { id: 10, name: 'Prof. Costa', email: 'costa@uni.br', role: 'professor', department_id: 1, profile_link: null }
const otherProf: User = { ...ownerProf, id: 99, name: 'Prof. Outro' }
const proposal: Proposal = {
  id: 7, professor_id: 10, title: 'IA Aplicada à Medicina',
  description: 'Descrição completa com ao menos vinte caracteres aqui.',
  prerequisites: 'Python', max_slots: 2, department_id: 1, area_id: 1, status: 'open',
}

function makeMutation() {
  return { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, isError: false, error: null, isSuccess: false, data: undefined, reset: vi.fn() } as unknown as ReturnType<typeof useUpdateProposal>
}

function renderEditPage() {
  mockUseUpdateProposal.mockReturnValue(makeMutation())
  mockUseDeleteProposal.mockReturnValue(makeMutation() as unknown as ReturnType<typeof useDeleteProposal>)
  mockUseCreateProposal.mockReturnValue(makeMutation() as unknown as ReturnType<typeof useCreateProposal>)

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const editRoute = createRoute({ getParentRoute: () => rootRoute, path: '/propostas/$id/editar', component: ProposalEditPage })
  const dashRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: () => <div>Dashboard</div> })
  const routeTree = rootRoute.addChildren([editRoute, dashRoute])
  const history = createMemoryHistory({ initialEntries: ['/propostas/7/editar'] })
  const router = createRouter({ routeTree, history })
  return render(<QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>)
}

describe('ProposalEditPage', () => {
  describe('when proposal belongs to logged professor', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: ownerProf, token: 'tok', isAuthenticated: true, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
      mockUseProposal.mockReturnValue({ data: proposal, isLoading: false, error: null } as unknown as ReturnType<typeof useProposal>)
    })

    it('renders the form pre-populated with proposal data', async () => {
      renderEditPage()
      await waitFor(() => expect(screen.getByDisplayValue('IA Aplicada à Medicina')).toBeInTheDocument())
      expect(screen.getByDisplayValue('Descrição completa com ao menos vinte caracteres aqui.')).toBeInTheDocument()
    })

    it('shows "Salvar alterações" submit button', async () => {
      renderEditPage()
      await waitFor(() => expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument())
    })

    it('shows "Excluir proposta" delete button', async () => {
      renderEditPage()
      await waitFor(() => expect(screen.getByRole('button', { name: /excluir proposta/i })).toBeInTheDocument())
    })
  })

  describe('when proposal belongs to a different professor', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: otherProf, token: 'tok', isAuthenticated: true, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
      mockUseProposal.mockReturnValue({ data: proposal, isLoading: false, error: null } as unknown as ReturnType<typeof useProposal>)
    })

    it('redirects to /dashboard without rendering the form', async () => {
      renderEditPage()
      await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
      expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument()
    })
  })
})
