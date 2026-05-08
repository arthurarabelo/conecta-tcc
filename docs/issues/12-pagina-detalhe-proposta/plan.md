# Proposal Detail Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub `src/pages/proposal-detail/index.tsx` with a full detail view that shows proposal metadata, professor info, and an `ApplicationCard` whose state adapts to the visitor's authentication and application status.

**Architecture:** `ProposalDetailPage` fetches the proposal via `useProposal(id)` and the student's own applications via `useApplications()`. It renders a header section (badges + title + professor), a body section (description + prerequisites), and an `ApplicationCard` sidebar component. `ApplicationCard` is a pure display component: it receives `proposal`, `userApplication` (or null), `user` (or null), and `onApply` callback. The toast on successful application is triggered in the page layer via the `onSuccess` callback of `useApplyToProposal`.

**Tech Stack:** React 19, TanStack Router v1, TanStack Query v5, Shadcn/ui (Badge, Button, Card, Skeleton, Toast/Toaster, Progress), Zustand (`useAuthStore`), Lucide React, Vitest + React Testing Library + MSW v2.

---

### Task 1: ApplicationCard component

**Files:**
- Create: `frontend/src/features/proposals/components/ApplicationCard.tsx`
- Create: `frontend/src/features/proposals/components/ApplicationCard.test.tsx`

`ApplicationCard` handles all the conditional states for the candidature sidebar card. It is a pure component — no hooks — so it is easy to unit test.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/src/features/proposals/components/ApplicationCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationCard } from './ApplicationCard'
import type { Proposal, User, Application } from '@/types/models'

const openProposal: Proposal = {
  id: 1,
  professor_id: 10,
  title: 'IA na saúde',
  description: 'Desc',
  prerequisites: null,
  max_slots: 4,
  department_id: 1,
  area_id: 1,
  status: 'open',
  applications_count: 2,
  approved_applications_count: 1,
}

const closedProposal: Proposal = { ...openProposal, status: 'closed' }
const fullProposal: Proposal = { ...openProposal, approved_applications_count: 4 }

const student: User = {
  id: 5,
  name: 'Aluno Teste',
  email: 'aluno@uni.br',
  role: 'student',
  department_id: null,
  profile_link: null,
}

const professor: User = { ...student, id: 10, role: 'professor' }

const pendingApplication: Application = {
  id: 100,
  student_id: 5,
  proposal_id: 1,
  status: 'pending',
  feedback: null,
  applied_at: '2024-01-01T00:00:00Z',
  reviewed_at: null,
}

const approvedApplication: Application = { ...pendingApplication, status: 'approved' }
const rejectedApplication: Application = { ...pendingApplication, status: 'rejected' }

