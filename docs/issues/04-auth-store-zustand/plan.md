# Auth Store Zustand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that the Zustand auth store persists to localStorage, hydrates on reload, clears on logout, and that the api-client correctly reads the token from localStorage.

**Architecture:** Tests exercise `useAuthStore` directly (not through React) for store logic, use `renderHook` from `@testing-library/react` for the `useAuth` hook, and assert axios request headers via a spy on the api-client interceptor chain. The Zustand persist middleware stores state under the key `conecta-tcc-auth` in localStorage; `setAuth` also writes `auth_token` separately for the axios interceptor.

**Tech Stack:** Vitest, @testing-library/react (renderHook), Zustand v5, Axios, localStorage (mocked via vitest's jsdom environment)

---

### Task 1: Vitest + test infrastructure setup

**Files:**
- Create: `frontend/src/test/setup.ts`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/utils.tsx`

- [ ] **Step 1: Write failing test to confirm test runner is absent**
```bash
npx vitest run --reporter=verbose 2>&1 | head -20
```
Expected: error about missing test config or no test files found.

- [ ] **Step 2: Add Vitest dependencies and configure**
```bash
cd conecta-tcc/frontend && npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Create test setup file**
```ts
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Update vite.config.ts to add test config**
```ts
// frontend/vite.config.ts
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

- [ ] **Step 5: Create shared test utilities**
```tsx
// frontend/src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

export { render, renderHook }
```

- [ ] **Step 6: Run a smoke test**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose 2>&1 | head -20
```
Expected: no test files found (but no config errors).

- [ ] **Step 7: Commit**
```bash
git -C conecta-tcc add frontend/vite.config.ts frontend/src/test/setup.ts frontend/src/test/utils.tsx
git -C conecta-tcc commit -m "test: configure vitest with jsdom and testing-library"
```

---

### Task 2: Unit tests for auth.store.ts

**Files:**
- Create: `frontend/src/store/auth.store.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// frontend/src/store/auth.store.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  department_id: 1,
  profile_link: null,
}

