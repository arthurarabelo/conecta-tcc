import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import ProposalsPage from '../index'
import { mockProposalsList } from '@/test/server'
import type { Proposal } from '@/types/models'

// Mock reference data hooks so ProposalFilters renders without network
vi.mock('@/features/proposals/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/proposals/hooks')>()
  return {
    ...actual,
    useDepartments: () => ({ data: [{ id: 1, name: 'DCC', code: 'DCC' }] }),
    useKnowledgeAreas: () => ({ data: [{ id: 1, name: 'Inteligência Artificial', code: 'IA' }] }),
  }
})

// Mock SiteHeader — not the focus of these tests
vi.mock('@/components/shared/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}))

function buildProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 1, professor_id: 10, title: 'IA na saúde',
    description: 'Descrição detalhada da proposta de IA',
    prerequisites: null, max_slots: 3, department_id: 1, area_id: 1,
    status: 'open', applications_count: 0, approved_applications_count: 0,
    professor: { id: 10, name: 'Prof. Silva', email: 'silva@uni.br', role: 'professor', department_id: 1, profile_link: null },
    department: { id: 1, name: 'DCC', code: 'DCC' },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
    ...overrides,
  }
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const proposalsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/propostas',
    component: ProposalsPage,
    validateSearch: (search: Record<string, unknown>) => ({
      area_id: search.area_id ? Number(search.area_id) : undefined,
      department_id: search.department_id ? Number(search.department_id) : undefined,
      status: (search.status as 'open' | 'closed') ?? undefined,
      page: search.page ? Number(search.page) : undefined,
      search: (search.search as string) ?? '',
    }),
  })
  const routeTree = rootRoute.addChildren([proposalsRoute])
  const history = createMemoryHistory({ initialEntries: ['/propostas'] })
  const router = createRouter({ routeTree, history })
  return render(<QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>)
}

describe('ProposalsPage', () => {
  it('renders 6 skeleton cards while loading', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByTestId('proposal-card-skeleton')).toHaveLength(6))
  })

  it('renders proposal cards when data loads', async () => {
    mockProposalsList([buildProposal({ id: 1, title: 'IA na saúde' }), buildProposal({ id: 2, title: 'Redes neurais' })])
    renderPage()
    await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())
    expect(screen.getByText('Redes neurais')).toBeInTheDocument()
  })

  it('shows empty message when no proposals match', async () => {
    mockProposalsList([])
    renderPage()
    await waitFor(() => expect(screen.getByText('Nenhuma proposta encontrada.')).toBeInTheDocument())
  })

  it('hides cards that do not match the search text', async () => {
    mockProposalsList([
      buildProposal({ id: 1, title: 'IA na saúde' }),
      buildProposal({ id: 2, title: 'Compiladores avançados' }),
    ])
    renderPage()
    await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())
    await userEvent.type(screen.getByPlaceholderText('Buscar por título...'), 'Comp')
    expect(screen.queryByText('IA na saúde')).not.toBeInTheDocument()
    expect(screen.getByText('Compiladores avançados')).toBeInTheDocument()
  })

  it('disables Anterior on first page and enables Próximo', async () => {
    mockProposalsList(
      [buildProposal()],
      { current_page: 1, last_page: 3, per_page: 15, total: 45, from: 1, to: 15 },
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /próximo/i })).not.toBeDisabled()
  })

  it('disables Próximo on last page', async () => {
    mockProposalsList(
      [buildProposal()],
      { current_page: 3, last_page: 3, per_page: 15, total: 45, from: 31, to: 45 },
    )
    renderPage()
    await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /anterior/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /próximo/i })).toBeDisabled()
  })
})
