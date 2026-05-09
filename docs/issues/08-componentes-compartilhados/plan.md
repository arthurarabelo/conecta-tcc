# Shared Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four shared UI components (StatusBadge, ProposalCard, SiteHeader, ErrorBoundary), wire them into the router root, and cover StatusBadge and ProposalCard with tests.

**Architecture:** Each component lives in `src/components/shared/<Name>/index.tsx`. The router root component (`src/router.tsx`) wraps `<Outlet />` with `<SiteHeader>` and `<ErrorBoundary>`. Tests use Vitest + React Testing Library with a minimal test setup installed in this task.

**Tech Stack:** React 19, TanStack Router v1, Shadcn/ui (Badge, Avatar, DropdownMenu), lucide-react, Vitest, React Testing Library, @testing-library/jest-dom

---

### Task 1: Install test dependencies and configure Vitest

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test/setup.ts`

- [ ] **Step 1: Install Vitest and React Testing Library**

Run from `frontend/`:
```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test script to package.json**

In `frontend/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 4: Create test setup file**

```ts
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Verify setup compiles**

Run from `frontend/`:
```bash
npx vitest run --reporter=verbose 2>&1 | head -20
```
Expected: "No test files found" or zero test suites, no compilation errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/vitest.config.ts frontend/src/test/setup.ts
git commit -m "chore: add vitest and react testing library"
```

---

### Task 2: StatusBadge component

**Files:**
- Create: `frontend/src/components/shared/StatusBadge/index.tsx`
- Create: `frontend/src/components/shared/StatusBadge/StatusBadge.test.tsx`

The component maps `ApplicationStatus` to a colored Shadcn `Badge`. Shadcn Badge doesn't ship a native "yellow" or "green" variant out of the box in New York style — we use `className` overrides with Tailwind to apply the exact colours.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/src/components/shared/StatusBadge/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '.'

describe('StatusBadge', () => {
  it('renders "Em análise" for pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Em análise')).toBeInTheDocument()
  })

  it('renders "Aprovado" for approved status', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
  })

  it('renders "Rejeitado" for rejected status', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejeitado')).toBeInTheDocument()
  })

  it('applies yellow styling for pending', () => {
    const { container } = render(<StatusBadge status="pending" />)
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })

  it('applies green styling for approved', () => {
    const { container } = render(<StatusBadge status="approved" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies red styling for rejected', () => {
    const { container } = render(<StatusBadge status="rejected" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run src/components/shared/StatusBadge/StatusBadge.test.tsx
```
Expected: FAIL — "Cannot find module '.'"

- [ ] **Step 3: Install Shadcn Badge (if not already present)**

Check `frontend/src/components/ui/badge.tsx`. If it doesn't exist:
```bash
cd frontend && npx shadcn@latest add badge
```

- [ ] **Step 4: Create StatusBadge component**

