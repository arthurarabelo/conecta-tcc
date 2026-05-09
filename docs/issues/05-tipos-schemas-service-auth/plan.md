# Auth Types, Schemas and Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that Zod schemas reject invalid input correctly and that authService methods communicate correctly with the API, using MSW v2 to mock HTTP endpoints.

**Architecture:** Schema tests use Zod's `.safeParse()` directly — no React rendering needed. Service integration tests use MSW v2 (`setupServer`) to intercept Axios requests at the network level, letting `authService` run its real code against fake HTTP responses. The MSW server is configured in `src/test/server.ts` and started/stopped around each test suite.

**Tech Stack:** Vitest, Zod v3, MSW v2, Axios, @testing-library/react (for hook tests)

---

### Task 1: Install MSW v2 and create mock server

**Files:**
- Create: `frontend/src/test/server.ts`
- Create: `frontend/src/test/handlers.ts`
- Modify: `frontend/src/test/setup.ts`

- [ ] **Step 1: Write failing test to confirm MSW is absent**
```bash
cd conecta-tcc/frontend && npx vitest run src/services/auth.service.test.ts --reporter=verbose 2>&1 | head -20
```
Expected: FAIL — file not found or MSW not installed.

- [ ] **Step 2: Install MSW**
```bash
cd conecta-tcc/frontend && npm install -D msw
```

- [ ] **Step 3: Create MSW handlers for auth endpoints**
```ts
// frontend/src/test/handlers.ts
import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000'

export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@ufmg.br',
  role: 'student' as const,
  department_id: 1,
  profile_link: null,
}

export const mockToken = 'test-bearer-token-abc123'

export const authHandlers = [
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'test@ufmg.br' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser, token: mockToken }, { status: 200 })
    }

    return HttpResponse.json(
      { message: 'Credenciais inválidas.' },
      { status: 401 },
    )
  }),

  http.post(`${BASE_URL}/register`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          message: 'Os dados fornecidos são inválidos.',
          errors: {
            email: ['O campo e-mail é obrigatório.'],
            password: ['O campo senha é obrigatório.'],
          },
        },
        { status: 422 },
      )
    }

    const newUser = {
      id: 2,
      name: body.name as string,
      email: body.email as string,
      role: body.role as 'professor' | 'student',
      department_id: body.department_id as number,
      profile_link: (body.profile_link as string) || null,
    }

    return HttpResponse.json({ user: newUser, token: mockToken }, { status: 201 })
  }),

  http.post(`${BASE_URL}/logout`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.get(`${BASE_URL}/me`, ({ request }) => {
    const auth = request.headers.get('Authorization')

    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    return HttpResponse.json({ data: mockUser }, { status: 200 })
  }),
]
```

- [ ] **Step 4: Create MSW server setup**
```ts
// frontend/src/test/server.ts
import { setupServer } from 'msw/node'
import { authHandlers } from './handlers'

export const server = setupServer(...authHandlers)
```

- [ ] **Step 5: Update test setup to start/stop MSW server**
```ts
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
import { server } from './server'
import { beforeAll, afterEach, afterAll } from 'vitest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 6: Commit**
```bash
git -C conecta-tcc add frontend/src/test/handlers.ts frontend/src/test/server.ts frontend/src/test/setup.ts
git -C conecta-tcc commit -m "test: add MSW v2 server setup with auth endpoint handlers"
```

---

### Task 2: Unit tests for loginSchema

**Files:**
- Create: `frontend/src/features/auth/schemas/login-schema.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// frontend/src/features/auth/schemas/login-schema.test.ts
import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/features/auth/schemas'

