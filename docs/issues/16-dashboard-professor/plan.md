# Professor Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub `DashboardPage` with a professor-only dashboard showing KPI cards, a proposals table with edit/delete actions, and a pending-applications review section with approve/reject dialogs.

**Architecture:** Three focused sub-components live in `src/features/proposals/components/` and `src/features/applications/components/` — `ProposalRow`, `KpiCard`, and `PendingApplicationCard`. The page (`src/pages/dashboard/index.tsx`) orchestrates data from `useProposals()` and `useApplications({ status: 'pending' })`, computes KPIs with `useMemo`, and delegates mutations to `useApproveApplication()` and `useRejectApplication()`. Cache invalidation happens inside the hooks (already implemented in issue #14) so the KPIs update automatically after each action.

**Tech Stack:** React 19, TanStack Query v5, TanStack Router v1, Shadcn/ui (Card, Table, Dialog, Textarea, Button, Badge, Avatar, Skeleton, Sonner toast), Vitest + RTL + MSW v2, `useAuth` hook, `ProtectedRoute`.

---

### Task 1: KpiCard component

**Files:**
- Create: `frontend/src/features/proposals/components/KpiCard.tsx`
- Create: `frontend/src/features/proposals/components/KpiCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/proposals/components/KpiCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  it('renders the label', () => {
    render(<KpiCard label="Propostas ativas" value={3} />)
    expect(screen.getByText('Propostas ativas')).toBeInTheDocument()
  })

  it('renders the numeric value', () => {
    render(<KpiCard label="Vagas totais" value={12} />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders 0 without crashing', () => {
    render(<KpiCard label="Candidatos pendentes" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/proposals/components/KpiCard.test.tsx
```

Expected: FAIL — `KpiCard` module not found.

- [ ] **Step 3: Implement KpiCard**

Create `frontend/src/features/proposals/components/KpiCard.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KpiCardProps {
  label: string
  value: number
}

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/proposals/components/KpiCard.test.tsx
```

Expected: PASS — 3 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/features/proposals/components/KpiCard.tsx src/features/proposals/components/KpiCard.test.tsx
git commit -m "feat: add KpiCard component for dashboard metrics"
```

---

### Task 2: RejectDialog component

**Files:**
- Create: `frontend/src/features/applications/components/RejectDialog.tsx`
- Create: `frontend/src/features/applications/components/RejectDialog.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/applications/components/RejectDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RejectDialog } from './RejectDialog'

