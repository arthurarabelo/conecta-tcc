# Proposals Service & Hooks Testing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate the already-implemented proposals service, Zod schema, and React Query hooks through comprehensive unit and integration tests using MSW for API mocking.

**Architecture:** MSW v2 intercepts HTTP calls in the Node test environment. Service tests call `proposalsService.*` functions directly against the MSW server. Hook tests wrap hooks in `QueryClientProvider` using `renderHook` from React Testing Library. Schema tests are pure Zod validation with no HTTP involved.

**Tech Stack:** Vitest, React Testing Library (`renderHook`, `act`), MSW v2 (node server), TanStack Query v5, Zod, Axios

**Prerequisites:** Issue #08 Vitest setup must exist (`frontend/vitest.config.ts`, `frontend/src/test/setup.ts`). Issue #09 MSW server may already exist at `frontend/src/test/server.ts` — extend it rather than replace it.

---

### Task 1: Ensure MSW and test infrastructure are installed

**Files:**
- Create or modify: `frontend/src/test/server.ts`
- Create or modify: `frontend/src/test/setup.ts`
- Create: `frontend/src/test/handlers/proposals.ts`

> If issues #08 and #09 have already been implemented, the MSW setup already exists. In that case, **skip Steps 1–3** and go straight to Step 4 to verify the server runs correctly.