```tsx
// frontend/src/components/shared/StatusBadge/index.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types/models'

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Em análise',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  rejected: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
}

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn(className)}>
      {label}
    </Badge>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npx vitest run src/components/shared/StatusBadge/StatusBadge.test.tsx
```
Expected: PASS — 6 tests pass

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/shared/StatusBadge/
git commit -m "feat: add StatusBadge component with application status mapping"
```

---

### Task 3: ProposalCard component

**Files:**
- Create: `frontend/src/components/shared/ProposalCard/index.tsx`
- Create: `frontend/src/components/shared/ProposalCard/ProposalCard.test.tsx`

The card shows area badge, open/closed badge, title, 3-line description, professor avatar+name, and remaining slots. It links to `/propostas/:id` using TanStack Router's `<Link>`. Tests must wrap the component in a minimal TanStack Router context.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/src/components/shared/ProposalCard/ProposalCard.test.tsx
import { render, screen } from '@testing-library/react'
import { createMemoryHistory, createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router'
import { ProposalCard } from '.'
import type { Proposal } from '@/types/models'

const mockProposal: Proposal = {
  id: 42,
  professor_id: 1,
  title: 'Análise de Sentimentos com PLN',
  description: 'Neste trabalho, o aluno irá explorar técnicas de Processamento de Linguagem Natural para análise de sentimentos em redes sociais, desenvolvendo modelos de aprendizado de máquina.',
  prerequisites: 'Python básico',
  max_slots: 3,
  department_id: 1,
  area_id: 2,
  status: 'open',
  professor: {
    id: 1,
    name: 'Prof. Ana Souza',
    email: 'ana@univ.br',
    role: 'professor',
    department_id: 1,
    profile_link: null,
  },
  department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
  area: { id: 2, name: 'Inteligência Artificial', code: 'IA' },
  applications_count: 1,
  approved_applications_count: 1,
}

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  })
  return render(<RouterProvider router={router} />)
}

describe('ProposalCard', () => {
  it('renders the proposal title', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Análise de Sentimentos com PLN')).toBeInTheDocument()
  })

  it('renders the professor name', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Prof. Ana Souza')).toBeInTheDocument()
  })

  it('renders remaining slots count', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    // max_slots=3, approved=1 → 2 remaining
    expect(await screen.findByText(/2 de 3 vagas/)).toBeInTheDocument()
  })

  it('renders a link to the proposal detail page', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    const link = await screen.findByRole('link')
    expect(link).toHaveAttribute('href', '/propostas/42')
  })

  it('renders the knowledge area badge', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('renders "Aberta" badge for open proposal', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Aberta')).toBeInTheDocument()
  })

  it('renders "Fechada" badge for closed proposal', async () => {
    renderWithRouter(<ProposalCard proposal={{ ...mockProposal, status: 'closed' }} />)
    expect(await screen.findByText('Fechada')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run src/components/shared/ProposalCard/ProposalCard.test.tsx
```
Expected: FAIL — "Cannot find module '.'"

- [ ] **Step 3: Install required Shadcn components (if not present)**

Check `frontend/src/components/ui/card.tsx` and `frontend/src/components/ui/avatar.tsx`. Install any missing:
```bash
cd frontend && npx shadcn@latest add card avatar badge
```

- [ ] **Step 4: Create ProposalCard component**

