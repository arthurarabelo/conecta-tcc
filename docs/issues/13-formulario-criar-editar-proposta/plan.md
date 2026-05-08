# Proposal Create / Edit Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shared `ProposalForm` component plus create/edit page routes so professors can create, edit, and delete proposals with validation, ownership guard, and post-action navigation.

**Architecture:** A single `ProposalForm` component accepts a `mode` prop (`'create' | 'edit'`) and an optional `proposal` (used in edit mode for pre-population). In create mode it calls `useCreateProposal()` and navigates to `/propostas/:id` on success. In edit mode it calls `useUpdateProposal(id)` and navigates to `/dashboard`. Both pages are wrapped in `<ProtectedRoute role="professor">`. The edit page additionally redirects to `/dashboard` when `proposal.professor_id !== user.id`. Delete is handled with a Shadcn `Dialog` confirmation that calls `useDeleteProposal()`.

**Tech Stack:** React 19, React Hook Form v7, Zod v3, TanStack Router v1, TanStack Query v5, Shadcn/ui (Form, Input, Textarea, Select, Button, Dialog), Vitest + React Testing Library + MSW v2.

---

### Task 1: ProposalForm component

**Files:**
- Create: `frontend/src/features/proposals/components/ProposalForm.tsx`
- Create: `frontend/src/features/proposals/components/ProposalForm.test.tsx`

`ProposalForm` wraps React Hook Form. It validates with `proposalSchema` from `@/features/proposals/schemas`. In create mode the submit button reads "Criar proposta". In edit mode it reads "Salvar alterações" and the form begins pre-populated. A delete button is shown only in edit mode.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/src/features/proposals/components/ProposalForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { ProposalForm } from './ProposalForm'
import type { Proposal } from '@/types/models'

// Mock the hooks so we can inspect calls without hitting the network
vi.mock('@/features/proposals/hooks', () => ({
  useCreateProposal: vi.fn(),
  useUpdateProposal: vi.fn(),
  useDeleteProposal: vi.fn(),
}))

import { useCreateProposal, useUpdateProposal, useDeleteProposal } from '@/features/proposals/hooks'

const mockUseCreateProposal = vi.mocked(useCreateProposal)
const mockUseUpdateProposal = vi.mocked(useUpdateProposal)
const mockUseDeleteProposal = vi.mocked(useDeleteProposal)

const existingProposal: Proposal = {
  id: 7,
  professor_id: 10,
  title: 'IA Aplicada à Medicina',
  description: 'Descrição completa com ao menos vinte caracteres aqui.',
  prerequisites: 'Python, Machine Learning',
  max_slots: 2,
  department_id: 1,
  area_id: 1,
  status: 'open',
}

function makeMutationMock(mutateFn = vi.fn()) {
  return { mutate: mutateFn, isPending: false, isError: false, error: null }
}

function renderForm(mode: 'create' | 'edit' = 'create') {
  mockUseCreateProposal.mockReturnValue(makeMutationMock() as ReturnType<typeof useCreateProposal>)
  mockUseUpdateProposal.mockReturnValue(makeMutationMock() as ReturnType<typeof useUpdateProposal>)
  mockUseDeleteProposal.mockReturnValue(makeMutationMock() as ReturnType<typeof useDeleteProposal>)

  const qc = new QueryClient()
  const rootRoute = createRootRoute()
  const formRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/propostas/nova',
    component: () => (
      <ProposalForm
        mode={mode}
        proposal={mode === 'edit' ? existingProposal : undefined}
        onSuccess={vi.fn()}
      />
    ),
  })
  const routeTree = rootRoute.addChildren([formRoute])
  const history = createMemoryHistory({ initialEntries: ['/propostas/nova'] })
  const router = createRouter({ routeTree, history })

  return render(
    <QueryClientProvider client={qc}>
      <router.Provider />
    </QueryClientProvider>,
  )
}