- [ ] **Step 1: Install dependencies (skip if already done in issue #08 or #09)**

```bash
cd frontend && bun add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

- [ ] **Step 2: Create vitest.config.ts (skip if it already exists)**

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

- [ ] **Step 3: Create test setup file (skip if it already exists)**

```ts
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 4: Create (or overwrite) the proposal MSW handlers**

If `frontend/src/test/handlers/proposals.ts` already exists from issue #09, **replace its content** with the more complete version below that covers all proposal endpoints:

```ts
// frontend/src/test/handlers/proposals.ts
import { http, HttpResponse } from 'msw'

export const MOCK_PROPOSALS = [
  {
    id: 1,
    professor_id: 10,
    title: 'Redes Neurais para Reconhecimento de Imagens',
    description: 'Estudo aprofundado de arquiteturas de redes neurais convolucionais aplicadas ao reconhecimento de padrões visuais em conjuntos de dados médicos.',
    prerequisites: 'Python, álgebra linear',
    max_slots: 2,
    department_id: 1,
    area_id: 1,
    status: 'open',
    professor: {
      id: 10,
      name: 'Prof. Carlos Lima',
      email: 'carlos@univ.br',
      role: 'professor',
      department_id: 1,
      profile_link: null,
    },
    department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
    applications_count: 0,
    approved_applications_count: 0,
  },
  {
    id: 2,
    professor_id: 11,
    title: 'Blockchain para Certificação Acadêmica',
    description: 'Desenvolvimento de um sistema descentralizado baseado em blockchain para emissão e verificação de certificados acadêmicos.',
    prerequisites: null,
    max_slots: 1,
    department_id: 2,
    area_id: 2,
    status: 'open',
    professor: {
      id: 11,
      name: 'Prof. Maria Oliveira',
      email: 'maria@univ.br',
      role: 'professor',
      department_id: 2,
      profile_link: null,
    },
    department: { id: 2, name: 'Sistemas de Informação', code: 'SI' },
    area: { id: 2, name: 'Sistemas Distribuídos', code: 'SD' },
    applications_count: 1,
    approved_applications_count: 0,
  },
]

export const MOCK_CLOSED_PROPOSAL = {
  id: 5,
  professor_id: 10,
  title: 'Proposta Fechada de Teste',
  description: 'Uma proposta fechada para cenários de teste.',
  prerequisites: null,
  max_slots: 1,
  department_id: 1,
  area_id: 1,
  status: 'closed',
  applications_count: 1,
  approved_applications_count: 1,
}

export const proposalHandlers = [
  // GET /proposals — paginated list, supports ?status= filter
  http.get('http://localhost:8000/proposals', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const filtered = status
      ? MOCK_PROPOSALS.filter((p) => p.status === status)
      : MOCK_PROPOSALS

    return HttpResponse.json({
      data: filtered,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: filtered.length,
        from: filtered.length > 0 ? 1 : null,
        to: filtered.length > 0 ? filtered.length : null,
      },
      links: {
        first: 'http://localhost:8000/proposals?page=1',
        last: 'http://localhost:8000/proposals?page=1',
        prev: null,
        next: null,
      },
    })
  }),

  // GET /proposals/:id
  http.get('http://localhost:8000/proposals/:id', ({ params }) => {
    const id = Number(params.id)
    const proposal = MOCK_PROPOSALS.find((p) => p.id === id)

    if (!proposal) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: proposal })
  }),

  // POST /proposals
  http.post('http://localhost:8000/proposals', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const created = {
      id: 99,
      professor_id: 10,
      ...body,
      status: 'open',
      applications_count: 0,
      approved_applications_count: 0,
    }
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  // PATCH /proposals/:id
  http.patch('http://localhost:8000/proposals/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const body = await request.json() as Record<string, unknown>
    const proposal = MOCK_PROPOSALS.find((p) => p.id === id)

    if (!proposal) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: { ...proposal, ...body } })
  }),

  // DELETE /proposals/:id
  http.delete('http://localhost:8000/proposals/:id', ({ params }) => {
    const id = Number(params.id)
    const exists = MOCK_PROPOSALS.some((p) => p.id === id)

    if (!exists) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // POST /proposals/:id/apply
  http.post('http://localhost:8000/proposals/:id/apply', ({ params }) => {
    const proposalId = Number(params.id)

    if (proposalId === MOCK_CLOSED_PROPOSAL.id) {
      return HttpResponse.json(
        { message: 'Esta proposta está fechada' },
        { status: 422 },
      )
    }

    return HttpResponse.json({
      data: {
        id: 200,
        student_id: 50,
        proposal_id: proposalId,
        status: 'pending',
        feedback: null,
        applied_at: '2025-05-08T00:00:00.000Z',
        reviewed_at: null,
      },
    })
  }),
]
```

- [ ] **Step 5: Create (or update) the MSW server entry**

```ts
// frontend/src/test/server.ts
import { setupServer } from 'msw/node'
import { proposalHandlers } from './handlers/proposals'

export const server = setupServer(...proposalHandlers)
```

- [ ] **Step 6: Verify test setup works**

```bash
cd frontend && bunx vitest run 2>&1 | tail -10
```
Expected: existing tests pass, no import errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/test/
git commit -m "test: set up comprehensive MSW handlers for proposals endpoints"
```

---

### Task 2: proposalSchema unit tests

**Files:**
- Create: `frontend/src/features/proposals/schemas/proposalSchema.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// frontend/src/features/proposals/schemas/proposalSchema.test.ts
import { describe, expect, it } from 'vitest'
import { proposalSchema } from '.'

const validPayload = {
  title: 'Análise de Sentimentos com PLN',
  description: 'Neste trabalho o aluno irá explorar técnicas de Processamento de Linguagem Natural.',
  prerequisites: 'Python básico',
  max_slots: 2,
  department_id: 1,
  area_id: 3,
}

describe('proposalSchema', () => {
  it('accepts a valid proposal payload', () => {
    const result = proposalSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('accepts payload without prerequisites (optional)', () => {
    const { prerequisites: _p, ...withoutPre } = validPayload
    const result = proposalSchema.safeParse(withoutPre)
    expect(result.success).toBe(true)
  })

  it('rejects title shorter than 5 characters', () => {
    const result = proposalSchema.safeParse({ ...validPayload, title: 'abc' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
    }
  })

  it('rejects description shorter than 20 characters', () => {
    const result = proposalSchema.safeParse({ ...validPayload, description: 'Curto demais' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toBeDefined()
    }
  })

  it('rejects max_slots = 0', () => {
    const result = proposalSchema.safeParse({ ...validPayload, max_slots: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.max_slots).toBeDefined()
    }
  })

  it('rejects negative max_slots', () => {
    const result = proposalSchema.safeParse({ ...validPayload, max_slots: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.max_slots).toBeDefined()
    }
  })

  it('rejects non-integer max_slots via coercion (float string)', () => {
    // "1.5" coerces to 1.5 which is not an integer
    const result = proposalSchema.safeParse({ ...validPayload, max_slots: 1.5 })
    expect(result.success).toBe(false)
  })

  it('coerces string max_slots to number', () => {
    const result = proposalSchema.safeParse({ ...validPayload, max_slots: '3' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_slots).toBe(3)
    }
  })

  it('rejects missing department_id', () => {
    const { department_id: _d, ...withoutDept } = validPayload
    const result = proposalSchema.safeParse(withoutDept)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.department_id).toBeDefined()
    }
  })

  it('rejects department_id = 0 (not positive)', () => {
    const result = proposalSchema.safeParse({ ...validPayload, department_id: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects missing area_id', () => {
    const { area_id: _a, ...withoutArea } = validPayload
    const result = proposalSchema.safeParse(withoutArea)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.area_id).toBeDefined()
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they pass (schema already exists)**

```bash
cd frontend && bunx vitest run src/features/proposals/schemas/proposalSchema.test.ts
```
Expected: PASS — 11 tests pass

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/proposals/schemas/proposalSchema.test.ts
git commit -m "test: add unit tests for proposalSchema Zod validation"
```

---

### Task 3: proposalsService integration tests

**Files:**
- Create: `frontend/src/services/proposals.service.test.ts`

These tests call the actual service functions. MSW intercepts the Axios HTTP calls. The `apiClient` uses `baseURL: 'http://localhost:8000'`, so MSW handlers must use that same origin.

- [ ] **Step 1: Write the failing tests**

```ts
// frontend/src/services/proposals.service.test.ts
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { proposalsService } from './proposals.service'

describe('proposalsService', () => {
  describe('list', () => {
    it('returns paginated proposals with data and meta', async () => {
      const result = await proposalsService.list()
      expect(result.data).toHaveLength(2)
      expect(result.meta).toBeDefined()
      expect(result.meta.current_page).toBe(1)
    })

    it('filters proposals by status=open', async () => {
      const result = await proposalsService.list({ status: 'open' })
      expect(result.data.every((p) => p.status === 'open')).toBe(true)
    })

    it('filters proposals by status=closed and returns empty', async () => {
      const result = await proposalsService.list({ status: 'closed' })
      // MOCK_PROPOSALS are all open, so closed list should be empty
      expect(result.data).toHaveLength(0)
    })

    it('includes filters in query params', async () => {
      let capturedUrl: string | null = null
      server.use(
        http.get('http://localhost:8000/proposals', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { current_page: 2, last_page: 3, per_page: 15, total: 30, from: 16, to: 30 },
            links: { first: null, last: null, prev: null, next: null },
          })
        }),
      )
      await proposalsService.list({ page: 2, area_id: 5 })
      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('area_id=5')
    })
  })

  describe('show', () => {
    it('returns a single proposal by id', async () => {
      const proposal = await proposalsService.show(1)
      expect(proposal.id).toBe(1)
      expect(proposal.title).toBe('Redes Neurais para Reconhecimento de Imagens')
    })

    it('throws for a non-existent id', async () => {
      await expect(proposalsService.show(9999)).rejects.toMatchObject({
        status: 404,
      })
    })
  })

  describe('create', () => {
    it('creates a proposal and returns the new resource', async () => {
      const payload = {
        title: 'Nova Proposta de TCC',
        description: 'Descrição detalhada da nova proposta de TCC para fins de teste.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      }
      const created = await proposalsService.create(payload)
      expect(created.id).toBe(99)
      expect(created.title).toBe(payload.title)
    })
  })

  describe('update', () => {
    it('patches a proposal and returns the updated resource', async () => {
      const updated = await proposalsService.update(1, { max_slots: 5 })
      expect(updated.id).toBe(1)
      expect(updated.max_slots).toBe(5)
    })

    it('throws for a non-existent proposal', async () => {
      await expect(proposalsService.update(9999, { title: 'X' })).rejects.toMatchObject({
        status: 404,
      })
    })
  })

  describe('remove', () => {
    it('deletes a proposal without throwing', async () => {
      await expect(proposalsService.remove(1)).resolves.toBeUndefined()
    })

    it('throws for a non-existent proposal', async () => {
      await expect(proposalsService.remove(9999)).rejects.toMatchObject({
        status: 404,
      })
    })
  })

  describe('apply', () => {
    it('creates an application and returns it', async () => {
      const application = await proposalsService.apply(1)
      expect(application.id).toBe(200)
      expect(application.proposal_id).toBe(1)
      expect(application.status).toBe('pending')
    })

    it('throws with 422 when proposal is closed (id=5)', async () => {
      await expect(proposalsService.apply(5)).rejects.toMatchObject({
        status: 422,
      })
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail (before any changes — service already exists)**

```bash
cd frontend && bunx vitest run src/services/proposals.service.test.ts
```
Expected: PASS if MSW is set up correctly. If failing, check that `apiClient` baseURL matches `http://localhost:8000`.

- [ ] **Step 3: If any test fails due to baseURL mismatch — check api-client config**

Open `frontend/src/services/api-client.ts`. The `API_BASE_URL` defaults to `http://localhost:8000`. In the test environment, `import.meta.env.VITE_API_BASE_URL` will be undefined, so it defaults to `http://localhost:8000` — matching the MSW handlers. If the import.meta.env default does not resolve correctly in Vitest, add to `vitest.config.ts`:

```ts
// add inside defineConfig({ test: { ... } })
env: {
  VITE_API_BASE_URL: 'http://localhost:8000',
},
```

Then re-run:
```bash
cd frontend && bunx vitest run src/services/proposals.service.test.ts
```
Expected: PASS — 10 tests pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services/proposals.service.test.ts
git commit -m "test: add integration tests for proposalsService using MSW"
```

---

### Task 4: proposals hooks integration tests

**Files:**
- Create: `frontend/src/features/proposals/hooks/proposals.hooks.test.tsx`

Hooks that use TanStack Query require a `QueryClient` wrapper. We use `renderHook` from `@testing-library/react` and pass a `wrapper` that provides `QueryClientProvider`. Each test gets a fresh `QueryClient` with `retry: false` to prevent retries masking real errors.

- [ ] **Step 1: Write the failing tests**

```tsx
// frontend/src/features/proposals/hooks/proposals.hooks.test.tsx
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import {
  useProposals,
  useProposal,
  useCreateProposal,
  useDeleteProposal,
  useApplyToProposal,
} from '.'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return { wrapper: Wrapper, queryClient }
}

describe('useProposals', () => {
  it('returns paginated proposal list with data and meta', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data).toHaveLength(2)
    expect(result.current.data?.meta).toBeDefined()
    expect(result.current.data?.meta.total).toBe(2)
  })

  it('passes filters to the API and returns filtered results', async () => {
    // All mock proposals are open, so filtering by 'open' returns all 2
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals({ status: 'open' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data.every((p) => p.status === 'open')).toBe(true)
  })

  it('starts in loading state', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposals(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useProposal', () => {
  it('returns a single proposal by id', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe(1)
    expect(result.current.data?.title).toBe('Redes Neurais para Reconhecimento de Imagens')
  })

  it('is disabled when id is 0', () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(0), { wrapper })
    // enabled: false means fetchStatus is 'idle' and data is undefined
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('enters error state for a non-existent id', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useProposal(9999), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateProposal', () => {
  it('creates a proposal and resolves with the new resource', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Proposta via Hook',
        description: 'Descrição da proposta criada através do hook useCreateProposal no teste.',
        max_slots: 1,
        department_id: 1,
        area_id: 1,
      })
    })

    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data?.id).toBe(99)
  })

  it('invalidates the proposals cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Proposta Invalidação',
        description: 'Verificar se o cache de propostas é invalidado após criação bem-sucedida.',
        max_slots: 2,
        department_id: 1,
        area_id: 1,
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['proposals'] }),
    )
  })
})

describe('useDeleteProposal', () => {
  it('deletes a proposal without error', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(result.current.isSuccess).toBe(true)
  })

  it('invalidates proposals cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(2)
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['proposals'] }),
    )
  })
})

