# Proposals Wall Page (Mural de Propostas) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub `src/pages/proposals/index.tsx` with a fully functional, paginated proposals wall that syncs filters to the URL.

**Architecture:** A `ProposalFilters` component owns the filter UI (search, area, department, open-only) and emits changes upward via `onChange`. `ProposalsPage` holds filter state, syncs it to TanStack Router search params, feeds it to `useProposals()`, and renders a responsive grid of `ProposalCard` components with skeleton placeholders while loading and a pagination bar using `meta`.

**Tech Stack:** React 19, TanStack Router v1 (useSearch / useNavigate), TanStack Query v5, Shadcn/ui (Input, Select, Checkbox, Label, Card, Skeleton, Button), Vitest + React Testing Library + MSW v2.

---

### Task 1: Install MSW and set up test infrastructure

> MSW is not yet in package.json. This task adds it and configures the service worker + server for tests.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/server.ts`
- Create: `frontend/src/test/setup.ts` (may already exist from issue #01 — extend if so)

- [ ] **Step 1: Install MSW and testing deps**

```bash
cd conecta-tcc/frontend && npm install --save-dev msw @testing-library/jest-dom @testing-library/react @testing-library/user-event vitest jsdom
```

Expected: all packages appear in `devDependencies` in `package.json`.

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` section of `frontend/package.json`, add (merge with any existing entries):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Update `frontend/vite.config.ts` to include Vitest config**

Replace the entire file with:

```typescript
/// <reference types="vitest" />
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
    css: false,
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

- [ ] **Step 4: Create `frontend/src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 5: Create `frontend/src/test/server.ts`**

```typescript
import { setupServer } from 'msw/node'

export const server = setupServer()
```

- [ ] **Step 6: Update `tsconfig.json` to recognise jest-dom types**

Ensure `compilerOptions` in `frontend/tsconfig.json` contains:

```json
"types": ["@testing-library/jest-dom"],
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 7: Commit**

```bash
cd conecta-tcc/frontend && git add package.json vite.config.ts src/test/setup.ts src/test/server.ts tsconfig.json && git commit -m "chore: add vitest + MSW test infrastructure"
```

---

### Task 2: ProposalFilters component

**Files:**
- Create: `frontend/src/features/proposals/components/ProposalFilters.tsx`
- Create: `frontend/src/features/proposals/components/ProposalFilters.test.tsx`

The component receives the current filter values and emits the full updated filter object via `onChange` whenever anything changes. Text search is client-side only (not sent to the API) so it is tracked as a separate prop `search` / `onSearchChange`.

- [ ] **Step 1: Write the failing test**

```tsx
// frontend/src/features/proposals/components/ProposalFilters.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProposalFilters } from './ProposalFilters'
import type { ProposalFiltersValue } from './ProposalFilters'

const defaultFilters: ProposalFiltersValue = {
  area_id: undefined,
  department_id: undefined,
  status: undefined,
}

