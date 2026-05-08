# Route Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a `ProtectedRoute` component that redirects unauthenticated users to `/entrar` and users with the wrong role to `/`, then wire it into the router for `/minhas-candidaturas` (student) and `/dashboard` (professor).

**Architecture:** `ProtectedRoute` is a thin wrapper component that reads `useAuth()` and calls `useNavigate()` from TanStack Router to perform client-side redirects. It renders `null` while redirecting and renders `{children}` when access is permitted. The router wraps protected route components by composing `ProtectedRoute` inside each page's component definition rather than at the route config level (simpler, easier to test). Tests use `createMemoryHistory` + `createRouter` from TanStack Router to test actual navigation behavior.

**Tech Stack:** TanStack Router v1 (createMemoryHistory, createRouter), React, useAuth hook, Vitest + @testing-library/react

---

### Task 1: ProtectedRoute component

**Files:**
- Create: `frontend/src/components/shared/ProtectedRoute.tsx`
- Create: `frontend/src/components/shared/ProtectedRoute.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/components/shared/ProtectedRoute.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './ProtectedRoute'

// Mock useAuth so we can control auth state
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

// Mock useNavigate so we can capture navigation calls
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { useAuth } from '@/hooks/use-auth'

const authenticatedStudent = {
  user: { id: 2, name: 'Aluno', email: 'aluno@ufmg.br', role: 'student' as const, department_id: 1, profile_link: null },
  token: 'token-abc',
  isAuthenticated: true,
  isProfessor: false,
  isStudent: true,
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
}

const authenticatedProfessor = {
  user: { id: 1, name: 'Prof', email: 'prof@ufmg.br', role: 'professor' as const, department_id: 1, profile_link: null },
  token: 'token-abc',
  isAuthenticated: true,
  isProfessor: true,
  isStudent: false,
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
}

const unauthenticated = {
  user: null,
  token: null,
  isAuthenticated: false,
  isProfessor: false,
  isStudent: false,
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('unauthenticated user', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(unauthenticated as any)
    })

    it('redirects to /entrar when not authenticated', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar' })
    })

    it('renders nothing (null) when not authenticated', () => {
      const { container } = render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('redirects to /entrar even when role is specified', () => {
      render(
        <ProtectedRoute role="student">
          <div>Student Content</div>
        </ProtectedRoute>,
      )

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar' })
    })
  })

  describe('authenticated student accessing student-only route', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(authenticatedStudent as any)
    })

    it('renders children when no role restriction', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('renders children when role matches student', () => {
      render(
        <ProtectedRoute role="student">
          <div>Student Dashboard</div>
        </ProtectedRoute>,
      )

      expect(screen.getByText('Student Dashboard')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('redirects to / when student tries to access professor route', () => {
      render(
        <ProtectedRoute role="professor">
          <div>Professor Dashboard</div>
        </ProtectedRoute>,
      )

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('renders nothing when student accesses professor route', () => {
      const { container } = render(
        <ProtectedRoute role="professor">
          <div>Professor Dashboard</div>
        </ProtectedRoute>,
      )

      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByText('Professor Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('authenticated professor accessing professor-only route', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue(authenticatedProfessor as any)
    })

    it('renders children when role matches professor', () => {
      render(
        <ProtectedRoute role="professor">
          <div>Professor Dashboard</div>
        </ProtectedRoute>,
      )

      expect(screen.getByText('Professor Dashboard')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('redirects to / when professor tries to access student route', () => {
      render(
        <ProtectedRoute role="student">
          <div>My Applications</div>
        </ProtectedRoute>,
      )

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('renders nothing when professor accesses student route', () => {
      const { container } = render(
        <ProtectedRoute role="student">
          <div>My Applications</div>
        </ProtectedRoute>,
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('renders children when no role restriction', () => {
      render(
        <ProtectedRoute>
          <div>General Protected Content</div>
        </ProtectedRoute>,
      )

      expect(screen.getByText('General Protected Content')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/components/shared/ProtectedRoute.test.tsx --reporter=verbose
```
Expected: FAIL — ProtectedRoute.tsx does not exist yet.