const mockToken = 'test-token-abc123'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  describe('setAuth', () => {
    it('sets user, token and isAuthenticated to true', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('persists auth_token to localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      expect(localStorage.getItem('auth_token')).toBe(mockToken)
    })

    it('persists state to localStorage under conecta-tcc-auth key', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)

      const stored = localStorage.getItem('conecta-tcc-auth')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.state.user).toEqual(mockUser)
      expect(parsed.state.token).toBe(mockToken)
    })
  })

  describe('clearAuth', () => {
    it('clears user, token and sets isAuthenticated to false', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('removes auth_token from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('isAuthenticated toggle', () => {
    it('starts as false', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('becomes true after setAuth', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('becomes false after clearAuth', () => {
      useAuthStore.getState().setAuth(mockUser, mockToken)
      useAuthStore.getState().clearAuth()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('Zustand persist hydration', () => {
    it('restores state from localStorage on store creation', () => {
      // Simulate persisted state in localStorage
      const persistedState = {
        state: { user: mockUser, token: mockToken },
        version: 0,
      }
      localStorage.setItem('conecta-tcc-auth', JSON.stringify(persistedState))
      // Also set auth_token as the interceptor reads it directly
      localStorage.setItem('auth_token', mockToken)

      // Force re-hydration by calling the persist API
      useAuthStore.persist.rehydrate()

      // After rehydration the onRehydrateStorage callback sets isAuthenticated
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
    })

    it('does not set isAuthenticated when no token in persisted state', () => {
      const persistedState = {
        state: { user: null, token: null },
        version: 0,
      }
      localStorage.setItem('conecta-tcc-auth', JSON.stringify(persistedState))

      useAuthStore.persist.rehydrate()

      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/store/auth.store.test.ts --reporter=verbose
```
Expected: FAIL — test files not found or import errors (no test infrastructure yet).

- [ ] **Step 3: Verify auth.store.ts implementation matches expectations**

The existing `frontend/src/store/auth.store.ts` already implements this correctly:
```ts
// frontend/src/store/auth.store.ts  (already exists — verify matches)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/models'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth(user, token) {
        localStorage.setItem('auth_token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth() {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'conecta-tcc-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true
        }
      },
    },
  ),
)
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/store/auth.store.test.ts --reporter=verbose
```
Expected: PASS all 9 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/store/auth.store.test.ts
git -C conecta-tcc commit -m "test: add unit tests for auth.store.ts setAuth/clearAuth/persist"
```

---

### Task 3: Unit tests for use-auth.ts hook

**Files:**
- Create: `frontend/src/hooks/use-auth.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
// frontend/src/hooks/use-auth.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

const mockProfessor: User = {
  id: 1,
  name: 'Prof. Silva',
  email: 'silva@ufmg.br',
  role: 'professor',
  department_id: 2,
  profile_link: 'https://lattes.cnpq.br/silva',
}

const mockStudent: User = {
  id: 2,
  name: 'João Aluno',
  email: 'joao@ufmg.br',
  role: 'student',
  department_id: 2,
  profile_link: null,
}

const mockToken = 'token-xyz'

describe('useAuth hook', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isProfessor).toBe(false)
    expect(result.current.isStudent).toBe(false)
  })

  it('returns authenticated state after setAuth', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockStudent, mockToken)
    })

    expect(result.current.user).toEqual(mockStudent)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('isProfessor is true for professor role', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockProfessor, mockToken)
    })

    expect(result.current.isProfessor).toBe(true)
    expect(result.current.isStudent).toBe(false)
  })

  it('isStudent is true for student role', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockStudent, mockToken)
    })

    expect(result.current.isStudent).toBe(true)
    expect(result.current.isProfessor).toBe(false)
  })

  it('clears state after clearAuth', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockProfessor, mockToken)
    })
    act(() => {
      result.current.clearAuth()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isProfessor).toBe(false)
    expect(result.current.isStudent).toBe(false)
  })

  it('exposes setAuth and clearAuth functions', () => {
    const { result } = renderHook(() => useAuth())

    expect(typeof result.current.setAuth).toBe('function')
    expect(typeof result.current.clearAuth).toBe('function')
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/hooks/use-auth.test.ts --reporter=verbose
```
Expected: FAIL — no test infrastructure yet.

- [ ] **Step 3: Verify use-auth.ts matches expectations**

The existing `frontend/src/hooks/use-auth.ts` already implements correctly:
```ts
// frontend/src/hooks/use-auth.ts  (already exists — verify)
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return {
    user,
    token,
    isAuthenticated,
    isProfessor: user?.role === 'professor',
    isStudent: user?.role === 'student',
    setAuth,
    clearAuth,
  }
}
```

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/hooks/use-auth.test.ts --reporter=verbose
```
Expected: PASS all 6 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/hooks/use-auth.test.ts
git -C conecta-tcc commit -m "test: add unit tests for useAuth hook isProfessor/isStudent"
```

---

### Task 4: Integration test — api-client.ts sends Authorization header after setAuth

**Files:**
- Create: `frontend/src/services/api-client.test.ts`

- [ ] **Step 1: Write failing test**
```ts
// frontend/src/services/api-client.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

// We test the interceptor behavior by inspecting what the interceptor
// adds to request config, not by making real HTTP calls.

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@ufmg.br',
  role: 'student',
  department_id: 1,
  profile_link: null,
}

describe('api-client Authorization header interceptor', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('does not set Authorization header when no token in localStorage', async () => {
    // Import after clearing localStorage to avoid stale state
    const { apiClient } = await import('@/services/api-client')

    // Use axios internals to run the request interceptor manually
    const config = {
      headers: {} as Record<string, string>,
    }
    // Get the first request interceptor handler
    const interceptor = (apiClient.interceptors.request as any).handlers[0]
    const fulfilledFn = interceptor?.fulfilled ?? interceptor?.onFulfilled
    const result = await fulfilledFn(config)

    expect(result.headers['Authorization']).toBeUndefined()
  })

  it('sets Authorization header with Bearer token after setAuth', async () => {
    const { apiClient } = await import('@/services/api-client')

    // setAuth writes to localStorage which is what the interceptor reads
    useAuthStore.getState().setAuth(mockUser, 'my-secret-token')

    const config = {
      headers: {} as Record<string, string>,
    }
    const interceptor = (apiClient.interceptors.request as any).handlers[0]
    const fulfilledFn = interceptor?.fulfilled ?? interceptor?.onFulfilled
    const result = await fulfilledFn(config)

    expect(result.headers['Authorization']).toBe('Bearer my-secret-token')
  })

  it('does not set Authorization header after clearAuth removes token', async () => {
    const { apiClient } = await import('@/services/api-client')

    useAuthStore.getState().setAuth(mockUser, 'another-token')
    useAuthStore.getState().clearAuth()

    const config = {
      headers: {} as Record<string, string>,
    }
    const interceptor = (apiClient.interceptors.request as any).handlers[0]
    const fulfilledFn = interceptor?.fulfilled ?? interceptor?.onFulfilled
    const result = await fulfilledFn(config)

    expect(result.headers['Authorization']).toBeUndefined()
  })

  it('reads auth_token key from localStorage (not from Zustand state directly)', async () => {
    const { apiClient } = await import('@/services/api-client')

    // Write directly to localStorage without going through Zustand
    localStorage.setItem('auth_token', 'direct-localStorage-token')

    const config = {
      headers: {} as Record<string, string>,
    }
    const interceptor = (apiClient.interceptors.request as any).handlers[0]
    const fulfilledFn = interceptor?.fulfilled ?? interceptor?.onFulfilled
    const result = await fulfilledFn(config)

    expect(result.headers['Authorization']).toBe('Bearer direct-localStorage-token')
  })
})
```

- [ ] **Step 2: Run test — expect failure**
```bash
cd conecta-tcc/frontend && npx vitest run src/services/api-client.test.ts --reporter=verbose
```
Expected: FAIL — no vitest config or import errors.

- [ ] **Step 3: Verify api-client.ts interceptor reads from localStorage**

The existing `frontend/src/services/api-client.ts` reads `localStorage.getItem('auth_token')` in its request interceptor — this is exactly what the tests verify. No changes needed.

- [ ] **Step 4: Run test — expect pass**
```bash
cd conecta-tcc/frontend && npx vitest run src/services/api-client.test.ts --reporter=verbose
```
Expected: PASS all 4 tests.

- [ ] **Step 5: Commit**
```bash
git -C conecta-tcc add frontend/src/services/api-client.test.ts
git -C conecta-tcc commit -m "test: integration test for api-client Authorization header interceptor"
```

---

### Task 5: Manual verification steps

- [ ] **Step 1: Start the dev server**
```bash
cd conecta-tcc/frontend && npm run dev
```

- [ ] **Step 2: Open browser DevTools → Application → Local Storage**
- Navigate to `http://localhost:5173/entrar`
- Confirm localStorage is empty (no `auth_token`, no `conecta-tcc-auth`)

- [ ] **Step 3: Simulate login via browser console**
```js
// In browser console:
const { useAuthStore } = await import('/src/store/auth.store.ts')
useAuthStore.getState().setAuth(
  { id: 1, name: 'Test', email: 'test@ufmg.br', role: 'student', department_id: 1, profile_link: null },
  'manual-test-token'
)
// Check localStorage:
localStorage.getItem('auth_token')        // → "manual-test-token"
localStorage.getItem('conecta-tcc-auth') // → JSON with user and token
```

- [ ] **Step 4: Reload the page and confirm state is restored**
```js
// After F5 reload, in browser console:
const { useAuthStore } = await import('/src/store/auth.store.ts')
useAuthStore.getState().isAuthenticated  // → true (hydrated from localStorage)
useAuthStore.getState().token            // → "manual-test-token"
```

- [ ] **Step 5: Simulate logout**
```js
useAuthStore.getState().clearAuth()
localStorage.getItem('auth_token')        // → null
localStorage.getItem('conecta-tcc-auth') // → JSON with user: null, token: null
```

- [ ] **Step 6: Run full test suite**
```bash
cd conecta-tcc/frontend && npx vitest run --reporter=verbose
```
Expected: all tests PASS.