describe('ProposalFilters', () => {
  it('renders search input and all selects', () => {
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Buscar por título...')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /área/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /departamento/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /só abertas/i })).toBeInTheDocument()
  })

  it('calls onSearchChange when user types in the search box', async () => {
    const onSearchChange = vi.fn()
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={vi.fn()}
        search=""
        onSearchChange={onSearchChange}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText('Buscar por título...'), 'ia')
    expect(onSearchChange).toHaveBeenCalledWith('i')
    expect(onSearchChange).toHaveBeenCalledWith('ia')
  })

  it('calls onChange with status=open when "Só abertas" is checked', async () => {
    const onChange = vi.fn()
    render(
      <ProposalFilters
        filters={defaultFilters}
        onChange={onChange}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /só abertas/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, status: 'open' })
  })

  it('calls onChange with status=undefined when "Só abertas" is unchecked', async () => {
    const onChange = vi.fn()
    render(
      <ProposalFilters
        filters={{ ...defaultFilters, status: 'open' }}
        onChange={onChange}
        search=""
        onSearchChange={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /só abertas/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, status: undefined })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
cd conecta-tcc/frontend && npm test src/features/proposals/components/ProposalFilters.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `ProposalFilters.tsx`**

```tsx
// frontend/src/features/proposals/components/ProposalFilters.tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export interface ProposalFiltersValue {
  area_id?: number
  department_id?: number
  status?: 'open' | 'closed'
}

interface ProposalFiltersProps {
  filters: ProposalFiltersValue
  onChange: (filters: ProposalFiltersValue) => void
  search: string
  onSearchChange: (value: string) => void
}

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

export function ProposalFilters({
  filters,
  onChange,
  search,
  onSearchChange,
}: ProposalFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1.5 flex-1 min-w-48">
        <Label htmlFor="search">Busca</Label>
        <Input
          id="search"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-40">
        <Label htmlFor="area-select">Área</Label>
        <Select
          value={filters.area_id?.toString() ?? ''}
          onValueChange={(val) =>
            onChange({ ...filters, area_id: val ? Number(val) : undefined })
          }
        >
          <SelectTrigger id="area-select" aria-label="Área">
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-40">
        <Label htmlFor="dept-select">Departamento</Label>
        <Select
          value={filters.department_id?.toString() ?? ''}
          onValueChange={(val) =>
            onChange({ ...filters, department_id: val ? Number(val) : undefined })
          }
        >
          <SelectTrigger id="dept-select" aria-label="Departamento">
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <Checkbox
          id="only-open"
          checked={filters.status === 'open'}
          onCheckedChange={(checked) =>
            onChange({ ...filters, status: checked ? 'open' : undefined })
          }
        />
        <Label htmlFor="only-open">Só abertas</Label>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

```bash
cd conecta-tcc/frontend && npm test src/features/proposals/components/ProposalFilters.test.tsx
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
cd conecta-tcc/frontend && git add src/features/proposals/components/ProposalFilters.tsx src/features/proposals/components/ProposalFilters.test.tsx && git commit -m "feat: add ProposalFilters component with area, department and status filters"
```

---

### Task 3: ProposalsPage with skeleton, grid, empty state and pagination

**Files:**
- Modify: `frontend/src/pages/proposals/index.tsx`
- Create: `frontend/src/pages/proposals/ProposalsPage.test.tsx`
- Modify: `frontend/src/test/server.ts` (add handlers export helper)

The page renders:
1. Skeleton grid (6 cards) while `isLoading`
2. `ProposalCard` grid (3-col desktop / 1-col mobile) when data arrives
3. "Nenhuma proposta encontrada" when filtered result is empty
4. Pagination bar: "Anterior" / "Próximo" buttons disabled at bounds

URL search params (`area_id`, `department_id`, `status`, `page`, `search`) are read on mount and written on every filter change via TanStack Router's `useSearch` / `useNavigate`.

**Assumptions about issue #08 components:**
- `src/components/shared/ProposalCard/index.tsx` exports `ProposalCard` as default, accepts `proposal: Proposal` prop.
- `src/components/shared/SiteHeader/index.tsx` exports `SiteHeader` as default.

These must exist before this page can be fully rendered. The tests below mock the network only — they do not rely on the real ProposalCard implementation (shallow enough that RTL renders it).

- [ ] **Step 1: Add MSW handler helpers to test server**

Append to `frontend/src/test/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { PaginatedResponse } from '@/types/api'
import type { Proposal } from '@/types/models'

export const server = setupServer()

export function mockProposalsList(
  proposals: Proposal[],
  meta: PaginatedResponse<Proposal>['meta'] = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: proposals.length,
    from: proposals.length ? 1 : null,
    to: proposals.length ? proposals.length : null,
  },
) {
  server.use(
    http.get('http://localhost:8000/proposals', () =>
      HttpResponse.json({ data: proposals, meta, links: { first: null, last: null, prev: null, next: null } }),
    ),
  )
}
```

- [ ] **Step 2: Write the failing tests**

```tsx
// frontend/src/pages/proposals/ProposalsPage.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import ProposalsPage from './index'
import { mockProposalsList } from '@/test/server'
import type { Proposal } from '@/types/models'

function buildProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 1,
    professor_id: 10,
    title: 'IA na saúde',
    description: 'Descrição detalhada da proposta de IA',
    prerequisites: null,
    max_slots: 3,
    department_id: 1,
    area_id: 1,
    status: 'open',
    applications_count: 0,
    approved_applications_count: 0,
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

  return render(
    <QueryClientProvider client={qc}>
      <router.Provider />
    </QueryClientProvider>,
  )
}