describe('useApplyToProposal', () => {
  it('creates an application for an open proposal', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data?.status).toBe('pending')
  })

  it('invalidates applications cache on success', async () => {
    const { wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['applications'] }),
    )
  })

  it('enters error state when proposal is closed (id=5)', async () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useApplyToProposal(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync(5)
      } catch {
        // expected to throw
      }
    })

    expect(result.current.isError).toBe(true)
    expect((result.current.error as { status: number })?.status).toBe(422)
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd frontend && bunx vitest run src/features/proposals/hooks/proposals.hooks.test.tsx
```
Expected: PASS — all tests pass

If the `vi` global is not available (error: "vi is not defined"), add `globals: true` to `vitest.config.ts` test options (it should already be there from Task 1).

- [ ] **Step 3: Run the full test suite to ensure nothing regressed**

```bash
cd frontend && bunx vitest run
```
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/proposals/hooks/proposals.hooks.test.tsx
git commit -m "test: add integration tests for proposal hooks with cache invalidation checks"
```

---

### Task 5: Verify TypeScript types and run final checks

**Files:**
- No new files — verification only

- [ ] **Step 1: TypeScript compile check**

```bash
cd frontend && bunx tsc --noEmit
```
Expected: no errors

- [ ] **Step 2: Run complete test suite with coverage**

```bash
cd frontend && bunx vitest run --coverage 2>&1 | tail -30
```
Expected: all tests pass, coverage report generated

- [ ] **Step 3: Final commit if any minor fixes were required**

```bash
git add -p
git commit -m "test: fix type issues found during final verification"
```
(Only commit if changes were actually needed during Steps 1–2)