- [ ] **Step 3: Implement ProtectedRoute**
```tsx
// frontend/src/components/shared/ProtectedRoute.tsx
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types/models'

interface ProtectedRouteProps {
  role?: UserRole
  children: React.ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const shouldRedirectToLogin = !isAuthenticated
  const shouldRedirectToHome = isAuthenticated && role !== undefined && user?.role !== role

  useEffect(() => {
    if (shouldRedirectToLogin) {
      navigate({ to: '/entrar' })
    } else if (shouldRedirectToHome) {
      navigate({ to: '/' })
    }
  }, [shouldRedirectToLogin, shouldRedirectToHome, navigate])

  if (shouldRedirectToLogin || shouldRedirectToHome) {
    return null
  }

  return <>{children}</>
}
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/components/shared/ProtectedRoute.test.tsx --reporter=verbose
```
Expected: PASS all 10 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/components/shared/ProtectedRoute.tsx frontend/src/components/shared/ProtectedRoute.test.tsx
git -C conecta-tcc commit -m "feat: add ProtectedRoute component with role-based redirect logic"
```

---

### Task 2: Wire ProtectedRoute into page components

**Files:**
- Modify: `frontend/src/pages/my-applications/index.tsx`
- Modify: `frontend/src/pages/dashboard/index.tsx`

- [ ] **Step 1: Write failing tests for MyApplicationsPage protection**
```tsx
// frontend/src/pages/my-applications/my-applications-page.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/use-auth', () => ({ useAuth: vi.fn() }))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useAuth } from '@/hooks/use-auth'
import MyApplicationsPage from './index'

describe('MyApplicationsPage route protection', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('redirects unauthenticated user to /entrar', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, token: null, isAuthenticated: false,
      isProfessor: false, isStudent: false,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<MyApplicationsPage />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar' })
  })

  it('redirects professor to / (wrong role)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'Prof', email: 'prof@ufmg.br', role: 'professor', department_id: 1, profile_link: null },
      token: 'tok', isAuthenticated: true,
      isProfessor: true, isStudent: false,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<MyApplicationsPage />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('renders content for authenticated student', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, name: 'Aluno', email: 'aluno@ufmg.br', role: 'student', department_id: 1, profile_link: null },
      token: 'tok', isAuthenticated: true,
      isProfessor: false, isStudent: true,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<MyApplicationsPage />)
    expect(mockNavigate).not.toHaveBeenCalled()
    // Page renders without redirect
  })
})
```

- [ ] **Step 2: Write failing tests for DashboardPage protection**
```tsx
// frontend/src/pages/dashboard/dashboard-page.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/use-auth', () => ({ useAuth: vi.fn() }))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useAuth } from '@/hooks/use-auth'
import DashboardPage from './index'

describe('DashboardPage route protection', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('redirects unauthenticated user to /entrar', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, token: null, isAuthenticated: false,
      isProfessor: false, isStudent: false,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<DashboardPage />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar' })
  })

  it('redirects student to / (wrong role)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, name: 'Aluno', email: 'aluno@ufmg.br', role: 'student', department_id: 1, profile_link: null },
      token: 'tok', isAuthenticated: true,
      isProfessor: false, isStudent: true,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<DashboardPage />)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('renders content for authenticated professor', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'Prof', email: 'prof@ufmg.br', role: 'professor', department_id: 1, profile_link: null },
      token: 'tok', isAuthenticated: true,
      isProfessor: true, isStudent: false,
      setAuth: vi.fn(), clearAuth: vi.fn(),
    } as any)

    render(<DashboardPage />)
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run tests — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/pages/my-applications/my-applications-page.test.tsx src/pages/dashboard/dashboard-page.test.tsx --reporter=verbose
```
Expected: FAIL — pages don't use ProtectedRoute yet.

- [ ] **Step 4: Implement MyApplicationsPage with ProtectedRoute**
```tsx
// frontend/src/pages/my-applications/index.tsx
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

function MyApplicationsContent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Minhas Candidaturas</h1>
      <p className="text-muted-foreground mt-2">
        Acompanhe o status das suas candidaturas a propostas de TCC.
      </p>
      {/* TODO: issue #09 — list applications */}
    </div>
  )
}

export default function MyApplicationsPage() {
  return (
    <ProtectedRoute role="student">
      <MyApplicationsContent />
    </ProtectedRoute>
  )
}
```

- [ ] **Step 5: Implement DashboardPage with ProtectedRoute**
```tsx
// frontend/src/pages/dashboard/index.tsx
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

function DashboardContent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">Dashboard do Professor</h1>
      <p className="text-muted-foreground mt-2">
        Gerencie suas propostas de TCC e candidaturas recebidas.
      </p>
      {/* TODO: issue #10 — professor dashboard features */}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute role="professor">
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