describe('ProposalsPage', () => {
  describe('loading state', () => {
    it('renders 6 skeleton cards while data is loading', () => {
      // Don't set up a handler so the request stays pending
      renderPage()
      const skeletons = screen.getAllByTestId('proposal-card-skeleton')
      expect(skeletons).toHaveLength(6)
    })
  })

  describe('loaded state', () => {
    beforeEach(() => {
      mockProposalsList([buildProposal({ id: 1, title: 'IA na saúde' }), buildProposal({ id: 2, title: 'Redes neurais' })])
    })

    it('renders proposal cards when data loads', async () => {
      renderPage()
      await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())
      expect(screen.getByText('Redes neurais')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    beforeEach(() => {
      mockProposalsList([])
    })

    it('shows empty message when no proposals match', async () => {
      renderPage()
      await waitFor(() =>
        expect(screen.getByText('Nenhuma proposta encontrada.')).toBeInTheDocument(),
      )
    })
  })

  describe('client-side text filter', () => {
    beforeEach(() => {
      mockProposalsList([
        buildProposal({ id: 1, title: 'IA na saúde' }),
        buildProposal({ id: 2, title: 'Compiladores avançados' }),
      ])
    })

    it('hides cards that do not match the search text', async () => {
      renderPage()
      await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())

      const searchInput = screen.getByPlaceholderText('Buscar por título...')
      await userEvent.type(searchInput, 'Comp')

      expect(screen.queryByText('IA na saúde')).not.toBeInTheDocument()
      expect(screen.getByText('Compiladores avançados')).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    it('hides Anterior button on first page', async () => {
      mockProposalsList(
        [buildProposal()],
        { current_page: 1, last_page: 3, per_page: 15, total: 45, from: 1, to: 15 },
      )
      renderPage()
      await waitFor(() => expect(screen.getByText('IA na saúde')).toBeInTheDocument())

      expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /próximo/i })).not.toBeDisabled()
    })

    it('hides Próximo button on last page', async () => {
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
})
```

- [ ] **Step 3: Run to verify failure**

```bash
cd conecta-tcc/frontend && npm test src/pages/proposals/ProposalsPage.test.tsx
```

Expected: FAIL — `ProposalsPage` renders stub content, skeleton data-testid not found.

- [ ] **Step 4: Implement `src/pages/proposals/index.tsx`**

```tsx
// frontend/src/pages/proposals/index.tsx
import { useMemo, useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import ProposalCard from '@/components/shared/ProposalCard'
import { SiteHeader } from '@/components/shared/SiteHeader'
import { ProposalFilters } from '@/features/proposals/components/ProposalFilters'
import { useProposals } from '@/features/proposals/hooks'
import type { ProposalFiltersValue } from '@/features/proposals/components/ProposalFilters'

export default function ProposalsPage() {
  const search = useSearch({ from: '/propostas' })
  const navigate = useNavigate({ from: '/propostas' })

  // Separate API filters (sent to backend) from text search (client-side)
  const [apiFilters, setApiFilters] = useState<ProposalFiltersValue & { page?: number }>({
    area_id: search.area_id,
    department_id: search.department_id,
    status: search.status,
    page: search.page,
  })
  const [searchText, setSearchText] = useState<string>(search.search ?? '')

  const { data, isLoading } = useProposals(apiFilters)

  const filteredProposals = useMemo(() => {
    if (!data?.data) return []
    const lower = searchText.toLowerCase()
    if (!lower) return data.data
    return data.data.filter((p) => p.title.toLowerCase().includes(lower))
  }, [data, searchText])

  function handleFiltersChange(newFilters: ProposalFiltersValue) {
    const updated = { ...newFilters, page: 1 }
    setApiFilters(updated)
    navigate({
      search: {
        ...updated,
        search: searchText || undefined,
      },
    })
  }

  function handleSearchChange(value: string) {
    setSearchText(value)
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
    })
  }

  function goToPage(page: number) {
    const updated = { ...apiFilters, page }
    setApiFilters(updated)
    navigate({ search: (prev) => ({ ...prev, page }) })
  }

  const meta = data?.meta
  const currentPage = meta?.current_page ?? 1
  const lastPage = meta?.last_page ?? 1

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mural de Propostas</h1>

        <div className="mb-6">
          <ProposalFilters
            filters={apiFilters}
            onChange={handleFiltersChange}
            search={searchText}
            onSearchChange={handleSearchChange}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} data-testid="proposal-card-skeleton" className="rounded-lg border p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">Nenhuma proposta encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}

        {!isLoading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {lastPage}
            </span>
            <Button
              variant="outline"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= lastPage}
            >
              Próximo
            </Button>
          </div>
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 5: Add `validateSearch` to the proposals route in `router.tsx`**

Open `frontend/src/router.tsx`. Replace the `proposalsRoute` definition with:

```tsx
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
```

- [ ] **Step 6: Run to verify pass**

```bash
cd conecta-tcc/frontend && npm test src/pages/proposals/ProposalsPage.test.tsx
```

Expected: PASS — 6 tests.

- [ ] **Step 7: Commit**

```bash
cd conecta-tcc/frontend && git add src/pages/proposals/index.tsx src/pages/proposals/ProposalsPage.test.tsx src/test/server.ts src/router.tsx && git commit -m "feat: implement ProposalsPage with filters, skeleton, empty state and pagination"
```