describe('RejectDialog', () => {
  it('does not show the dialog content until the trigger is clicked', () => {
    render(<RejectDialog onConfirm={vi.fn()} isLoading={false} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('opens the dialog when "Rejeitar" button is clicked', async () => {
    render(<RejectDialog onConfirm={vi.fn()} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Rejeitar/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onConfirm with feedback text when form is submitted', async () => {
    const onConfirm = vi.fn()
    render(<RejectDialog onConfirm={onConfirm} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Rejeitar/i }))
    await userEvent.type(screen.getByRole('textbox'), 'Perfil fora do escopo')
    await userEvent.click(screen.getByRole('button', { name: /Confirmar rejeição/i }))
    expect(onConfirm).toHaveBeenCalledWith('Perfil fora do escopo')
  })

  it('disables confirm button while isLoading is true', async () => {
    render(<RejectDialog onConfirm={vi.fn()} isLoading={true} />)
    await userEvent.click(screen.getByRole('button', { name: /Rejeitar/i }))
    expect(screen.getByRole('button', { name: /Confirmar rejeição/i })).toBeDisabled()
  })

  it('allows empty feedback submission', async () => {
    const onConfirm = vi.fn()
    render(<RejectDialog onConfirm={onConfirm} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Rejeitar/i }))
    await userEvent.click(screen.getByRole('button', { name: /Confirmar rejeição/i }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/RejectDialog.test.tsx
```

Expected: FAIL — `RejectDialog` module not found.

- [ ] **Step 3: Implement RejectDialog**

Create `frontend/src/features/applications/components/RejectDialog.tsx`:

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RejectDialogProps {
  onConfirm: (feedback: string) => void
  isLoading: boolean
}

export function RejectDialog({ onConfirm, isLoading }: RejectDialogProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')

  function handleConfirm() {
    onConfirm(feedback)
    setOpen(false)
    setFeedback('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Rejeitar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar candidatura</DialogTitle>
          <DialogDescription>
            Informe o motivo da rejeição (opcional). O aluno será notificado com este feedback.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Ex: O perfil do candidato não é compatível com os pré-requisitos desta proposta."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            Confirmar rejeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/RejectDialog.test.tsx
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/features/applications/components/RejectDialog.tsx src/features/applications/components/RejectDialog.test.tsx
git commit -m "feat: add RejectDialog component with feedback textarea"
```

---

### Task 3: PendingApplicationCard component

**Files:**
- Create: `frontend/src/features/applications/components/PendingApplicationCard.tsx`
- Create: `frontend/src/features/applications/components/PendingApplicationCard.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/applications/components/PendingApplicationCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PendingApplicationCard } from './PendingApplicationCard'
import type { Application } from '@/types/models'

const app: Application = {
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
    profile_link: 'https://github.com/joao',
  },
  proposal: {
    id: 10,
    professor_id: 1,
    title: 'ML em Biomedicina',
    description: 'D',
    prerequisites: null,
    max_slots: 4,
    department_id: 1,
    area_id: 1,
    status: 'open',
  },
}

describe('PendingApplicationCard', () => {
  it('renders student name', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('renders student email', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    expect(screen.getByText('joao@student.edu')).toBeInTheDocument()
  })

  it('renders student initials in Avatar', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renders proposal title', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument()
  })

  it('renders portfolio link when present', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    const link = screen.getByRole('link', { name: /Portfólio/i })
    expect(link).toHaveAttribute('href', 'https://github.com/joao')
  })

  it('does not render portfolio link when profile_link is null', () => {
    const appNoLink: Application = { ...app, student: { ...app.student!, profile_link: null } }
    render(<PendingApplicationCard application={appNoLink} onApprove={vi.fn()} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    expect(screen.queryByRole('link', { name: /Portfólio/i })).not.toBeInTheDocument()
  })

  it('calls onApprove when Aprovar button is clicked', async () => {
    const onApprove = vi.fn()
    render(<PendingApplicationCard application={app} onApprove={onApprove} onReject={vi.fn()} isApproving={false} isRejecting={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Aprovar/i }))
    expect(onApprove).toHaveBeenCalledTimes(1)
  })

  it('disables Aprovar button when isApproving is true', () => {
    render(<PendingApplicationCard application={app} onApprove={vi.fn()} onReject={vi.fn()} isApproving={true} isRejecting={false} />)
    expect(screen.getByRole('button', { name: /Aprovar/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/PendingApplicationCard.test.tsx
```

Expected: FAIL — `PendingApplicationCard` module not found.

- [ ] **Step 3: Implement PendingApplicationCard**

Create `frontend/src/features/applications/components/PendingApplicationCard.tsx`:

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RejectDialog } from './RejectDialog'
import type { Application } from '@/types/models'

interface PendingApplicationCardProps {
  application: Application
  onApprove: () => void
  onReject: (feedback: string) => void
  isApproving: boolean
  isRejecting: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function PendingApplicationCard({
  application,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: PendingApplicationCardProps) {
  const { student, proposal } = application
  const name = student?.name ?? 'Aluno'
  const email = student?.email ?? ''
  const profileLink = student?.profile_link
  const proposalTitle = proposal?.title ?? `Proposta #${application.proposal_id}`

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{name}</p>
            <p className="text-muted-foreground text-sm">{email}</p>
            {profileLink && (
              <a
                href={profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm underline"
              >
                Portfólio ↗
              </a>
            )}
            <p className="mt-1 text-sm">
              <span className="font-medium">Proposta:</span> {proposalTitle}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={onApprove}
            disabled={isApproving}
          >
            Aprovar
          </Button>
          <RejectDialog onConfirm={onReject} isLoading={isRejecting} />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/applications/components/PendingApplicationCard.test.tsx
```

Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/features/applications/components/PendingApplicationCard.tsx src/features/applications/components/PendingApplicationCard.test.tsx
git commit -m "feat: add PendingApplicationCard with approve button and reject dialog"
```

---

### Task 4: DeleteProposalDialog component

**Files:**
- Create: `frontend/src/features/proposals/components/DeleteProposalDialog.tsx`
- Create: `frontend/src/features/proposals/components/DeleteProposalDialog.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/proposals/components/DeleteProposalDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteProposalDialog } from './DeleteProposalDialog'

describe('DeleteProposalDialog', () => {
  it('does not show dialog content until trigger is clicked', () => {
    render(<DeleteProposalDialog onConfirm={vi.fn()} isLoading={false} />)
    expect(screen.queryByText(/Tem certeza/i)).not.toBeInTheDocument()
  })

  it('opens the dialog when "Excluir" button is clicked', async () => {
    render(<DeleteProposalDialog onConfirm={vi.fn()} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    expect(screen.getByText(/Tem certeza/i)).toBeInTheDocument()
  })

  it('calls onConfirm when "Confirmar exclusão" is clicked', async () => {
    const onConfirm = vi.fn()
    render(<DeleteProposalDialog onConfirm={onConfirm} isLoading={false} />)
    await userEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    await userEvent.click(screen.getByRole('button', { name: /Confirmar exclusão/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('disables confirm button while isLoading is true', async () => {
    render(<DeleteProposalDialog onConfirm={vi.fn()} isLoading={true} />)
    await userEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    expect(screen.getByRole('button', { name: /Confirmar exclusão/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/proposals/components/DeleteProposalDialog.test.tsx
```

Expected: FAIL — `DeleteProposalDialog` module not found.

- [ ] **Step 3: Implement DeleteProposalDialog**

Create `frontend/src/features/proposals/components/DeleteProposalDialog.tsx`:

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteProposalDialogProps {
  onConfirm: () => void
  isLoading: boolean
}

export function DeleteProposalDialog({ onConfirm, isLoading }: DeleteProposalDialogProps) {
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir proposta</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta proposta? Essa ação não pode ser desfeita.
            Todas as candidaturas vinculadas também serão removidas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            Confirmar exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/features/proposals/components/DeleteProposalDialog.test.tsx
```

Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/features/proposals/components/DeleteProposalDialog.tsx src/features/proposals/components/DeleteProposalDialog.test.tsx
git commit -m "feat: add DeleteProposalDialog component with confirmation dialog"
```

---

### Task 5: DashboardPage

**Files:**
- Modify: `frontend/src/pages/dashboard/index.tsx`
- Create: `frontend/src/pages/dashboard/index.test.tsx`

> This task assumes the Sonner toast library is installed. If not, install it: `bun add sonner` and add `<Toaster />` to `frontend/src/main.tsx`.

- [ ] **Step 1: Install Sonner (if not present)**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun add sonner
```

Then open `frontend/src/main.tsx` and add the Toaster after `<RouterProvider>`:

```tsx
import { Toaster } from 'sonner'

// Inside the render:
<StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster richColors />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
</StrictMode>
```

- [ ] **Step 2: Write failing tests**

Create `frontend/src/pages/dashboard/index.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import DashboardPage from './index'
import { server } from '@/test/server'
import type { Proposal, Application } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, name: 'Prof. Ana Lima', email: 'ana@uni.edu', role: 'professor', department_id: 1, profile_link: null },
    isProfessor: true,
    isStudent: false,
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  }),
}))

// Stub toast so it doesn't throw in test environment
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function makeApp(node: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return { qc, ...render(<QueryClientProvider client={qc}>{node}</QueryClientProvider>) }
}

const proposal1: Proposal = {
  id: 10, professor_id: 1, title: 'ML em Biomedicina', description: 'D',
  prerequisites: null, max_slots: 4, department_id: 1, area_id: 1, status: 'open',
  area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
  applications_count: 6, approved_applications_count: 2,
}

const proposal2: Proposal = {
  id: 11, professor_id: 1, title: 'Visão Computacional', description: 'D',
  prerequisites: null, max_slots: 2, department_id: 1, area_id: 2, status: 'open',
  area: { id: 2, name: 'Visão Computacional', code: 'VC' },
  applications_count: 2, approved_applications_count: 1,
}

const pendingApp: Application = {
  id: 100, student_id: 2, proposal_id: 10, status: 'pending', feedback: null,
  applied_at: '2025-05-10T09:00:00Z', reviewed_at: null,
  student: { id: 2, name: 'João Silva', email: 'joao@student.edu', role: 'student', department_id: null, profile_link: null },
  proposal: proposal1,
}

function mockData(proposals: Proposal[], pendingApps: Application[]) {
  const proposalResponse: PaginatedResponse<Proposal> = {
    data: proposals,
    meta: { current_page: 1, last_page: 1, per_page: 15, total: proposals.length, from: 1, to: proposals.length },
    links: { first: null, last: null, prev: null, next: null },
  }
  const appResponse: PaginatedResponse<Application> = {
    data: pendingApps,
    meta: { current_page: 1, last_page: 1, per_page: 15, total: pendingApps.length, from: 1, to: pendingApps.length },
    links: { first: null, last: null, prev: null, next: null },
  }
  server.use(
    http.get('http://localhost:8000/proposals', () => HttpResponse.json(proposalResponse)),
    http.get('http://localhost:8000/applications', () => HttpResponse.json(appResponse)),
  )
}

describe('DashboardPage', () => {
  it('renders 4 KPI skeletons while loading', () => {
    mockData([proposal1], [pendingApp])
    makeApp(<DashboardPage />)
    const skeletons = document.querySelectorAll('[data-testid="kpi-skeleton"]')
    expect(skeletons.length).toBe(4)
  })

  it('renders KPI card — Propostas ativas with correct count', async () => {
    mockData([proposal1, proposal2], [])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('Propostas ativas')).toBeInTheDocument())
    // both proposals are open
    const kpiValues = screen.getAllByText('2')
    // at least one "2" is the active proposals count
    expect(kpiValues.length).toBeGreaterThanOrEqual(1)
  })

  it('renders KPI card — Vagas totais as sum of max_slots', async () => {
    mockData([proposal1, proposal2], [])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('Vagas totais')).toBeInTheDocument())
    // 4 + 2 = 6
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders KPI card — Vagas preenchidas as sum of approved_applications_count', async () => {
    mockData([proposal1, proposal2], [])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('Vagas preenchidas')).toBeInTheDocument())
    // 2 + 1 = 3
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders KPI card — Candidatos pendentes', async () => {
    mockData([proposal1], [pendingApp])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('Candidatos pendentes')).toBeInTheDocument())
    // 1 pending application
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows pending application card with student name', async () => {
    mockData([proposal1], [pendingApp])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('João Silva')).toBeInTheDocument())
  })

  it('calls approve mutation when Aprovar is clicked', async () => {
    mockData([proposal1], [pendingApp])
    let approveCalledId: number | undefined
    server.use(
      http.patch('http://localhost:8000/applications/:id/approve', ({ params }) => {
        approveCalledId = Number(params.id)
        const approved = { ...pendingApp, status: 'approved' as const }
        return HttpResponse.json({ data: approved })
      }),
    )
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Aprovar/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Aprovar/i }))
    await waitFor(() => expect(approveCalledId).toBe(100))
  })

  it('shows reject dialog and submits feedback when Rejeitar is clicked', async () => {
    mockData([proposal1], [pendingApp])
    let capturedBody: unknown
    server.use(
      http.patch('http://localhost:8000/applications/:id/reject', async ({ request }) => {
        capturedBody = await request.json()
        const rejected = { ...pendingApp, status: 'rejected' as const, feedback: (capturedBody as { feedback: string }).feedback }
        return HttpResponse.json({ data: rejected })
      }),
    )
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Rejeitar/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Rejeitar/i }))
    await userEvent.type(screen.getByRole('textbox'), 'Fora do escopo')
    await userEvent.click(screen.getByRole('button', { name: /Confirmar rejeição/i }))
    await waitFor(() => expect(capturedBody).toEqual({ feedback: 'Fora do escopo' }))
  })

  it('shows proposals table with title and area', async () => {
    mockData([proposal1, proposal2], [])
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument())
    expect(screen.getByText('Visão Computacional')).toBeInTheDocument()
    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('calls delete mutation when delete dialog is confirmed', async () => {
    mockData([proposal1], [])
    let deleteCalledId: number | undefined
    server.use(
      http.delete('http://localhost:8000/proposals/:id', ({ params }) => {
        deleteCalledId = Number(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    makeApp(<DashboardPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Excluir/i }))
    await userEvent.click(screen.getByRole('button', { name: /Confirmar exclusão/i }))
    await waitFor(() => expect(deleteCalledId).toBe(10))
  })
})
```

- [ ] **Step 3: Run tests — expect failure**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/pages/dashboard/index.test.tsx
```

Expected: FAIL — `DashboardPage` is still a stub.

- [ ] **Step 4: Implement DashboardPage**

Replace `frontend/src/pages/dashboard/index.tsx` entirely with:

```tsx
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { KpiCard } from '@/features/proposals/components/KpiCard'
import { DeleteProposalDialog } from '@/features/proposals/components/DeleteProposalDialog'
import { PendingApplicationCard } from '@/features/applications/components/PendingApplicationCard'
import { useProposals, useDeleteProposal } from '@/features/proposals/hooks'
import { useApplications, useApproveApplication, useRejectApplication } from '@/features/applications/hooks'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/constants/routes'

function KpiSkeleton() {
  return (
    <Card data-testid="kpi-skeleton">
      <CardContent className="pt-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-16" />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: proposalsData, isLoading: proposalsLoading } = useProposals()
  const { data: applicationsData, isLoading: appsLoading } = useApplications({ status: 'pending' })

  const approveMutation = useApproveApplication()
  const rejectMutation = useRejectApplication()
  const deleteMutation = useDeleteProposal()

  const proposals = useMemo(
    () => (proposalsData?.data ?? []).filter((p) => p.professor_id === user?.id),
    [proposalsData, user],
  )

  const pendingApplications = useMemo(() => applicationsData?.data ?? [], [applicationsData])

  const kpis = useMemo(
    () => ({
      activeProposals: proposals.filter((p) => p.status === 'open').length,
      totalSlots: proposals.reduce((sum, p) => sum + p.max_slots, 0),
      filledSlots: proposals.reduce((sum, p) => sum + (p.approved_applications_count ?? 0), 0),
      pendingCount: pendingApplications.length,
    }),
    [proposals, pendingApplications],
  )

  const isLoading = proposalsLoading || appsLoading

  function handleApprove(id: number) {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success('Candidatura aprovada com sucesso!'),
      onError: () => toast.error('Erro ao aprovar candidatura.'),
    })
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Proposta excluída.'),
      onError: () => toast.error('Erro ao excluir proposta.'),
    })
  }

  function handleReject(id: number, feedback: string) {
    rejectMutation.mutate(
      { id, payload: { feedback: feedback || undefined } },
      {
        onSuccess: () => toast.success('Candidatura rejeitada.'),
        onError: () => toast.error('Erro ao rejeitar candidatura.'),
      },
    )
  }

  return (
    <ProtectedRoute role="professor">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link to="/propostas/nova">+ Nova proposta</Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : (
            <>
              <KpiCard label="Propostas ativas" value={kpis.activeProposals} />
              <KpiCard label="Vagas totais" value={kpis.totalSlots} />
              <KpiCard label="Vagas preenchidas" value={kpis.filledSlots} />
              <KpiCard label="Candidatos pendentes" value={kpis.pendingCount} />
            </>
          )}
        </div>

        {/* Proposals Table */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Minhas Propostas</h2>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground text-center">
                        Nenhuma proposta criada ainda.
                      </TableCell>
                    </TableRow>
                  )}
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{proposal.area?.name ?? '—'}</TableCell>
                      <TableCell>
                        {proposal.approved_applications_count ?? 0}/{proposal.max_slots}
                      </TableCell>
                      <TableCell>{proposal.applications_count ?? 0}</TableCell>
                      <TableCell>
                        <StatusBadge status={proposal.status === 'open' ? 'approved' : 'rejected'} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/propostas/${proposal.id}/editar`}>Editar</Link>
                          </Button>
                          <DeleteProposalDialog
                            onConfirm={() => handleDelete(proposal.id)}
                            isLoading={deleteMutation.isPending && deleteMutation.variables === proposal.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* Pending Applications */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Candidaturas para revisar</h2>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : pendingApplications.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma candidatura pendente.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingApplications.map((app) => (
                <PendingApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={() => handleApprove(app.id)}
                  onReject={(feedback) => handleReject(app.id, feedback)}
                  isApproving={approveMutation.isPending && approveMutation.variables === app.id}
                  isRejecting={rejectMutation.isPending && rejectMutation.variables?.id === app.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test src/pages/dashboard/index.test.tsx
```

Expected: PASS — all 10 tests green.

- [ ] **Step 6: Verify TypeScript**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Run full test suite**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
bun test
```

Expected: PASS — all tests across all files green.

- [ ] **Step 8: Commit**

```bash
cd /home/supertgo/programas/conecta-tcc/frontend
git add src/pages/dashboard/index.tsx src/pages/dashboard/index.test.tsx src/main.tsx
git commit -m "feat: implement professor Dashboard with KPI cards, proposals table, and pending applications review"
```
