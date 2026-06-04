import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import ProposalDetailPage from '../index'
import { mockProposalDetail, mockApplicationsList, mockProposalNotFound } from '@/test/server'
import type { Proposal, User, Application } from '@/types/models'

vi.mock('@/store/auth.store', () => ({ useAuthStore: vi.fn() }))
import { useAuthStore } from '@/store/auth.store'
const mockUseAuthStore = vi.mocked(useAuthStore)

const proposal: Proposal = {
  id: 42, professor_id: 10, title: 'Aprendizado de Máquina',
  description: 'Descrição completa do projeto de aprendizado de máquina.',
  prerequisites: 'Cálculo, Álgebra Linear', max_slots: 3,
  department_id: 1, area_id: 1, status: 'open',
  applications_count: 1, approved_applications_count: 1,
  professor: { id: 10, name: 'Prof. Costa', email: 'costa@uni.br', role: 'professor', department_id: 1, profile_link: 'http://lattes.cnpq.br/12345' },
  department: { id: 1, name: 'DCC', code: 'DCC' },
  area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
}

const student: User = { id: 5, name: 'Aluno Teste', email: 'aluno@uni.br', role: 'student', department_id: null, profile_link: null }

function renderPage(proposalId = 42) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/propostas/$id',
    component: ProposalDetailPage,
  })
  const routeTree = rootRoute.addChildren([detailRoute])
  const history = createMemoryHistory({ initialEntries: [`/propostas/${proposalId}`] })
  const router = createRouter({ routeTree, history })
  return render(<QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>)
}

describe('ProposalDetailPage', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({ user: null, token: null, isAuthenticated: false, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
  })

  it('renders proposal title and professor name after loading', async () => {
    mockProposalDetail(proposal)
    mockApplicationsList([])
    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByText('Prof. Costa')).toBeInTheDocument()
  })

  it('shows skeletons while loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByTestId('detail-skeleton').length).toBeGreaterThan(0))
  })

  it('shows 404 message when proposal is not found', async () => {
    mockProposalNotFound(42)
    mockApplicationsList([])
    renderPage()
    await waitFor(() => expect(screen.getByText(/proposta não encontrada/i)).toBeInTheDocument())
  })

  it('shows "Candidatar-se" button for authenticated student with no application', async () => {
    mockProposalDetail(proposal)
    mockApplicationsList([])
    mockUseAuthStore.mockReturnValue({ user: student, token: 'tok', isAuthenticated: true, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /candidatar-se/i })).toBeInTheDocument()
  })

  it('shows "Em análise" badge when student already applied', async () => {
    const existingApp: Application = { id: 200, student_id: 5, proposal_id: 42, status: 'pending', feedback: null, applied_at: '2024-01-01T00:00:00Z', reviewed_at: null }
    mockProposalDetail(proposal)
    mockApplicationsList([existingApp])
    mockUseAuthStore.mockReturnValue({ user: student, token: 'tok', isAuthenticated: true, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
    renderPage()
    await waitFor(() => expect(screen.getByText('Em análise')).toBeInTheDocument())
  })

  it('shows disabled "Proposta encerrada" button for closed proposals', async () => {
    mockProposalDetail({ ...proposal, status: 'closed' })
    mockApplicationsList([])
    mockUseAuthStore.mockReturnValue({ user: student, token: 'tok', isAuthenticated: true, setAuth: vi.fn(), clearAuth: vi.fn() } as ReturnType<typeof useAuthStore>)
    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /proposta encerrada/i })).toBeDisabled()
  })
})
