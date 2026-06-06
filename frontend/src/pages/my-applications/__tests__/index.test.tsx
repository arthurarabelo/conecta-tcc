import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import MyApplicationsPage from '@/pages/my-applications/index'
import { server } from '@/test/server'
import type { Application } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'

// Stub router Link and useNavigate so we don't need a full router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

// Stub useAuth so ProtectedRoute passes for student role
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 2, name: 'João', email: 'joao@student.edu', role: 'student', department_id: null, profile_link: null },
    isProfessor: false,
    isStudent: true,
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  }),
}))

function makeApp(node: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{node}</QueryClientProvider>)
}

const pendingApp: Application = {
  id: 100, student_id: 2, proposal_id: 10, status: 'pending', feedback: null,
  applied_at: '2025-05-10T09:00:00Z', reviewed_at: null,
  proposal: {
    id: 10, professor_id: 1, title: 'ML em Biomedicina', description: 'D',
    prerequisites: null, max_slots: 4, department_id: 1, area_id: 1, status: 'open',
    professor: { id: 1, name: 'Ana Lima', email: 'ana@uni.edu', role: 'professor', department_id: 1, profile_link: null },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
  },
}

const approvedApp: Application = {
  id: 101, student_id: 2, proposal_id: 11, status: 'approved', feedback: null,
  applied_at: '2025-04-01T10:00:00Z', reviewed_at: '2025-04-10T12:00:00Z',
  proposal: {
    id: 11, professor_id: 1, title: 'Visão Computacional', description: 'D',
    prerequisites: null, max_slots: 2, department_id: 1, area_id: 2, status: 'open',
    professor: { id: 1, name: 'Ana Lima', email: 'ana@uni.edu', role: 'professor', department_id: 1, profile_link: null },
    area: { id: 2, name: 'Visão Computacional', code: 'VC' },
  },
}

const rejectedApp: Application = {
  id: 102, student_id: 2, proposal_id: 12, status: 'rejected',
  feedback: 'Perfil não compatível',
  applied_at: '2025-03-15T08:00:00Z', reviewed_at: '2025-03-20T14:00:00Z',
  proposal: {
    id: 12, professor_id: 1, title: 'NLP Avançado', description: 'D',
    prerequisites: null, max_slots: 3, department_id: 1, area_id: 3, status: 'open',
    professor: { id: 1, name: 'Ana Lima', email: 'ana@uni.edu', role: 'professor', department_id: 1, profile_link: null },
    area: { id: 3, name: 'Processamento de Linguagem Natural', code: 'PLN' },
  },
}

function mockApplicationsList(apps: Application[]) {
  const response: PaginatedResponse<Application> = {
    data: apps,
    meta: { current_page: 1, last_page: 1, per_page: 15, total: apps.length, from: 1, to: apps.length },
    links: { first: null, last: null, prev: null, next: null },
  }
  server.use(
    http.get('http://localhost:8000/api/applications', () => HttpResponse.json(response)),
  )
}

describe('MyApplicationsPage', () => {
  it('renders 3 skeleton cards while loading', () => {
    mockApplicationsList([pendingApp])
    makeApp(<MyApplicationsPage />)
    // Skeletons render before data arrives
    const skeletons = document.querySelectorAll('[data-testid="application-skeleton"]')
    expect(skeletons.length).toBe(3)
  })

  it('renders application cards after loading', async () => {
    mockApplicationsList([pendingApp, approvedApp])
    makeApp(<MyApplicationsPage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 3, name: 'ML em Biomedicina' })).toBeInTheDocument(),
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Visão Computacional' })).toBeInTheDocument()
  })

  it('shows rejection feedback for rejected applications', async () => {
    mockApplicationsList([rejectedApp])
    makeApp(<MyApplicationsPage />)
    await waitFor(() => expect(screen.getByText(/Perfil não compatível/i)).toBeInTheDocument())
  })

  it('does not show feedback for pending applications', async () => {
    mockApplicationsList([pendingApp])
    makeApp(<MyApplicationsPage />)
    await waitFor(() => expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument())
    expect(screen.queryByText(/Perfil não compatível/i)).not.toBeInTheDocument()
  })

  it('shows correct status counts', async () => {
    mockApplicationsList([pendingApp, approvedApp, rejectedApp])
    makeApp(<MyApplicationsPage />)
    await waitFor(() => expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument())
    expect(screen.getByText(/Em análise.*1/i)).toBeInTheDocument()
    expect(screen.getByText(/Aprovadas.*1/i)).toBeInTheDocument()
    expect(screen.getByText(/Rejeitadas.*1/i)).toBeInTheDocument()
  })

  it('shows empty state when there are no applications', async () => {
    mockApplicationsList([])
    makeApp(<MyApplicationsPage />)
    await waitFor(() =>
      expect(
        screen.getByText(/Você ainda não se candidatou a nenhuma proposta/i),
      ).toBeInTheDocument(),
    )
  })

  it('shows "Explorar mural" link in empty state', async () => {
    mockApplicationsList([])
    makeApp(<MyApplicationsPage />)
    await waitFor(() => expect(screen.getByRole('link', { name: /Explorar mural/i })).toBeInTheDocument())
  })

  it('renders cards sorted by applied_at descending (most recent first)', async () => {
    // pendingApp: 2025-05-10, approvedApp: 2025-04-01, rejectedApp: 2025-03-15
    mockApplicationsList([approvedApp, rejectedApp, pendingApp])
    makeApp(<MyApplicationsPage />)
    await waitFor(() => expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument())

    const titles = screen.getAllByRole('heading', { level: 3 })
    expect(titles[0]).toHaveTextContent('ML em Biomedicina')    // 2025-05-10
    expect(titles[1]).toHaveTextContent('Visão Computacional')  // 2025-04-01
    expect(titles[2]).toHaveTextContent('NLP Avançado')         // 2025-03-15
  })
})