describe('ApplicationCard', () => {
  it('shows slot progress bar', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={null}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByText('1 de 4 vagas aprovadas')).toBeInTheDocument()
  })

  it('shows "Entrar para se candidatar" link for unauthenticated visitor', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={null}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByRole('link', { name: /entrar para se candidatar/i })).toBeInTheDocument()
  })

  it('shows "Candidatar-se" button for authenticated student with no application', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={student}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByRole('button', { name: /candidatar-se/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /candidatar-se/i })).not.toBeDisabled()
  })

  it('calls onApply when "Candidatar-se" is clicked', async () => {
    const onApply = vi.fn()
    render(
      <ApplicationCard
        proposal={openProposal}
        user={student}
        userApplication={null}
        onApply={onApply}
        isApplying={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /candidatar-se/i }))
    expect(onApply).toHaveBeenCalledOnce()
  })

  it('shows "Em análise" badge for student with pending application', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={student}
        userApplication={pendingApplication}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByText('Em análise')).toBeInTheDocument()
  })

  it('shows "Aprovado" badge and link for student with approved application', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={student}
        userApplication={approvedApplication}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /minhas candidaturas/i })).toBeInTheDocument()
  })

  it('shows "Rejeitado" badge for student with rejected application', () => {
    render(
      <ApplicationCard
        proposal={openProposal}
        user={student}
        userApplication={rejectedApplication}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByText('Rejeitado')).toBeInTheDocument()
  })

  it('shows disabled "Proposta encerrada" button when proposal is closed', () => {
    render(
      <ApplicationCard
        proposal={closedProposal}
        user={student}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    const btn = screen.getByRole('button', { name: /proposta encerrada/i })
    expect(btn).toBeDisabled()
  })

  it('shows disabled "Sem vagas disponíveis" when all slots are taken', () => {
    render(
      <ApplicationCard
        proposal={fullProposal}
        user={student}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    const btn = screen.getByRole('button', { name: /sem vagas disponíveis/i })
    expect(btn).toBeDisabled()
  })

  it('renders nothing for professor users', () => {
    const { container } = render(
      <ApplicationCard
        proposal={openProposal}
        user={professor}
        userApplication={null}
        onApply={vi.fn()}
        isApplying={false}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && bun test src/features/proposals/components/ApplicationCard.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ApplicationCard.tsx`**

```tsx
// frontend/src/features/proposals/components/ApplicationCard.tsx
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import type { Application, Proposal, User } from '@/types/models'

interface ApplicationCardProps {
  proposal: Proposal
  user: User | null
  userApplication: Application | null
  onApply: () => void
  isApplying: boolean
}

export function ApplicationCard({
  proposal,
  user,
  userApplication,
  onApply,
  isApplying,
}: ApplicationCardProps) {
  if (user?.role === 'professor') return null

  const approved = proposal.approved_applications_count ?? 0
  const max = proposal.max_slots
  const progressPct = max > 0 ? Math.round((approved / max) * 100) : 0
  const isClosed = proposal.status === 'closed'
  const isFull = approved >= max

  function renderAction() {
    if (!user) {
      return (
        <Link to={ROUTES.login} className="w-full">
          <Button className="w-full" variant="outline">
            Entrar para se candidatar
          </Button>
        </Link>
      )
    }

    if (isClosed) {
      return (
        <Button className="w-full" disabled>
          Proposta encerrada
        </Button>
      )
    }

    if (isFull && !userApplication) {
      return (
        <Button className="w-full" disabled>
          Sem vagas disponíveis
        </Button>
      )
    }

    if (userApplication?.status === 'pending') {
      return (
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          Em análise
        </Badge>
      )
    }

    if (userApplication?.status === 'approved') {
      return (
        <div className="flex flex-col items-center gap-2">
          <Badge variant="default" className="bg-green-600 text-sm px-4 py-1.5">
            Aprovado
          </Badge>
          <Link to={ROUTES.myApplications} className="text-sm underline text-primary">
            Minhas candidaturas
          </Link>
        </div>
      )
    }

    if (userApplication?.status === 'rejected') {
      return (
        <Badge variant="destructive" className="text-sm px-4 py-1.5">
          Rejeitado
        </Badge>
      )
    }

    // Student, no application, proposal open and has slots
    return (
      <Button className="w-full" onClick={onApply} disabled={isApplying}>
        {isApplying ? 'Enviando...' : 'Candidatar-se'}
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Candidatura</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 items-center">
        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-1">
            {approved} de {max} vagas aprovadas
          </p>
          <Progress value={progressPct} className="h-2" />
        </div>
        {renderAction()}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run to verify pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && bun test src/features/proposals/components/ApplicationCard.test.tsx
```

Expected: PASS — 10 tests.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && git add src/features/proposals/components/ApplicationCard.tsx src/features/proposals/components/ApplicationCard.test.tsx && git commit -m "feat: add ApplicationCard with all authentication/status states"
```

---

### Task 2: ProposalDetailPage

**Files:**
- Modify: `frontend/src/pages/proposal-detail/index.tsx`
- Create: `frontend/src/pages/proposal-detail/ProposalDetailPage.test.tsx`

The page reads the `$id` param from the route, parses it as a number, fetches the proposal and all applications, finds the current user's application for this proposal, and renders two layouts: full skeleton while loading, or the detail view. A 404 error renders a friendly message.

- [ ] **Step 1: Extend server.ts with helpers for proposal detail and applications**

Add to `frontend/src/test/server.ts` (append after the existing exports):

```typescript
export function mockProposalDetail(proposal: Proposal) {
  server.use(
    http.get(`http://localhost:8000/proposals/${proposal.id}`, () =>
      HttpResponse.json({ data: proposal }),
    ),
  )
}

export function mockApplicationsList(applications: import('@/types/models').Application[]) {
  server.use(
    http.get('http://localhost:8000/applications', () =>
      HttpResponse.json({
        data: applications,
        meta: { current_page: 1, last_page: 1, per_page: 15, total: applications.length, from: applications.length ? 1 : null, to: applications.length ? applications.length : null },
        links: { first: null, last: null, prev: null, next: null },
      }),
    ),
  )
}

export function mockApplyToProposal(proposalId: number, result: import('@/types/models').Application) {
  server.use(
    http.post(`http://localhost:8000/proposals/${proposalId}/apply`, () =>
      HttpResponse.json({ data: result }, { status: 201 }),
    ),
  )
}

export function mockProposalNotFound(id: number) {
  server.use(
    http.get(`http://localhost:8000/proposals/${id}`, () =>
      HttpResponse.json({ message: 'Recurso não encontrado' }, { status: 404 }),
    ),
  )
}
```

- [ ] **Step 2: Write the failing tests**

```tsx
// frontend/src/pages/proposal-detail/ProposalDetailPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import ProposalDetailPage from './index'
import {
  mockProposalDetail,
  mockApplicationsList,
  mockApplyToProposal,
  mockProposalNotFound,
} from '@/test/server'
import type { Proposal, User, Application } from '@/types/models'

// Mock useAuthStore so tests can control auth state
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/store/auth.store'

const mockUseAuthStore = vi.mocked(useAuthStore)

const proposal: Proposal = {
  id: 42,
  professor_id: 10,
  title: 'Aprendizado de Máquina',
  description: 'Descrição completa do projeto de aprendizado de máquina.',
  prerequisites: 'Cálculo, Álgebra Linear',
  max_slots: 3,
  department_id: 1,
  area_id: 1,
  status: 'open',
  applications_count: 1,
  approved_applications_count: 1,
  professor: {
    id: 10,
    name: 'Prof. Costa',
    email: 'costa@uni.br',
    role: 'professor',
    department_id: 1,
    profile_link: 'http://lattes.cnpq.br/12345',
  },
  department: { id: 1, name: 'DCC', code: 'DCC' },
  area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
}

const student: User = {
  id: 5,
  name: 'Aluno Teste',
  email: 'aluno@uni.br',
  role: 'student',
  department_id: null,
  profile_link: null,
}

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

  return render(
    <QueryClientProvider client={qc}>
      <router.Provider />
    </QueryClientProvider>,
  )
}

describe('ProposalDetailPage', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)
  })

  it('renders proposal title and professor name after loading', async () => {
    mockProposalDetail(proposal)
    mockApplicationsList([])
    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByText('Prof. Costa')).toBeInTheDocument()
  })

  it('shows skeleton while loading', () => {
    renderPage()
    expect(screen.getAllByTestId('detail-skeleton').length).toBeGreaterThan(0)
  })

  it('shows 404 message when proposal is not found', async () => {
    mockProposalNotFound(42)
    mockApplicationsList([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/proposta não encontrada/i)).toBeInTheDocument(),
    )
  })

  it('shows "Candidatar-se" button for authenticated student with no application', async () => {
    mockProposalDetail(proposal)
    mockApplicationsList([])
    mockUseAuthStore.mockReturnValue({
      user: student,
      token: 'tok',
      isAuthenticated: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)

    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /candidatar-se/i })).toBeInTheDocument()
  })

  it('shows "Em análise" badge when student already applied', async () => {
    const existingApp: Application = {
      id: 200,
      student_id: 5,
      proposal_id: 42,
      status: 'pending',
      feedback: null,
      applied_at: '2024-01-01T00:00:00Z',
      reviewed_at: null,
    }
    mockProposalDetail(proposal)
    mockApplicationsList([existingApp])
    mockUseAuthStore.mockReturnValue({
      user: student,
      token: 'tok',
      isAuthenticated: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)

    renderPage()
    await waitFor(() => expect(screen.getByText('Em análise')).toBeInTheDocument())
  })

  it('shows disabled "Proposta encerrada" button for closed proposals', async () => {
    mockProposalDetail({ ...proposal, status: 'closed' })
    mockApplicationsList([])
    mockUseAuthStore.mockReturnValue({
      user: student,
      token: 'tok',
      isAuthenticated: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as ReturnType<typeof useAuthStore>)

    renderPage()
    await waitFor(() => expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /proposta encerrada/i })).toBeDisabled()
  })
})
```

- [ ] **Step 3: Run to verify failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && bun test src/pages/proposal-detail/ProposalDetailPage.test.tsx
```