describe('ProposalForm', () => {
  describe('create mode', () => {
    it('renders all form fields', async () => {
      renderForm('create')
      await waitFor(() => {
        expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/pré-requisitos/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/número de vagas/i)).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /departamento/i })).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /área/i })).toBeInTheDocument()
      })
    })

    it('shows required field errors on empty submit', async () => {
      renderForm('create')
      await waitFor(() => expect(screen.getByLabelText(/título/i)).toBeInTheDocument())

      await userEvent.click(screen.getByRole('button', { name: /criar proposta/i }))

      await waitFor(() => {
        expect(screen.getByText(/título deve ter ao menos 5 caracteres/i)).toBeInTheDocument()
        expect(screen.getByText(/descrição deve ter ao menos 20 caracteres/i)).toBeInTheDocument()
      })
    })

    it('calls useCreateProposal mutate with form values on valid submit', async () => {
      const mutateFn = vi.fn()
      mockUseCreateProposal.mockReturnValue(
        makeMutationMock(mutateFn) as ReturnType<typeof useCreateProposal>,
      )
      renderForm('create')
      await waitFor(() => expect(screen.getByLabelText(/título/i)).toBeInTheDocument())

      await userEvent.type(screen.getByLabelText(/título/i), 'Novo Tema Legal')
      await userEvent.type(
        screen.getByLabelText(/descrição/i),
        'Esta é uma descrição longa o suficiente.',
      )
      await userEvent.clear(screen.getByLabelText(/número de vagas/i))
      await userEvent.type(screen.getByLabelText(/número de vagas/i), '3')

      // Select departamento via Radix Select: open then click option
      await userEvent.click(screen.getByRole('combobox', { name: /departamento/i }))
      await userEvent.click(screen.getByRole('option', { name: 'DCC' }))

      // Select área
      await userEvent.click(screen.getByRole('combobox', { name: /área/i }))
      await userEvent.click(screen.getByRole('option', { name: 'Inteligência Artificial' }))

      await userEvent.click(screen.getByRole('button', { name: /criar proposta/i }))

      await waitFor(() => expect(mutateFn).toHaveBeenCalledOnce())
      expect(mutateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Novo Tema Legal',
          description: 'Esta é uma descrição longa o suficiente.',
          max_slots: 3,
          department_id: 1,
          area_id: 1,
        }),
        expect.any(Object),
      )
    })
  })

  describe('edit mode', () => {
    it('pre-populates fields with existing proposal data', async () => {
      renderForm('edit')
      await waitFor(() =>
        expect(screen.getByDisplayValue('IA Aplicada à Medicina')).toBeInTheDocument(),
      )
      expect(
        screen.getByDisplayValue('Descrição completa com ao menos vinte caracteres aqui.'),
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })

    it('shows delete button in edit mode', async () => {
      renderForm('edit')
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /excluir proposta/i })).toBeInTheDocument(),
      )
    })

    it('does not show delete button in create mode', async () => {
      renderForm('create')
      await waitFor(() => expect(screen.getByRole('button', { name: /criar proposta/i })).toBeInTheDocument())
      expect(screen.queryByRole('button', { name: /excluir proposta/i })).not.toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd conecta-tcc/frontend && npm test src/features/proposals/components/ProposalForm.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ProposalForm.tsx`**

```tsx
// frontend/src/features/proposals/components/ProposalForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { proposalSchema, type ProposalFormValues } from '@/features/proposals/schemas'
import { useCreateProposal, useUpdateProposal, useDeleteProposal } from '@/features/proposals/hooks'
import type { Proposal } from '@/types/models'

const AREAS = [
  { id: 1, name: 'Inteligência Artificial' },
  { id: 2, name: 'Banco de Dados' },
  { id: 3, name: 'Redes' },
  { id: 4, name: 'Compiladores' },
  { id: 5, name: 'IHC' },
]

const DEPARTMENTS = [
  { id: 1, name: 'DCC' },
  { id: 2, name: 'DEE' },
]

interface ProposalFormProps {
  mode: 'create' | 'edit'
  proposal?: Proposal
  onSuccess: (proposal?: Proposal) => void
  onDeleted?: () => void
}

export function ProposalForm({ mode, proposal, onSuccess, onDeleted }: ProposalFormProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title ?? '',
      description: proposal?.description ?? '',
      prerequisites: proposal?.prerequisites ?? '',
      max_slots: proposal?.max_slots ?? 1,
      department_id: proposal?.department_id ?? 0,
      area_id: proposal?.area_id ?? 0,
    },
  })

  const createMutation = useCreateProposal()
  const updateMutation = useUpdateProposal(proposal?.id ?? 0)
  const deleteMutation = useDeleteProposal()

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  function onSubmit(values: ProposalFormValues) {
    if (mode === 'create') {
      createMutation.mutate(values, {
        onSuccess(created) {
          onSuccess(created)
        },
      })
    } else {
      updateMutation.mutate(values, {
        onSuccess(updated) {
          onSuccess(updated)
        },
      })
    }
  }

  function handleDelete() {
    if (!proposal) return
    deleteMutation.mutate(proposal.id, {
      onSuccess() {
        setDeleteDialogOpen(false)
        onDeleted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: IA aplicada ao diagnóstico médico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o projeto, objetivos e metodologia"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pré-requisitos</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Cálculo, Álgebra Linear (opcional)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_slots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de vagas</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <Select
                value={field.value ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger aria-label="Departamento">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área do conhecimento</FormLabel>
              <Select
                value={field.value ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger aria-label="Área">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-4">
          <Button type="submit" disabled={isPending}>
            {mode === 'create'
              ? isPending
                ? 'Criando...'
                : 'Criar proposta'
              : isPending
                ? 'Salvando...'
                : 'Salvar alterações'}
          </Button>

          {mode === 'edit' && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Excluir proposta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir proposta</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. A proposta será removida permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </form>
    </Form>
  )
}
```

- [ ] **Step 4: Run to verify pass**

```bash
cd conecta-tcc/frontend && npm test src/features/proposals/components/ProposalForm.test.tsx
```

Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
cd conecta-tcc/frontend && git add src/features/proposals/components/ProposalForm.tsx src/features/proposals/components/ProposalForm.test.tsx && git commit -m "feat: add ProposalForm with create/edit modes and delete confirmation dialog"
```

---

### Task 2: ProposalCreatePage

**Files:**
- Create: `frontend/src/pages/proposal-create/index.tsx`
- Modify: `frontend/src/router.tsx`
- Modify: `frontend/src/constants/routes.ts`

The create page is behind `ProtectedRoute role="professor"`. On success it navigates to `/propostas/:id`.

- [ ] **Step 1: Add routes constant for create and edit**

Open `frontend/src/constants/routes.ts` and replace its contents with:

```typescript
export const ROUTES = {
  home: '/',
  login: '/entrar',
  proposals: {
    list: '/propostas',
    detail: (id: number | string) => `/propostas/${id}`,
    create: '/propostas/nova',
    edit: (id: number | string) => `/propostas/${id}/editar`,
  },
  myApplications: '/minhas-candidaturas',
  dashboard: '/dashboard',
} as const
```

- [ ] **Step 2: Create `src/pages/proposal-create/index.tsx`**

```tsx
// frontend/src/pages/proposal-create/index.tsx
import { useNavigate } from '@tanstack/react-router'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ProposalForm } from '@/features/proposals/components/ProposalForm'
import { ROUTES } from '@/constants/routes'
import type { Proposal } from '@/types/models'

export default function ProposalCreatePage() {
  const navigate = useNavigate()

  function handleSuccess(created?: Proposal) {
    if (created) {
      navigate({ to: ROUTES.proposals.detail(created.id) })
    }
  }

  return (
    <ProtectedRoute role="professor">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Nova proposta</h1>
        <ProposalForm mode="create" onSuccess={handleSuccess} />
      </main>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 3: Add the `/propostas/nova` route to `router.tsx`**

Open `frontend/src/router.tsx`. Add the lazy import and route. Replace the entire file with:

```tsx
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('@/pages/home'))
const LoginPage = lazy(() => import('@/pages/login'))
const ProposalsPage = lazy(() => import('@/pages/proposals'))
const ProposalDetailPage = lazy(() => import('@/pages/proposal-detail'))
const ProposalCreatePage = lazy(() => import('@/pages/proposal-create'))
const ProposalEditPage = lazy(() => import('@/pages/proposal-edit'))
const MyApplicationsPage = lazy(() => import('@/pages/my-applications'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <Outlet />
    </Suspense>
  ),
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/entrar',
  component: LoginPage,
})

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

// Must be declared before proposalDetailRoute so /propostas/nova is matched first
const proposalCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas/nova',
  component: ProposalCreatePage,
})

const proposalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas/$id',
  component: ProposalDetailPage,
})

const proposalEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas/$id/editar',
  component: ProposalEditPage,
})

const myApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/minhas-candidaturas',
  component: MyApplicationsPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  proposalsRoute,
  proposalCreateRoute,
  proposalDetailRoute,
  proposalEditRoute,
  myApplicationsRoute,
  dashboardRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd conecta-tcc/frontend && git add src/pages/proposal-create/index.tsx src/router.tsx src/constants/routes.ts && git commit -m "feat: add ProposalCreatePage route at /propostas/nova"
```

---

### Task 3: ProposalEditPage with ownership guard

**Files:**
- Create: `frontend/src/pages/proposal-edit/index.tsx`
- Create: `frontend/src/pages/proposal-edit/ProposalEditPage.test.tsx`

The edit page fetches the proposal by `$id`, checks that `proposal.professor_id === user.id`, and redirects to `/dashboard` if the check fails. Then it renders `ProposalForm` in edit mode.

- [ ] **Step 1: Add MSW helper for proposal update to `server.ts`**

Append to `frontend/src/test/server.ts`:

```typescript
export function mockProposalUpdate(proposalId: number, result: Proposal) {
  server.use(
    http.patch(`http://localhost:8000/proposals/${proposalId}`, () =>
      HttpResponse.json({ data: result }),
    ),
  )
}

