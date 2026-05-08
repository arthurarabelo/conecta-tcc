# My Applications Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub `MyApplicationsPage` with a fully functional student-only page that lists applications with status counts, feedback, and links to proposals.

**Architecture:** Two components — `ApplicationCard` renders a single application card and lives inside the `features/applications/components/` directory; `MyApplicationsPage` owns the data-fetch, status counting, and layout. The page is wrapped in `ProtectedRoute role="student"` and uses `useApplications()` from the existing hook. No new API calls or services needed.

**Tech Stack:** React 19, TanStack Query v5, TanStack Router v1, Shadcn/ui (Card, Badge, Skeleton, Button), Vitest + RTL + MSW v2, `formatDateLong` from `@/lib/utils`, `StatusBadge` from `@/components/shared/StatusBadge`, `ProtectedRoute` from `@/components/shared/ProtectedRoute`.

---

### Task 1: Shared component stubs — ProtectedRoute and StatusBadge

> This task creates the shared components that the page depends on. If `#07` and `#08` are already complete and these files exist, skip this task and proceed to Task 2.

**Files:**
- Create: `frontend/src/components/shared/StatusBadge/index.tsx`
- Create: `frontend/src/components/shared/ProtectedRoute/index.tsx`

- [ ] **Step 1: Create StatusBadge**

Create `frontend/src/components/shared/StatusBadge/index.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/types/models'

interface StatusBadgeProps {
  status: ApplicationStatus
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Em análise', variant: 'secondary' },
  approved: { label: 'Aprovada', variant: 'default' },
  rejected: { label: 'Rejeitada', variant: 'destructive' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 2: Create ProtectedRoute**

Create `frontend/src/components/shared/ProtectedRoute/index.tsx`:

```tsx
import { useNavigate } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types/models'

interface ProtectedRouteProps {
  children: ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/entrar' })
      return
    }
    if (role && user?.role !== role) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, user, role, navigate])

  if (!isAuthenticated) return null
  if (role && user?.role !== role) return null

  return <>{children}</>
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/components/shared/StatusBadge/index.tsx src/components/shared/ProtectedRoute/index.tsx
git commit -m "feat: add StatusBadge and ProtectedRoute shared components"
```

---

### Task 2: ApplicationCard component

**Files:**
- Create: `frontend/src/features/applications/components/ApplicationCard.tsx`
- Create: `frontend/src/features/applications/components/ApplicationCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/applications/components/ApplicationCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApplicationCard } from './ApplicationCard'
import type { Application } from '@/types/models'

// TanStack Router's Link requires a router context. Provide a minimal stub.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const baseApplication: Application = {
  id: 100,
  student_id: 2,
  proposal_id: 10,
  status: 'pending',
  feedback: null,
  applied_at: '2025-05-10T09:00:00Z',
  reviewed_at: null,
  student: {
    id: 2,
    name: 'João Silva',
    email: 'joao@student.edu',
    role: 'student',
    department_id: null,
    profile_link: null,
  },
  proposal: {
    id: 10,
    professor_id: 1,
    title: 'ML em Biomedicina',
    description: 'Desc',
    prerequisites: null,
    max_slots: 4,
    department_id: 1,
    area_id: 1,
    status: 'open',
    professor: {
      id: 1,
      name: 'Prof. Ana Lima',
      email: 'ana@uni.edu',
      role: 'professor',
      department_id: 1,
      profile_link: null,
    },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
  },
}

