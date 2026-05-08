# Home Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `src/pages/home/index.tsx` stub with a fully implemented landing page containing Hero, Como Funciona, Propostas em Destaque, and Footer sections.

**Architecture:** Single page component (`src/pages/home/index.tsx`) broken into four inline sections. `useProposals({ status: 'open', page: 1 })` fetches live data; the first 3 results are shown with `<ProposalCard>`. While loading, 3 `<Skeleton>` cards replace the real cards. The `SiteHeader` is provided by the root layout (issue #08) so it does not need to be added here. Tests use Vitest + React Testing Library; MSW is used to mock the API.

**Tech Stack:** React 19, TanStack Query v5, TanStack Router v1, Shadcn/ui (Skeleton, Card, Button), lucide-react (BookOpen, Search, CheckCircle), MSW v2, Vitest, React Testing Library

**Prerequisites:** Issue #08 (components/shared) must be completed first — `ProposalCard` and the Vitest setup are required.

---

### Task 1: Install MSW for API mocking in tests

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/test/server.ts`
- Create: `frontend/src/test/handlers/proposals.ts`

- [ ] **Step 1: Install MSW**

```bash
cd frontend && npm install -D msw
```

- [ ] **Step 2: Create proposal MSW handlers**

```ts
// frontend/src/test/handlers/proposals.ts
import { http, HttpResponse } from 'msw'

export const proposalHandlers = [
  http.get('http://localhost:8000/proposals', () => {
    return HttpResponse.json({
      data: [
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
          description: 'Desenvolvimento de um sistema descentralizado baseado em blockchain para emissão e verificação de certificados acadêmicos, aumentando a segurança e transparência.',
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
        {
          id: 3,
          professor_id: 12,
          title: 'Análise de Sentimentos em Redes Sociais',
          description: 'Aplicação de técnicas de Processamento de Linguagem Natural para identificar sentimentos em postagens de redes sociais, com foco em textos em português.',
          prerequisites: 'Estatística básica',
          max_slots: 3,
          department_id: 1,
          area_id: 3,
          status: 'open',
          professor: {
            id: 12,
            name: 'Prof. João Santos',
            email: 'joao@univ.br',
            role: 'professor',
            department_id: 1,
            profile_link: null,
          },
          department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
          area: { id: 3, name: 'Processamento de Linguagem Natural', code: 'PLN' },
          applications_count: 2,
          approved_applications_count: 1,
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 3,
        from: 1,
        to: 3,
      },
      links: {
        first: 'http://localhost:8000/proposals?page=1',
        last: 'http://localhost:8000/proposals?page=1',
        prev: null,
        next: null,
      },
    })
  }),
]
```

- [ ] **Step 3: Create MSW test server**

```ts
// frontend/src/test/server.ts
import { setupServer } from 'msw/node'
import { proposalHandlers } from './handlers/proposals'

export const server = setupServer(...proposalHandlers)
```

- [ ] **Step 4: Update vitest setup to start/reset/stop MSW server**

```ts
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 5: Verify test infrastructure still works**

```bash
cd frontend && npx vitest run
```
Expected: existing tests (StatusBadge, ProposalCard) still pass

- [ ] **Step 6: Commit**

```bash
git add frontend/src/test/
git commit -m "test: add MSW server with proposal handlers for integration tests"
```

---

### Task 2: Install required Shadcn components

**Files:**
- Modify: `frontend/src/components/ui/` (shadcn installs here automatically)

- [ ] **Step 1: Install Skeleton component**

```bash
cd frontend && npx shadcn@latest add skeleton
```

- [ ] **Step 2: Verify skeleton file exists**

```bash
ls frontend/src/components/ui/skeleton.tsx
```
Expected: file exists

---

### Task 3: Write failing tests for HomePage

**Files:**
- Create: `frontend/src/pages/home/home.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
// frontend/src/pages/home/home.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createMemoryHistory, createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '@/test/server'
import HomePage from '.'

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const rootRoute = createRootRoute({ component: HomePage })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('HomePage', () => {
  it('renders the hero headline', async () => {
    renderHomePage()
    expect(await screen.findByText('Conecte sua pesquisa ao seu futuro')).toBeInTheDocument()
  })

  it('renders the two CTA buttons', async () => {
    renderHomePage()
    expect(await screen.findByRole('link', { name: /explorar mural/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /entrar como professor/i })).toBeInTheDocument()
  })

  it('renders skeleton cards while loading proposals', () => {
    // Override server to delay indefinitely so the loading state persists
    server.use(
      http.get('http://localhost:8000/proposals', async () => {
        await new Promise(() => {}) // never resolves
        return HttpResponse.json({})
      }),
    )
    renderHomePage()
    // 3 skeleton cards should be visible
    const skeletons = document.querySelectorAll('[data-testid="proposal-skeleton"]')
    expect(skeletons).toHaveLength(3)
  })

  it('renders ProposalCards when data arrives', async () => {
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByText('Redes Neurais para Reconhecimento de Imagens')).toBeInTheDocument()
    })
    expect(screen.getByText('Blockchain para Certificação Acadêmica')).toBeInTheDocument()
    expect(screen.getByText('Análise de Sentimentos em Redes Sociais')).toBeInTheDocument()
  })

  it('renders the "Como funciona" section heading', async () => {
    renderHomePage()
    expect(await screen.findByText('Como funciona')).toBeInTheDocument()
  })

  it('renders the footer with project name', async () => {
    renderHomePage()
    expect(await screen.findByRole('contentinfo')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run src/pages/home/home.test.tsx
```
Expected: FAIL — errors about missing component implementations

---

### Task 4: Implement HomePage

**Files:**
- Modify: `frontend/src/pages/home/index.tsx`

- [ ] **Step 1: Implement the full HomePage**

```tsx
// frontend/src/pages/home/index.tsx
import { Link } from '@tanstack/react-router'
import { BookOpen, Search, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProposalCard } from '@/components/shared/ProposalCard'
import { useProposals } from '@/features/proposals/hooks'
import { ROUTES } from '@/constants/routes'

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: 'Professor publica uma proposta',
    description:
      'Professores cadastram temas de TCC com descrição, área do conhecimento e número de vagas disponíveis.',
  },
  {
    icon: Search,
    title: 'Aluno se candidata',
    description:
      'Alunos navegam pelo mural, encontram propostas alinhadas ao seu interesse e se candidatam com um clique.',
  },
  {
    icon: CheckCircle,
    title: 'Professor aprova e orienta',
    description:
      'O professor analisa as candidaturas, aprova o aluno escolhido e a orientação começa.',
  },
]

function ProposalSkeletonCard() {
  return (
    <div data-testid="proposal-skeleton">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading } = useProposals({ status: 'open', page: 1 })
  const featuredProposals = data?.data.slice(0, 3) ?? []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
          Conecte sua pesquisa ao seu futuro
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
          Encontre orientadores alinhados com seus interesses e comece sua jornada de TCC com confiança.
          Professores publicam propostas, alunos se candidatam — simples assim.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link to={ROUTES.proposals.list}>
              Explorar mural
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={ROUTES.login}>Entrar como professor</Link>
          </Button>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Propostas em destaque */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Propostas em destaque</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.proposals.list}>
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <ProposalSkeletonCard key={i} />)
              : featuredProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer role="contentinfo" className="mt-auto border-t py-8 px-4 bg-muted/20">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-medium">Conecta TCC</p>
          <p>Desenvolvido pela equipe Conecta TCC &middot; 2025</p>
          <a
            href="https://github.com/arthurarabelo/conecta-tcc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd frontend && npx vitest run src/pages/home/home.test.tsx
```
Expected: PASS — 6 tests pass

- [ ] **Step 3: Run all tests**

```bash
cd frontend && npx vitest run
```
Expected: all tests pass

- [ ] **Step 4: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/home/
git commit -m "feat: implement home landing page with hero, how-it-works, featured proposals, and footer"
```
