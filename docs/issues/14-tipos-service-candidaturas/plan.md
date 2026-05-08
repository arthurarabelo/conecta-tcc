# Applications Service & Hooks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate the existing `applicationsService` and application hooks with MSW-backed unit and integration tests, covering all CRUD paths and error scenarios.

**Architecture:** MSW v2 intercepts HTTP at the network level so tests run against a real `axios` client without a live server. Service tests call `applicationsService.*` directly; hook tests wrap them in a `QueryClientProvider` rendered with React Testing Library. Each file is small and focused: one file per concern (handlers, service tests, hook tests).

**Tech Stack:** Vitest, React Testing Library, MSW v2, `@tanstack/react-query` v5, axios, TypeScript.

---

### Task 1: Install test dependencies and create MSW server

**Files:**
- Modify: `frontend/package.json` (add devDependencies)
- Create: `frontend/src/test/server.ts`
- Create: `frontend/src/test/setup.ts`
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Install Vitest, RTL and MSW**

```bash
cd conecta-tcc/frontend
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event msw@^2 jsdom happy-dom
```

Expected: packages added to `devDependencies` in `package.json`.

- [ ] **Step 2: Add test script to package.json**

Edit `frontend/package.json` — add the following inside `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Configure Vitest in vite.config.ts**

Replace `frontend/vite.config.ts` entirely with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 4: Create the global test setup file**

Create `frontend/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
import { server } from './server'
import { beforeAll, afterEach, afterAll } from 'vitest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 5: Create MSW server with application handlers**

Create `frontend/src/test/server.ts`:

```ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { Application, Proposal, User } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'

// ── Fixtures ─────────────────────────────────────────────────────────────────

export const mockProfessor: User = {
  id: 1,
  name: 'Prof. Ana Lima',
  email: 'ana@uni.edu',
  role: 'professor',
  department_id: 1,
  profile_link: 'https://lattes.cnpq.br/ana',
}

export const mockStudent: User = {
  id: 2,
  name: 'João Silva',
  email: 'joao@student.edu',
  role: 'student',
  department_id: null,
  profile_link: null,
}

export const mockProposal: Proposal = {
  id: 10,
  professor_id: 1,
  title: 'ML em Biomedicina',
  description: 'Uso de machine learning em diagnósticos.',
  prerequisites: null,
  max_slots: 4,
  department_id: 1,
  area_id: 1,
  status: 'open',
  professor: mockProfessor,
  applications_count: 6,
  approved_applications_count: 2,
}

export const mockApplication: Application = {
  id: 100,
  student_id: 2,
  proposal_id: 10,
  status: 'pending',
  feedback: null,
  applied_at: '2025-05-10T09:00:00Z',
  reviewed_at: null,
  student: mockStudent,
  proposal: mockProposal,
}

export const paginatedApplications: PaginatedResponse<Application> = {
  data: [mockApplication],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
    from: 1,
    to: 1,
  },
  links: { first: null, last: null, prev: null, next: null },
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // GET /proposals (default empty list — individual tests override with server.use())
  http.get('http://localhost:8000/proposals', () => {
    return HttpResponse.json({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null },
      links: { first: null, last: null, prev: null, next: null },
    })
  }),

  // DELETE /proposals/:id (default 204 — individual tests override with server.use())
  http.delete('http://localhost:8000/proposals/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /applications
  http.get('http://localhost:8000/applications', () => {
    return HttpResponse.json(paginatedApplications)
  }),

  // GET /applications/:id
  http.get('http://localhost:8000/applications/:id', ({ params }) => {
    const id = Number(params.id)
    if (id !== mockApplication.id) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: mockApplication })
  }),

  // PATCH /applications/:id/approve
  http.patch('http://localhost:8000/applications/:id/approve', ({ params }) => {
    const id = Number(params.id)
    if (id !== mockApplication.id) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const approved: Application = { ...mockApplication, status: 'approved', reviewed_at: '2025-05-11T10:00:00Z' }
    return HttpResponse.json({ data: approved })
  }),

  // PATCH /applications/:id/reject
  http.patch('http://localhost:8000/applications/:id/reject', async ({ params, request }) => {
    const id = Number(params.id)
    if (id !== mockApplication.id) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const body = await request.json() as { feedback?: string }
    const rejected: Application = {
      ...mockApplication,
      status: 'rejected',
      feedback: body.feedback ?? null,
      reviewed_at: '2025-05-11T10:00:00Z',
    }
    return HttpResponse.json({ data: rejected })
  }),
]

export const server = setupServer(...handlers)
```