describe('ApplicationCard', () => {
  it('renders proposal title', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument()
  })

  it('renders professor name', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Prof. Ana Lima')).toBeInTheDocument()
  })

  it('renders area badge', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('renders applied_at date formatted in long pt-BR format', () => {
    render(<ApplicationCard application={baseApplication} />)
    // formatDateLong('2025-05-10T09:00:00Z') → "10 de maio de 2025"
    expect(screen.getByText(/10 de maio de 2025/i)).toBeInTheDocument()
  })

  it('renders "Em análise" status badge for pending', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Em análise')).toBeInTheDocument()
  })

  it('renders "Aprovada" status badge for approved', () => {
    render(<ApplicationCard application={{ ...baseApplication, status: 'approved' }} />)
    expect(screen.getByText('Aprovada')).toBeInTheDocument()
  })

  it('does NOT show feedback section when status is pending', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.queryByText(/Feedback:/i)).not.toBeInTheDocument()
  })

  it('does NOT show feedback section when status is approved', () => {
    render(<ApplicationCard application={{ ...baseApplication, status: 'approved' }} />)
    expect(screen.queryByText(/Feedback:/i)).not.toBeInTheDocument()
  })

  it('shows feedback section with text when status is rejected', () => {
    const app: Application = {
      ...baseApplication,
      status: 'rejected',
      feedback: 'Perfil não compatível',
      reviewed_at: '2025-05-11T10:00:00Z',
    }
    render(<ApplicationCard application={app} />)
    expect(screen.getByText(/Feedback:/i)).toBeInTheDocument()
    expect(screen.getByText(/Perfil não compatível/i)).toBeInTheDocument()
  })

  it('renders "Ver proposta" link pointing to /propostas/10', () => {
    render(<ApplicationCard application={baseApplication} />)
    const link = screen.getByRole('link', { name: /Ver proposta/i })
    expect(link).toHaveAttribute('href', '/propostas/10')
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/ApplicationCard.test.tsx
```

Expected: FAIL — `ApplicationCard` module not found.

- [ ] **Step 3: Implement ApplicationCard**

Create `frontend/src/features/applications/components/ApplicationCard.tsx`:

```tsx
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateLong } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { Application } from '@/types/models'

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { proposal, status, feedback, applied_at } = application
  const areaName = proposal?.area?.name
  const professorName = proposal?.professor?.name
  const proposalTitle = proposal?.title ?? `Proposta #${application.proposal_id}`

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {areaName && <Badge variant="outline">{areaName}</Badge>}
          </div>
          <StatusBadge status={status} />
        </div>

        <h3 className="mt-3 text-lg font-semibold">{proposalTitle}</h3>

        {professorName && (
          <p className="text-muted-foreground text-sm">Prof. {professorName}</p>
        )}

        <p className="text-muted-foreground mt-1 text-sm">
          Candidatado em {formatDateLong(applied_at)}
        </p>

        {status === 'rejected' && feedback && (
          <div className="bg-muted mt-3 rounded-md p-3 text-sm">
            <span className="font-medium">Feedback:</span> {feedback}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.proposals.detail(application.proposal_id)}>
              Ver proposta →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/ApplicationCard.test.tsx
```

Expected: PASS — all 11 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/features/applications/components/ApplicationCard.tsx src/features/applications/components/ApplicationCard.test.tsx
git commit -m "feat: add ApplicationCard component with area badge, status, feedback, and proposal link"
```

---

### Task 3: MyApplicationsPage

**Files:**
- Modify: `frontend/src/pages/my-applications/index.tsx`
- Create: `frontend/src/pages/my-applications/index.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/pages/my-applications/index.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import MyApplicationsPage from './index'
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
    http.get('http://localhost:8000/applications', () => HttpResponse.json(response)),
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
    await waitFor(() => expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument())
    expect(screen.getByText('Visão Computacional')).toBeInTheDocument()
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/pages/my-applications/index.test.tsx
```

Expected: FAIL — the page renders only `<h1>Minhas Candidaturas</h1>` and has no skeletons, cards, or counts.

- [ ] **Step 3: Implement MyApplicationsPage**

Replace `frontend/src/pages/my-applications/index.tsx` entirely with:

```tsx
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ApplicationCard } from '@/features/applications/components/ApplicationCard'
import { useApplications } from '@/features/applications/hooks'
import { ROUTES } from '@/constants/routes'

function ApplicationSkeleton() {
  return (
    <Card data-testid="application-skeleton">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mt-3 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-1 h-4 w-1/3" />
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyApplicationsPage() {
  const { data, isLoading } = useApplications()

  const applications = useMemo(() => {
    if (!data?.data) return []
    return [...data.data].sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime(),
    )
  }, [data])

  const counts = useMemo(
    () => ({
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    }),
    [applications],
  )

  return (
    <ProtectedRoute role="student">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold">Minhas Candidaturas</h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Em análise {counts.pending}
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Aprovadas {counts.approved}
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium">
            Rejeitadas {counts.rejected}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {isLoading && (
            <>
              <ApplicationSkeleton />
              <ApplicationSkeleton />
              <ApplicationSkeleton />
            </>
          )}

          {!isLoading && applications.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              <p>Você ainda não se candidatou a nenhuma proposta.</p>
              <Link
                to={ROUTES.proposals.list}
                className="text-primary mt-2 inline-block underline"
              >
                Explorar mural →
              </Link>
            </div>
          )}

          {!isLoading &&
            applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/pages/my-applications/index.test.tsx
```

Expected: PASS — all 8 tests green.

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/pages/my-applications/index.tsx src/pages/my-applications/index.test.tsx
git commit -m "feat: implement MyApplicationsPage with status counts, skeletons, and empty state"
```