```tsx
// frontend/src/components/shared/ProposalCard/index.tsx
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { remainingSlots } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { Proposal } from '@/types/models'

interface ProposalCardProps {
  proposal: Proposal
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const slots = remainingSlots(proposal.max_slots, proposal.approved_applications_count ?? 0)

  return (
    <Link to={ROUTES.proposals.detail(proposal.id)} className="block focus:outline-none">
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {proposal.area && (
              <Badge variant="secondary">{proposal.area.name}</Badge>
            )}
            <Badge
              variant="outline"
              className={
                proposal.status === 'open'
                  ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-50'
                  : 'border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-50'
              }
            >
              {proposal.status === 'open' ? 'Aberta' : 'Fechada'}
            </Badge>
          </div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {proposal.title}
          </h3>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {proposal.description}
          </p>
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {proposal.professor ? getInitials(proposal.professor.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {proposal.professor?.name ?? 'Professor'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {slots} de {proposal.max_slots} vagas
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npx vitest run src/components/shared/ProposalCard/ProposalCard.test.tsx
```
Expected: PASS — 7 tests pass

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/shared/ProposalCard/
git commit -m "feat: add ProposalCard component with link and slot display"
```

---

### Task 4: SiteHeader component

**Files:**
- Create: `frontend/src/components/shared/SiteHeader/index.tsx`
- Create: `frontend/src/components/shared/SiteHeader/NavLink.tsx`

The header is fixed at the top and renders different navigation items based on authentication state and role. On mobile it uses a `Sheet` (or `DropdownMenu`) for the hamburger menu.

- [ ] **Step 1: Install required Shadcn components**

```bash
cd frontend && npx shadcn@latest add dropdown-menu sheet separator
```

- [ ] **Step 2: Create NavLink helper component**

```tsx
// frontend/src/components/shared/SiteHeader/NavLink.tsx
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavLink({ to, children, className, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      activeProps={{ className: 'text-foreground' }}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Step 3: Create SiteHeader component**

```tsx
// frontend/src/components/shared/SiteHeader/index.tsx
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GraduationCap, Menu, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useLogout } from '@/features/auth/hooks'
import { ROUTES } from '@/constants/routes'
import { NavLink } from './NavLink'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function SiteHeader() {
  const { user, isAuthenticated, isStudent, isProfessor } = useAuth()
  const logout = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout.mutate()
  }

  const navLinks = (
    <>
      <NavLink to={ROUTES.home} onClick={() => setMobileOpen(false)}>
        Home
      </NavLink>
      <NavLink to={ROUTES.proposals.list} onClick={() => setMobileOpen(false)}>
        Mural
      </NavLink>
      {isStudent && (
        <NavLink to={ROUTES.myApplications} onClick={() => setMobileOpen(false)}>
          Minhas Candidaturas
        </NavLink>
      )}
      {isProfessor && (
        <NavLink to={ROUTES.dashboard} onClick={() => setMobileOpen(false)}>
          Dashboard
        </NavLink>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to={ROUTES.home} className="flex items-center gap-2 font-bold text-foreground">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>Conecta TCC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">{navLinks}</nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <Button asChild size="sm">
              <Link to={ROUTES.login}>Entrar</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 pt-6">
                <nav className="flex flex-col gap-3">{navLinks}</nav>
                <div className="border-t pt-4">
                  {!isAuthenticated ? (
                    <Button asChild className="w-full" size="sm">
                      <Link to={ROUTES.login} onClick={() => setMobileOpen(false)}>
                        Entrar
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className="w-full justify-start text-destructive border-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/shared/SiteHeader/
git commit -m "feat: add SiteHeader with responsive nav and auth-aware links"
```

---

### Task 5: ErrorBoundary component

**Files:**
- Create: `frontend/src/components/shared/ErrorBoundary/index.tsx`

React error boundaries must be class components. The fallback UI is a centered card with an error message and a reload button.

- [ ] **Step 1: Create ErrorBoundary component**

```tsx
// frontend/src/components/shared/ErrorBoundary/index.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle>Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message ?? 'Ocorreu um erro inesperado. Tente recarregar a página.'}
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={this.handleReload}>Recarregar página</Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/shared/ErrorBoundary/index.tsx
git commit -m "feat: add ErrorBoundary class component with reload fallback UI"
```

---

### Task 6: Wire SiteHeader and ErrorBoundary into the router root

**Files:**
- Modify: `frontend/src/router.tsx`

The root route component wraps `<Outlet />` with `<SiteHeader>` above and the whole tree inside `<ErrorBoundary>`.

- [ ] **Step 1: Update router.tsx root component**

Replace the current `rootRoute` definition in `frontend/src/router.tsx`:

```tsx
// frontend/src/router.tsx
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const HomePage = lazy(() => import('@/pages/home'))
const LoginPage = lazy(() => import('@/pages/login'))
const ProposalsPage = lazy(() => import('@/pages/proposals'))
const ProposalDetailPage = lazy(() => import('@/pages/proposal-detail'))
const MyApplicationsPage = lazy(() => import('@/pages/my-applications'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))

const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <SiteHeader />
      <main>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </ErrorBoundary>
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
})

const proposalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/propostas/$id',
  component: ProposalDetailPage,
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
  proposalDetailRoute,
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Run all tests to confirm nothing broke**

```bash
cd frontend && npx vitest run
```
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/router.tsx
git commit -m "feat: integrate SiteHeader and ErrorBoundary into router root layout"
```