describe('loginSchema', () => {
  describe('email field', () => {
    it('accepts a valid email', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'abc123' })
      expect(result.success).toBe(true)
    })

    it('rejects an empty email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError).toBeDefined()
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })

    it('rejects a malformed email (missing @)', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })

    it('rejects an email without domain', () => {
      const result = loginSchema.safeParse({ email: 'user@', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError).toBeDefined()
      }
    })

    it('rejects a missing email field', () => {
      const result = loginSchema.safeParse({ password: 'abc123' })
      expect(result.success).toBe(false)
    })
  })

  describe('password field', () => {
    it('accepts a non-empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'p' })
      expect(result.success).toBe(true)
    })

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find((i) => i.path[0] === 'password')
        expect(passwordError?.message).toBe('Senha obrigatória')
      }
    })

    it('rejects a missing password field', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br' })
      expect(result.success).toBe(false)
    })
  })

  describe('valid full payload', () => {
    it('returns the parsed data on success', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'abc123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ email: 'user@ufmg.br', password: 'abc123' })
      }
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/schemas/login-schema.test.ts --reporter=verbose
```
Expected: FAIL — no vitest config or import path errors.

- [ ] **Step 3: Verify loginSchema implementation**

The existing `frontend/src/features/auth/schemas/index.ts` already implements:
```ts
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
```
No changes needed.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/schemas/login-schema.test.ts --reporter=verbose
```
Expected: PASS all 9 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/features/auth/schemas/login-schema.test.ts
git -C conecta-tcc commit -m "test: unit tests for loginSchema email/password validation"
```

---

### Task 3: Unit tests for registerSchema

**Files:**
- Create: `frontend/src/features/auth/schemas/register-schema.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// frontend/src/features/auth/schemas/register-schema.test.ts
import { describe, expect, it } from 'vitest'
import { registerSchema } from '@/features/auth/schemas'

const validPayload = {
  name: 'João Silva',
  email: 'joao@ufmg.br',
  password: 'senha123',
  password_confirmation: 'senha123',
  role: 'student' as const,
  department_id: 1,
  profile_link: '',
}

describe('registerSchema', () => {
  describe('name field', () => {
    it('accepts a name with at least 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: 'Jo' })
      expect(result.success).toBe(true)
    })

    it('rejects a name with fewer than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: 'J' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameError = result.error.issues.find((i) => i.path[0] === 'name')
        expect(nameError?.message).toBe('Nome deve ter ao menos 2 caracteres')
      }
    })

    it('rejects an empty name', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('email field', () => {
    it('rejects an invalid email', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'not-valid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })
  })

  describe('password field', () => {
    it('rejects a password shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: '12345',
        password_confirmation: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find((i) => i.path[0] === 'password')
        expect(passwordError?.message).toBe('Senha deve ter ao menos 6 caracteres')
      }
    })

    it('accepts a password with exactly 6 characters', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: '123456',
        password_confirmation: '123456',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('password_confirmation field', () => {
    it('rejects when password and password_confirmation do not match', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'senha123',
        password_confirmation: 'diferente',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (i) => i.path[0] === 'password_confirmation',
        )
        expect(confirmError?.message).toBe('As senhas não coincidem')
      }
    })

    it('accepts when passwords match', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'senha123',
        password_confirmation: 'senha123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('role field', () => {
    it('accepts "student" role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'student' })
      expect(result.success).toBe(true)
    })

    it('accepts "professor" role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'professor' })
      expect(result.success).toBe(true)
    })

    it('rejects an invalid role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'admin' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const roleError = result.error.issues.find((i) => i.path[0] === 'role')
        expect(roleError).toBeDefined()
      }
    })
  })

  describe('department_id field', () => {
    it('accepts a positive integer', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: 5 })
      expect(result.success).toBe(true)
    })

    it('rejects zero', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: 0 })
      expect(result.success).toBe(false)
    })

    it('coerces a numeric string to number', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: '3' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.department_id).toBe(3)
      }
    })
  })

  describe('profile_link field', () => {
    it('accepts an empty string', () => {
      const result = registerSchema.safeParse({ ...validPayload, profile_link: '' })
      expect(result.success).toBe(true)
    })

    it('accepts a valid URL', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        profile_link: 'https://lattes.cnpq.br/123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts undefined (optional)', () => {
      const { profile_link: _, ...payloadWithoutLink } = validPayload
      const result = registerSchema.safeParse(payloadWithoutLink)
      expect(result.success).toBe(true)
    })

    it('rejects a non-URL string', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        profile_link: 'not-a-url',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const linkError = result.error.issues.find((i) => i.path[0] === 'profile_link')
        expect(linkError?.message).toBe('URL inválida')
      }
    })
  })

  describe('valid full payload', () => {
    it('returns parsed data on success for student', () => {
      const result = registerSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('student')
        expect(result.data.department_id).toBe(1)
      }
    })

    it('returns parsed data on success for professor', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        role: 'professor',
        profile_link: 'https://lattes.cnpq.br/professor',
      })
      expect(result.success).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/schemas/register-schema.test.ts --reporter=verbose
```
Expected: FAIL — no vitest config or import errors.

- [ ] **Step 3: Verify registerSchema implementation**

The existing `frontend/src/features/auth/schemas/index.ts` already implements this correctly with the `.refine()` check for password confirmation. No changes needed.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/schemas/register-schema.test.ts --reporter=verbose
```
Expected: PASS all 17 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/features/auth/schemas/register-schema.test.ts
git -C conecta-tcc commit -m "test: unit tests for registerSchema all fields including password mismatch"
```

---

### Task 4: Integration tests for authService using MSW

**Files:**
- Create: `frontend/src/services/auth.service.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// frontend/src/services/auth.service.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken } from '@/test/handlers'
import type { RegisterPayload } from '@/services/auth.service'

// MSW server is started in src/test/setup.ts