export function mockProposalDelete(proposalId: number) {
  server.use(
    http.delete(`http://localhost:8000/proposals/${proposalId}`, () =>
      new HttpResponse(null, { status: 204 }),
    ),
  )
}
```

- [ ] **Step 2: Write the failing tests**

```tsx
// frontend/src/pages/proposal-edit/ProposalEditPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import ProposalEditPage from './index'
import { mockProposalDetail } from '@/test/server'
import type { Proposal, User } from '@/types/models'

vi.mock('@/store/auth.store', () => ({ useAuthStore: vi.fn() }))
vi.mock('@/features/proposals/hooks', () => ({
  useProposal: vi.fn(),
  useUpdateProposal: vi.fn(),
  useDeleteProposal: vi.fn(),
  useCreateProposal: vi.fn(),
}))

import { useAuthStore } from '@/store/auth.store'
import { useProposal, useUpdateProposal, useDeleteProposal, useCreateProposal } from '@/features/proposals/hooks'

const mockUseAuthStore = vi.mocked(useAuthStore)
const mockUseProposal = vi.mocked(useProposal)
const mockUseUpdateProposal = vi.mocked(useUpdateProposal)
const mockUseDeleteProposal = vi.mocked(useDeleteProposal)
const mockUseCreateProposal = vi.mocked(useCreateProposal)

const ownerProfessor: User = {
  id: 10,
  name: 'Prof. Costa',
  email: 'costa@uni.br',
  role: 'professor',
  department_id: 1,
  profile_link: null,
}

const otherProfessor: User = { ...ownerProfessor, id: 99, name: 'Prof. Outro' }

const proposal: Proposal = {
  id: 7,
  professor_id: 10,
  title: 'IA Aplicada à Medicina',
  description: 'Descrição completa com ao menos vinte caracteres aqui.',
  prerequisites: 'Python',
  max_slots: 2,
  department_id: 1,
  area_id: 1,
  status: 'open',
}

function makeMutation() {
  return { mutate: vi.fn(), isPending: false, isError: false, error: null }
}

function renderEditPage() {
  mockUseUpdateProposal.mockReturnValue(makeMutation() as ReturnType<typeof useUpdateProposal>)
  mockUseDeleteProposal.mockReturnValue(makeMutation() as ReturnType<typeof useDeleteProposal>)
  mockUseCreateProposal.mockReturnValue(makeMutation() as ReturnType<typeof useCreateProposal>)

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  const rootRoute = createRootRoute()
  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/propostas/$id/editar',
    component: ProposalEditPage,
  })
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => <div>Dashboard</div>,
  })
  const routeTree = rootRoute.addChildren([editRoute, dashboardRoute])
  const history = createMemoryHistory({ initialEntries: ['/propostas/7/editar'] })
  const router = createRouter({ routeTree, history })

  return render(
    <QueryClientProvider client={qc}>
      <router.Provider />
    </QueryClientProvider>,
  )
}