- [ ] **Step 6: Verify server file compiles**

```bash
cd conecta-tcc/frontend
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd conecta-tcc/frontend
git add src/test/server.ts src/test/setup.ts vite.config.ts package.json
git commit -m "test: add MSW server and Vitest setup for application tests"
```

---

### Task 2: Unit tests for applicationsService

**Files:**
- Create: `frontend/src/services/applications.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/services/applications.service.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { applicationsService } from './applications.service'
import { server, mockApplication, paginatedApplications } from '@/test/server'
import { ForbiddenError } from '@/lib/error'

describe('applicationsService.list', () => {
  it('returns a paginated list of applications', async () => {
    const result = await applicationsService.list()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe(100)
    expect(result.meta.total).toBe(1)
  })

  it('passes status filter as query param', async () => {
    let capturedUrl: string | undefined

    server.use(
      http.get('http://localhost:8000/applications', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json(paginatedApplications)
      }),
    )

    await applicationsService.list({ status: 'pending' })
    expect(capturedUrl).toContain('status=pending')
  })
})

describe('applicationsService.show', () => {
  it('returns a single application by id', async () => {
    const result = await applicationsService.show(100)
    expect(result.id).toBe(100)
    expect(result.status).toBe('pending')
  })
})

describe('applicationsService.approve', () => {
  it('returns the application with status approved', async () => {
    const result = await applicationsService.approve(100)
    expect(result.status).toBe('approved')
    expect(result.reviewed_at).not.toBeNull()
  })

  it('throws ForbiddenError on 403 response', async () => {
    server.use(
      http.patch('http://localhost:8000/applications/:id/approve', () => {
        return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 })
      }),
    )

    await expect(applicationsService.approve(100)).rejects.toBeInstanceOf(ForbiddenError)
  })
})

describe('applicationsService.reject', () => {
  it('returns the application with status rejected and feedback', async () => {
    const result = await applicationsService.reject(100, { feedback: 'Perfil não compatível' })
    expect(result.status).toBe('rejected')
    expect(result.feedback).toBe('Perfil não compatível')
  })

  it('returns the application with status rejected and no feedback when omitted', async () => {
    const result = await applicationsService.reject(100)
    expect(result.status).toBe('rejected')
    expect(result.feedback).toBeNull()
  })

  it('throws ForbiddenError on 403 response', async () => {
    server.use(
      http.patch('http://localhost:8000/applications/:id/reject', () => {
        return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 })
      }),
    )

    await expect(applicationsService.reject(100, { feedback: 'x' })).rejects.toBeInstanceOf(ForbiddenError)
  })
})
```

- [ ] **Step 2: Run tests — expect failure (no test infrastructure yet)**

```bash
cd conecta-tcc/frontend
npm test src/services/applications.service.test.ts
```

Expected: FAIL — module resolution errors because MSW/Vitest not yet fully configured (Task 1 must be done first). If Task 1 is complete, tests may fail with network errors because the `apiClient` base URL points to `localhost:8000` and MSW intercepts at that level.

- [ ] **Step 3: Verify the apiClient base URL matches the MSW handler URL**

The `apiClient` uses `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'`. In tests, `import.meta.env.VITE_API_BASE_URL` is undefined, so it defaults to `http://localhost:8000`. The MSW handlers in `server.ts` also use `http://localhost:8000/*`. No changes needed — they match.

Confirm by reading `frontend/src/constants/api.ts`:
```
API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd conecta-tcc/frontend
npm test src/services/applications.service.test.ts
```

Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
cd conecta-tcc/frontend
git add src/services/applications.service.test.ts
git commit -m "test: add unit tests for applicationsService (list, approve, reject, 403 handling)"
```

---

### Task 3: Integration tests for useApproveApplication and useRejectApplication hooks

**Files:**
- Create: `frontend/src/features/applications/hooks/index.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/features/applications/hooks/index.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { useApplications, useApproveApplication, useRejectApplication } from './index'
import { server, mockApplication, paginatedApplications } from '@/test/server'
import { QUERY_KEYS } from '@/constants/query-keys'
import { ForbiddenError } from '@/lib/error'

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return {
    qc,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  }
}

describe('useApplications', () => {
  it('fetches and returns paginated applications', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplications(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].id).toBe(100)
  })

  it('passes status filter to the service', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.get('http://localhost:8000/applications', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json(paginatedApplications)
      }),
    )

    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplications({ status: 'pending' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedUrl).toContain('status=pending')
  })
})

