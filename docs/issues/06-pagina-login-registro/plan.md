# Login and Registration Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/entrar` page with a two-panel layout, toggling between a LoginForm and a RegisterForm, with client-side Zod validation and API error display, redirecting authenticated users away from the page.

**Architecture:** The login page (`src/pages/login/index.tsx`) holds the mode toggle state (`'login' | 'register'`) and renders the appropriate form component from `src/features/auth/components/`. Both forms use React Hook Form with `@hookform/resolvers/zod` and Shadcn `<Form>` primitives. API errors are displayed via a Shadcn `<Alert>` below the form. An auth guard at the top of the page redirects already-authenticated users to `/`.

**Tech Stack:** React Hook Form, @hookform/resolvers/zod, Zod, Shadcn/ui (Form, Input, Button, Select, Alert), TanStack Router (useNavigate), useAuth hook, useLogin/useRegister mutations, Vitest + @testing-library/react

---

### Task 1: LoginForm component

**Files:**
- Create: `frontend/src/features/auth/components/LoginForm.tsx`
- Create: `frontend/src/features/auth/components/LoginForm.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/features/auth/components/LoginForm.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { LoginForm } from './LoginForm'

// Mock the auth hooks — we test UI behavior, not the mutation itself
vi.mock('@/features/auth/hooks', () => ({
  useLogin: vi.fn(),
}))
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

import { useLogin } from '@/features/auth/hooks'

const mockMutate = vi.fn()

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)
    mockMutate.mockClear()
  })

  it('renders email and password fields and a submit button', () => {
    render(<LoginForm />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/e-mail/i), 'not-valid')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    })
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/e-mail/i), 'valid@ufmg.br')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Senha obrigatória')).toBeInTheDocument()
    })
  })

  it('calls mutate with form values on valid submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/e-mail/i), 'test@ufmg.br')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@ufmg.br',
        password: 'senha123',
      })
    })
  })

  it('shows API error message when login fails', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: { message: 'Credenciais inválidas.' } as any,
      isError: true,
      isSuccess: false,
      reset: vi.fn(),
    } as any)

    render(<LoginForm />, { wrapper: createWrapper() })

    expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument()
  })

  it('disables submit button while isPending', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)

    render(<LoginForm />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/components/LoginForm.test.tsx --reporter=verbose
```
Expected: FAIL — LoginForm.tsx does not exist yet.

- [ ] **Step 3: Implement LoginForm**
```tsx
// frontend/src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { useLogin } from '@/features/auth/hooks'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const { mutate, isPending, isError, error } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginFormValues) {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isError && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu.nome@ufmg.br"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            'Entrando...'
          ) : (
            <>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/components/LoginForm.test.tsx --reporter=verbose
```
Expected: PASS all 6 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/features/auth/components/LoginForm.tsx frontend/src/features/auth/components/LoginForm.test.tsx
git -C conecta-tcc commit -m "feat: add LoginForm component with validation and API error display"
```

---

### Task 2: RegisterForm component

**Files:**
- Create: `frontend/src/features/auth/components/RegisterForm.tsx`
- Create: `frontend/src/features/auth/components/RegisterForm.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/features/auth/components/RegisterForm.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RegisterForm } from './RegisterForm'

vi.mock('@/features/auth/hooks', () => ({
  useRegister: vi.fn(),
}))
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

import { useRegister } from '@/features/auth/hooks'

const mockMutate = vi.fn()

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)
    mockMutate.mockClear()
  })

  it('renders all required fields', () => {
    render(<RegisterForm />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('shows error when name is too short', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/nome/i), 'A')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter ao menos 2 caracteres')).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/nome/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@ufmg.br')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'diferente')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument()
    })
  })

  it('shows API error when registration fails', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: { message: 'E-mail já cadastrado.' } as any,
      isError: true,
      isSuccess: false,
      reset: vi.fn(),
    } as any)

    render(<RegisterForm />, { wrapper: createWrapper() })

    expect(screen.getByText('E-mail já cadastrado.')).toBeInTheDocument()
  })

  it('disables submit button while isPending', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)

    render(<RegisterForm />, { wrapper: createWrapper() })

    expect(screen.getByRole('button', { name: /cadastrando/i })).toBeDisabled()
  })

  it('calls mutate with correct payload on valid submit', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/nome/i), 'João Silva')
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@ufmg.br')
    await user.type(screen.getByLabelText(/^senha$/i), 'senha123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha123')

    // Select role via the role toggle buttons
    await user.click(screen.getByRole('button', { name: /aluno/i }))

    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'João Silva',
          email: 'joao@ufmg.br',
          password: 'senha123',
          password_confirmation: 'senha123',
          role: 'student',
        }),
      )
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/components/RegisterForm.test.tsx --reporter=verbose
```
Expected: FAIL — RegisterForm.tsx does not exist yet.

- [ ] **Step 3: Implement RegisterForm**
```tsx
// frontend/src/features/auth/components/RegisterForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { useRegister } from '@/features/auth/hooks'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, AlertCircle } from 'lucide-react'