describe('ProposalEditPage', () => {
  describe('when proposal belongs to logged professor', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: ownerProfessor,
        token: 'tok',
        isAuthenticated: true,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      } as ReturnType<typeof useAuthStore>)
      mockUseProposal.mockReturnValue({
        data: proposal,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProposal>)
    })

    it('renders the form pre-populated with proposal data', async () => {
      renderEditPage()
      await waitFor(() =>
        expect(screen.getByDisplayValue('IA Aplicada à Medicina')).toBeInTheDocument(),
      )
      expect(screen.getByDisplayValue('Descrição completa com ao menos vinte caracteres aqui.')).toBeInTheDocument()
    })

    it('shows "Salvar alterações" submit button', async () => {
      renderEditPage()
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument(),
      )
    })

    it('shows "Excluir proposta" delete button', async () => {
      renderEditPage()
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /excluir proposta/i })).toBeInTheDocument(),
      )
    })
  })

  describe('when proposal belongs to a different professor', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: otherProfessor,
        token: 'tok',
        isAuthenticated: true,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      } as ReturnType<typeof useAuthStore>)
      mockUseProposal.mockReturnValue({
        data: proposal,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProposal>)
    })

    it('redirects to /dashboard without rendering the form', async () => {
      renderEditPage()
      await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
      expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run to verify failure**

```bash
cd conecta-tcc/frontend && npm test src/pages/proposal-edit/ProposalEditPage.test.tsx
```

Expected: FAIL — `src/pages/proposal-edit/index.tsx` not found.

- [ ] **Step 4: Create `src/pages/proposal-edit/index.tsx`**

```tsx
// frontend/src/pages/proposal-edit/index.tsx
import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ProposalForm } from '@/features/proposals/components/ProposalForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useProposal } from '@/features/proposals/hooks'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'

export default function ProposalEditPage() {
  const { id } = useParams({ from: '/propostas/$id/editar' })
  const proposalId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: proposal, isLoading } = useProposal(proposalId)

  // Ownership guard: redirect non-owners to dashboard
  useEffect(() => {
    if (!isLoading && proposal && user && proposal.professor_id !== user.id) {
      navigate({ to: ROUTES.dashboard })
    }
  }, [isLoading, proposal, user, navigate])

  function handleSuccess() {
    navigate({ to: ROUTES.dashboard })
  }

  function handleDeleted() {
    navigate({ to: ROUTES.dashboard })
  }

  if (isLoading) {
    return (
      <ProtectedRoute role="professor">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-10 w-1/2 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  if (!proposal) return null

  // Don't render the form for non-owners — the useEffect will redirect
  if (user && proposal.professor_id !== user.id) return null

  return (
    <ProtectedRoute role="professor">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Editar proposta</h1>
        <ProposalForm
          mode="edit"
          proposal={proposal}
          onSuccess={handleSuccess}
          onDeleted={handleDeleted}
        />
      </main>
    </ProtectedRoute>
  )
}
```

- [ ] **Step 5: Run to verify pass**

```bash
cd conecta-tcc/frontend && npm test src/pages/proposal-edit/ProposalEditPage.test.tsx
```

Expected: PASS — 4 tests.

- [ ] **Step 6: Commit**

```bash
cd conecta-tcc/frontend && git add src/pages/proposal-edit/index.tsx src/pages/proposal-edit/ProposalEditPage.test.tsx src/test/server.ts && git commit -m "feat: add ProposalEditPage with ownership guard, edit form and delete flow"
```

---

### Task 4: Final integration check

**Files:** none new

- [ ] **Step 1: Run all tests**

```bash
cd conecta-tcc/frontend && npm test
```

Expected: all tests pass, no failures.

- [ ] **Step 2: TypeScript check**

```bash
cd conecta-tcc/frontend && npx tsc --noEmit
```

Expected: exits with code 0, no type errors.

- [ ] **Step 3: Commit if any fixes were needed**

```bash
cd conecta-tcc/frontend && git add -p && git commit -m "fix: resolve type errors from proposal form integration"
```

Skip this step if there were no errors and no uncommitted changes.