describe('useApproveApplication', () => {
  it('invalidates QUERY_KEYS.applications.all on success', async () => {
    const { qc, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')

    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(100)
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: QUERY_KEYS.applications.all }),
    )
  })

  it('invalidates QUERY_KEYS.proposals.all on success', async () => {
    const { qc, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')

    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(100)
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: QUERY_KEYS.proposals.all }),
    )
  })

  it('updates the detail cache entry on success', async () => {
    const { qc, wrapper } = makeWrapper()

    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(100)
    })

    const cached = qc.getQueryData(QUERY_KEYS.applications.detail(100)) as typeof mockApplication
    expect(cached?.status).toBe('approved')
  })

  it('throws ForbiddenError when API returns 403', async () => {
    server.use(
      http.patch('http://localhost:8000/applications/:id/approve', () => {
        return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 })
      }),
    )

    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApproveApplication(), { wrapper })

    await expect(
      act(async () => {
        await result.current.mutateAsync(100)
      }),
    ).rejects.toBeInstanceOf(ForbiddenError)
  })
})

describe('useRejectApplication', () => {
  it('calls reject with the correct id and payload', async () => {
    let capturedBody: unknown
    server.use(
      http.patch('http://localhost:8000/applications/:id/reject', async ({ request }) => {
        capturedBody = await request.json()
        const rejected = { ...mockApplication, status: 'rejected' as const, feedback: (capturedBody as { feedback: string }).feedback }
        return HttpResponse.json({ data: rejected })
      }),
    )

    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 100, payload: { feedback: 'Fora do escopo' } })
    })

    expect(capturedBody).toEqual({ feedback: 'Fora do escopo' })
  })

  it('invalidates QUERY_KEYS.applications.all on success', async () => {
    const { qc, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')

    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 100, payload: { feedback: 'x' } })
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: QUERY_KEYS.applications.all }),
    )
  })

  it('throws ForbiddenError when API returns 403', async () => {
    server.use(
      http.patch('http://localhost:8000/applications/:id/reject', () => {
        return HttpResponse.json({ message: 'Acesso negado' }, { status: 403 })
      }),
    )

    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useRejectApplication(), { wrapper })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ id: 100, payload: { feedback: 'x' } })
      }),
    ).rejects.toBeInstanceOf(ForbiddenError)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
cd conecta-tcc/frontend
npm test src/features/applications/hooks/index.test.tsx
```

Expected: FAIL — either missing MSW setup (if Task 1 incomplete) or real network calls failing.

- [ ] **Step 3: Run tests — expect pass (after Task 1 is complete)**

```bash
cd conecta-tcc/frontend
npm test src/features/applications/hooks/index.test.tsx
```

Expected: PASS — all 9 tests green.

- [ ] **Step 4: Run all tests together**

```bash
cd conecta-tcc/frontend
npm test
```

Expected: PASS — all tests from Tasks 2 and 3 green.

- [ ] **Step 5: Commit**

```bash
cd conecta-tcc/frontend
git add src/features/applications/hooks/index.test.tsx
git commit -m "test: add integration tests for useApproveApplication and useRejectApplication hooks"
```

---

### Task 4: Verify ApplicationStatus covers all three states

**Files:**
- Create: `frontend/src/types/models.test.ts`

- [ ] **Step 1: Write the test**

Create `frontend/src/types/models.test.ts`:

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { ApplicationStatus, Application } from './models'

describe('ApplicationStatus type', () => {
  it('accepts pending', () => {
    const s: ApplicationStatus = 'pending'
    expect(s).toBe('pending')
  })

  it('accepts approved', () => {
    const s: ApplicationStatus = 'approved'
    expect(s).toBe('approved')
  })

  it('accepts rejected', () => {
    const s: ApplicationStatus = 'rejected'
    expect(s).toBe('rejected')
  })

  it('Application.status is of type ApplicationStatus', () => {
    expectTypeOf<Application['status']>().toMatchTypeOf<ApplicationStatus>()
  })
})
```

- [ ] **Step 2: Run test — expect pass (the types already exist)**

```bash
cd conecta-tcc/frontend
npm test src/types/models.test.ts
```

Expected: PASS — 4 tests green.

- [ ] **Step 3: Commit**

```bash
cd conecta-tcc/frontend
git add src/types/models.test.ts
git commit -m "test: verify ApplicationStatus covers pending, approved, rejected"
```