- [ ] **Step 6: Run tests — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/pages/my-applications/my-applications-page.test.tsx src/pages/dashboard/dashboard-page.test.tsx --reporter=verbose
```
Expected: PASS all 6 tests.

- [ ] **Step 7: Commit**
```bash
git -C conecta-tcc add frontend/src/pages/my-applications/index.tsx frontend/src/pages/dashboard/index.tsx frontend/src/pages/my-applications/my-applications-page.test.tsx frontend/src/pages/dashboard/dashboard-page.test.tsx
git -C conecta-tcc commit -m "feat: wrap MyApplicationsPage and DashboardPage with ProtectedRoute"
```

---

### Task 3: Router-level integration test with createMemoryHistory

**Files:**
- Create: `frontend/src/router.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/router.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import {
  createRouter,
  createRoute,
  createRootRoute,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

// We build a minimal test router that mirrors the real routes
// but with simpler page content so we can assert on text.

vi.mock('@/hooks/use-auth', async (importOriginal) => {
  // Use the real useAuth — it reads from the real Zustand store
  const actual = await importOriginal<typeof import('@/hooks/use-auth')>()
  return actual
})

const mockStudent: User = {
  id: 2, name: 'Aluno', email: 'aluno@ufmg.br',
  role: 'student', department_id: 1, profile_link: null,
}
const mockProfessor: User = {
  id: 1, name: 'Prof', email: 'prof@ufmg.br',
  role: 'professor', department_id: 1, profile_link: null,
}

// Build a test router that uses the real ProtectedRoute
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })

  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Home Page</div>,
  })

  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entrar',
    component: () => <div>Login Page</div>,
  })

  const myApplicationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/minhas-candidaturas',
    component: () => (
      <ProtectedRoute role="student">
        <div>My Applications Page</div>
      </ProtectedRoute>
    ),
  })

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => (
      <ProtectedRoute role="professor">
        <div>Dashboard Page</div>
      </ProtectedRoute>
    ),
  })

  const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    myApplicationsRoute,
    dashboardRoute,
  ])

  const memoryHistory = createMemoryHistory({ initialEntries: [initialPath] })

  return createRouter({ routeTree, history: memoryHistory })
}

function TestApp({ router }: { router: ReturnType<typeof buildTestRouter> }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('Route protection integration', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('unauthenticated user visiting /minhas-candidaturas is redirected to /entrar', async () => {
    const router = buildTestRouter('/minhas-candidaturas')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('My Applications Page')).not.toBeInTheDocument()
  })

  it('unauthenticated user visiting /dashboard is redirected to /entrar', async () => {
    const router = buildTestRouter('/dashboard')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
  })

  it('student can access /minhas-candidaturas', async () => {
    useAuthStore.setState({ user: mockStudent, token: 'tok', isAuthenticated: true })

    const router = buildTestRouter('/minhas-candidaturas')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('My Applications Page')).toBeInTheDocument()
    })
  })

  it('student accessing /dashboard is redirected to /', async () => {
    useAuthStore.setState({ user: mockStudent, token: 'tok', isAuthenticated: true })

    const router = buildTestRouter('/dashboard')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
  })

  it('professor can access /dashboard', async () => {
    useAuthStore.setState({ user: mockProfessor, token: 'tok', isAuthenticated: true })

    const router = buildTestRouter('/dashboard')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('professor accessing /minhas-candidaturas is redirected to /', async () => {
    useAuthStore.setState({ user: mockProfessor, token: 'tok', isAuthenticated: true })

    const router = buildTestRouter('/minhas-candidaturas')
    render(<TestApp router={router} />)

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('My Applications Page')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/router.test.tsx --reporter=verbose
```
Expected: FAIL — ProtectedRoute not yet wired in router context or import errors.

- [ ] **Step 3: No source changes needed**

With ProtectedRoute implemented in Task 1 and the pages wired in Task 2, the integration tests exercise the full flow via `createMemoryHistory`. No further source changes are required.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/router.test.tsx --reporter=verbose
```
Expected: PASS all 6 tests.

- [ ] **Step 5: Run full suite**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**
```bash
git -C conecta-tcc add frontend/src/router.test.tsx
git -C conecta-tcc commit -m "test: router integration tests with createMemoryHistory for route protection"
```

---

### Task 4: Export index for shared components

**Files:**
- Create: `frontend/src/components/shared/index.ts`

- [ ] **Step 1: Create barrel export**
```ts
// frontend/src/components/shared/index.ts
export { ProtectedRoute } from './ProtectedRoute'
```

- [ ] **Step 2: Verify all tests still pass**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose
```
Expected: all tests PASS.

- [ ] **Step 3: Commit**
```bash
git -C conecta-tcc add frontend/src/components/shared/index.ts
git -C conecta-tcc commit -m "chore: add barrel export for shared components"
```