describe('authService', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  describe('login', () => {
    it('returns user and token on valid credentials', async () => {
      const result = await authService.login({
        email: 'test@ufmg.br',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe(mockToken)
    })

    it('throws an error on invalid credentials', async () => {
      await expect(
        authService.login({ email: 'wrong@ufmg.br', password: 'wrongpass' }),
      ).rejects.toMatchObject({ status: 401 })
    })

    it('returns an object with user and token keys', async () => {
      const result = await authService.login({
        email: 'test@ufmg.br',
        password: 'password123',
      })

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
    })
  })

  describe('register', () => {
    const validRegisterPayload: RegisterPayload = {
      name: 'Novo Aluno',
      email: 'novo@ufmg.br',
      password: 'senha123',
      password_confirmation: 'senha123',
      role: 'student',
      department_id: 1,
    }

    it('returns user and token on valid payload', async () => {
      const result = await authService.register(validRegisterPayload)

      expect(result.user.name).toBe('Novo Aluno')
      expect(result.user.email).toBe('novo@ufmg.br')
      expect(result.user.role).toBe('student')
      expect(result.token).toBe(mockToken)
    })

    it('works for professor role', async () => {
      const result = await authService.register({
        ...validRegisterPayload,
        name: 'Prof. Costa',
        email: 'costa@ufmg.br',
        role: 'professor',
        profile_link: 'https://lattes.cnpq.br/costa',
      })

      expect(result.user.role).toBe('professor')
    })

    it('throws ValidationError on missing fields', async () => {
      await expect(
        authService.register({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'student',
          department_id: 1,
        }),
      ).rejects.toMatchObject({ status: 422 })
    })
  })

  describe('logout', () => {
    it('resolves without error when authenticated', async () => {
      localStorage.setItem('auth_token', mockToken)
      await expect(authService.logout()).resolves.toBeUndefined()
    })
  })

  describe('me', () => {
    it('returns current user when token is present', async () => {
      localStorage.setItem('auth_token', mockToken)
      const user = await authService.me()

      expect(user).toEqual(mockUser)
    })

    it('throws AuthError when no token provided', async () => {
      // No token in localStorage — MSW handler returns 401
      await expect(authService.me()).rejects.toMatchObject({ status: 401 })
    })

    it('returns user matching the User type structure', async () => {
      localStorage.setItem('auth_token', mockToken)
      const user = await authService.me()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('department_id')
      expect(user).toHaveProperty('profile_link')
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/services/auth.service.test.ts --reporter=verbose
```
Expected: FAIL — no vitest config or MSW not installed yet.

- [ ] **Step 3: Verify User type covers all /me response fields**

The existing `frontend/src/types/models.ts` User interface:
```ts
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  department_id: number | null
  profile_link: string | null
  department?: Department   // optional relation
}
```

This covers all fields from `GET /me → { data: User }`. The MSW handler returns `{ data: mockUser }` and `authService.me()` extracts `data.data`. Confirmed: User type is complete.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/services/auth.service.test.ts --reporter=verbose
```
Expected: PASS all 9 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/services/auth.service.test.ts
git -C conecta-tcc commit -m "test: integration tests for authService using MSW mocked endpoints"
```

---

### Task 5: Integration tests for useLogin and useRegister hooks

**Files:**
- Create: `frontend/src/features/auth/hooks/auth-hooks.test.tsx`

- [ ] **Step 1: Write failing tests**
```tsx
// frontend/src/features/auth/hooks/auth-hooks.test.tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useLogin, useRegister, useLogout, useMe } from '@/features/auth/hooks'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken } from '@/test/handlers'

// Mock navigation — TanStack Router needs a real router context
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useLogin', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('sets auth state in store after successful login', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ email: 'test@ufmg.br', password: 'password123' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(localStorage.getItem('auth_token')).toBe(mockToken)
  })

  it('sets error state on invalid credentials', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => {
      result.current.mutate({ email: 'wrong@ufmg.br', password: 'wrong' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toMatchObject({ status: 401 })
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('useRegister', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('sets auth state in store after successful registration', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useRegister(), { wrapper })

    act(() => {
      result.current.mutate({
        name: 'Novo Aluno',
        email: 'novo@ufmg.br',
        password: 'senha123',
        password_confirmation: 'senha123',
        role: 'student',
        department_id: 1,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.token).toBe(mockToken)
  })
})

describe('useMe', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('does not run query when isAuthenticated is false', async () => {
    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useMe(), { wrapper })

    // Query should be disabled — status is 'pending' but not fetching
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('runs query when isAuthenticated is true', async () => {
    localStorage.setItem('auth_token', mockToken)
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })

    const wrapper = createTestWrapper()
    const { result } = renderHook(() => useMe(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockUser)
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/hooks/auth-hooks.test.tsx --reporter=verbose
```
Expected: FAIL — no test infrastructure or import errors.

- [ ] **Step 3: No implementation changes needed**

The hooks in `frontend/src/features/auth/hooks/index.ts` already call `authService` and `setAuth` correctly. The MSW server intercepts axios calls. No source changes required.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/features/auth/hooks/auth-hooks.test.tsx --reporter=verbose
```
Expected: PASS all 5 tests.

- [ ] **Step 5: Run full suite**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**
```bash
git -C conecta-tcc add frontend/src/features/auth/hooks/auth-hooks.test.tsx
git -C conecta-tcc commit -m "test: integration tests for useLogin/useRegister/useMe hooks with MSW"
```