Expected: FAIL — stub renders only `<h1>Proposta #42</h1>`, multiple assertions fail.

- [ ] **Step 4: Add Toaster to `main.tsx`**

Shadcn's toast requires `<Toaster />` in the component tree. Open `frontend/src/main.tsx` and add the import + component:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { router } from './router'
import { queryClient } from './lib/query-client'
import './styles.css'  // imports styles/colors.css, styles/typography.css, styles/theme.css

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 5: Implement `src/pages/proposal-detail/index.tsx`**

```tsx
// frontend/src/pages/proposal-detail/index.tsx
import { useParams, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { useProposal } from '@/features/proposals/hooks'
import { useApplications } from '@/features/applications/hooks'
import { useApplyToProposal } from '@/features/proposals/hooks'
import { ApplicationCard } from '@/features/proposals/components/ApplicationCard'
import { useAuthStore } from '@/store/auth.store'
import { NotFoundError } from '@/lib/error'
import { ROUTES } from '@/constants/routes'

export default function ProposalDetailPage() {
  const { id } = useParams({ from: '/propostas/$id' })
  const proposalId = Number(id)
  const { toast } = useToast()
  const { user } = useAuthStore()

  const { data: proposal, isLoading: loadingProposal, error } = useProposal(proposalId)
  const { data: applicationsData, isLoading: loadingApplications } = useApplications()

  const userApplication = useMemo(() => {
    if (!user || user.role !== 'student') return null
    return applicationsData?.data.find((a) => a.proposal_id === proposalId) ?? null
  }, [applicationsData, user, proposalId])

  const applyMutation = useApplyToProposal()

  function handleApply() {
    applyMutation.mutate(proposalId, {
      onSuccess() {
        toast({ title: 'Candidatura enviada!', description: 'Sua candidatura está em análise.' })
      },
      onError() {
        toast({ title: 'Erro', description: 'Não foi possível enviar sua candidatura.', variant: 'destructive' })
      },
    })
  }

  const isLoading = loadingProposal || loadingApplications

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} data-testid="detail-skeleton" className="h-6 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton data-testid="detail-skeleton" className="h-10 w-3/4 mb-4" />
          <Skeleton data-testid="detail-skeleton" className="h-5 w-1/3 mb-8" />
          <Skeleton data-testid="detail-skeleton" className="h-40 w-full mb-4" />
          <Skeleton data-testid="detail-skeleton" className="h-20 w-full" />
        </main>
      </>
    )
  }

  if (error instanceof NotFoundError || !proposal) {
    return (
      <>
        <SiteHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Proposta não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            Esta proposta não existe ou foi removida.
          </p>
          <Link to={ROUTES.proposals.list}>
            <Button variant="outline">Ver mural de propostas</Button>
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {proposal.area && <Badge variant="secondary">{proposal.area.name}</Badge>}
              {proposal.department && <Badge variant="outline">{proposal.department.code}</Badge>}
              <Badge variant={proposal.status === 'open' ? 'default' : 'secondary'}>
                {proposal.status === 'open' ? 'Aberta' : 'Fechada'}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-4">{proposal.title}</h1>

            {proposal.professor && (
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                  {proposal.professor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{proposal.professor.name}</p>
                  {proposal.department && (
                    <p className="text-sm text-muted-foreground">{proposal.department.name}</p>
                  )}
                </div>
              </div>
            )}

            {proposal.professor?.profile_link && (
              <a
                href={proposal.professor.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary underline mb-6"
              >
                Lattes <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <Separator className="my-6" />

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Sobre o projeto</h2>
              <p className="text-muted-foreground whitespace-pre-line">{proposal.description}</p>
            </section>

            {proposal.prerequisites && (
              <section>
                <h2 className="text-xl font-semibold mb-2">Pré-requisitos</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {proposal.prerequisites.split('\n').map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ApplicationCard
              proposal={proposal}
              user={user}
              userApplication={userApplication}
              onApply={handleApply}
              isApplying={applyMutation.isPending}
            />
          </div>
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 6: Run to verify pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && bun test src/pages/proposal-detail/ProposalDetailPage.test.tsx
```

Expected: PASS — 6 tests.

- [ ] **Step 7: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend && git add src/pages/proposal-detail/index.tsx src/pages/proposal-detail/ProposalDetailPage.test.tsx src/test/server.ts src/main.tsx && git commit -m "feat: implement ProposalDetailPage with ApplicationCard and toast feedback"
```