const DEPARTMENTS = [
  { id: 1, name: 'Ciência da Computação' },
  { id: 2, name: 'Engenharia de Software' },
  { id: 3, name: 'Sistemas de Informação' },
  { id: 4, name: 'Engenharia Elétrica' },
  { id: 5, name: 'Matemática' },
] as const

export function RegisterForm() {
  const { mutate, isPending, isError, error } = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'student',
      department_id: 1,
      profile_link: '',
    },
  })

  const selectedRole = form.watch('role')

  function onSubmit(values: RegisterFormValues) {
    mutate({
      ...values,
      profile_link: values.profile_link || undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isError && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-secondary">
          <button
            type="button"
            onClick={() => form.setValue('role', 'student')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              selectedRole === 'student' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Aluno
          </button>
          <button
            type="button"
            onClick={() => form.setValue('role', 'professor')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              selectedRole === 'professor' ? 'bg-card shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Professor
          </button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu.nome@ufmg.br"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
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
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profile_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do perfil (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://lattes.cnpq.br/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            'Cadastrando...'
          ) : (
            <>
              Criar conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/components/RegisterForm.test.tsx --reporter=verbose
```
Expected: PASS all 6 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/features/auth/components/RegisterForm.tsx frontend/src/features/auth/components/RegisterForm.test.tsx
git -C conecta-tcc commit -m "feat: add RegisterForm component with role selector and validation"
```

---

### Task 3: Login page with two-panel layout and auth guard

**Files:**
- Modify: `frontend/src/pages/login/index.tsx`
- Create: `frontend/src/pages/login/login-page.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/pages/login/login-page.test.tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import LoginPage from './index'

// Mock auth hooks
vi.mock('@/features/auth/hooks', () => ({
  useLogin: vi.fn(),
  useRegister: vi.fn(),
}))

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
  }
})

import { useLogin, useRegister } from '@/features/auth/hooks'
import { useAuth } from '@/hooks/use-auth'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)
    vi.mocked(useRegister).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any)
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isProfessor: false,
      isStudent: false,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    mockNavigate.mockClear()
  })

  it('renders the brand panel with Conecta TCC name', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    expect(screen.getByText(/Conecta TCC/i)).toBeInTheDocument()
  })

  it('renders in login mode by default', () => {
    render(<LoginPage />, { wrapper: createWrapper() })
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('switches to registration mode when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /cadastre-se/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
    })
  })

  it('switches back to login mode from registration', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /cadastre-se/i }))
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    })
  })

  it('redirects authenticated user to / on render', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: 'Test', email: 'test@ufmg.br', role: 'student', department_id: 1, profile_link: null },
      token: 'token',
      isAuthenticated: true,
      isProfessor: false,
      isStudent: true,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    } as any)

    render(<LoginPage />, { wrapper: createWrapper() })

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/pages/login/login-page.test.tsx --reporter=verbose
```
Expected: FAIL — LoginPage is a stub with no real implementation.

- [ ] **Step 3: Implement the login page**
```tsx
// frontend/src/pages/login/index.tsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/constants/routes'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.home })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-slate-700 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <Link to={ROUTES.home} className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="text-lg font-semibold">Conecta TCC</div>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight text-balance">
            "Boas perguntas merecem bons orientadores."
          </h2>
          <p className="mt-4 text-white/70 text-sm">— Diretoria de Graduação, 2026</p>
        </div>
        <div className="relative text-xs text-white/50">© 2026 Portal Conecta TCC</div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 bg-background">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {mode === 'login' ? 'Acesso' : 'Cadastro'}
          </div>
          <h1 className="mt-2 text-4xl font-semibold">
            {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Entre com seu e-mail institucional.'
              : 'Cadastre-se para publicar ou candidatar-se.'}
          </p>

          <div className="mt-8">
            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/pages/login/login-page.test.tsx --reporter=verbose
```
Expected: PASS all 5 tests.

- [ ] **Step 5: Run full suite**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**
```bash
git -C conecta-tcc add frontend/src/pages/login/index.tsx frontend/src/pages/login/login-page.test.tsx
git -C conecta-tcc commit -m "feat: implement login page with two-panel layout and auth guard redirect"
```

---

### Task 4: Shadcn component stubs (if not present)

**Files:**
- Create: `frontend/src/components/ui/form.tsx` (if missing)
- Create: `frontend/src/components/ui/input.tsx` (if missing)
- Create: `frontend/src/components/ui/button.tsx` (if missing)
- Create: `frontend/src/components/ui/alert.tsx` (if missing)

- [ ] **Step 1: Check if Shadcn components exist**
```bash
ls conecta-tcc/frontend/src/components/ui/ 2>/dev/null || echo "MISSING"
```

- [ ] **Step 2: If missing, initialize Shadcn and add components**
```bash
cd conecta-tcc/frontend && npx shadcn@latest init --yes
npx shadcn@latest add form input button alert select
```

- [ ] **Step 3: Verify components are present**
```bash
ls conecta-tcc/frontend/src/components/ui/
```
Expected: form.tsx, input.tsx, button.tsx, alert.tsx present.

- [ ] **Step 4: Commit**
```bash
git -C conecta-tcc add frontend/src/components/ frontend/components.json
git -C conecta-tcc commit -m "feat: add shadcn/ui form, input, button, alert components"
```
