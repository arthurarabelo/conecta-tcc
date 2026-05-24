# Auth Store, Schemas & Login Page — Design

**Issues covered:** #04 Auth Store (Zustand), #05 Auth Schemas & Service, #06 Login/Register Page
**Date:** 2026-05-24
**Status:** Implemented

---

## Goal

Validate and implement the authentication layer end-to-end: persistent auth state, Zod schema validation, API service integration, and the login/register UI.

---

## Architecture

### State — `useAuthStore` (Zustand + persist)

Single source of truth for authentication. Persists `user` and `token` to `localStorage` under the key `conecta-tcc-auth`. Also writes `auth_token` separately so the axios interceptor can read it without importing Zustand.

```
useAuthStore
  ├── user: User | null
  ├── token: string | null
  ├── isAuthenticated: boolean     ← set by setAuth / clearAuth / onRehydrateStorage
  ├── setAuth(user, token)         ← writes auth_token to localStorage
  └── clearAuth()                  ← removes auth_token from localStorage
```

`useAuth()` is a convenience hook that derives `isProfessor` and `isStudent` from `user.role`.

### HTTP — `apiClient` (Axios)

Request interceptor reads `localStorage.getItem('auth_token')` on every request and attaches `Authorization: Bearer <token>`. Reading from localStorage (not Zustand) avoids a circular dependency between the service layer and the store.

Response interceptor catches 401s and redirects to `/entrar`, clearing the token.

### Validation — Zod schemas

- `loginSchema` — `{ email: string (valid email), password: string (min 1) }`
- `registerSchema` — name (min 2), email, password (min 6), password_confirmation (must match), role (enum), department_id (coerced positive int), profile_link (URL or empty, optional)

### Service — `authService`

Thin wrapper over `apiClient`. Each method returns typed data directly (no raw AxiosResponse exposed to callers):
- `login(payload)` → `{ user, token }`
- `register(payload)` → `{ user, token }`
- `logout()` → `void`
- `me()` → `User`

### React Query hooks

- `useLogin` / `useRegister` — mutations that call `authService`, then `setAuth` and navigate to `/`
- `useLogout` — mutation that calls `authService.logout`, then `clearAuth` and clears the query cache
- `useMe` — query enabled only when `isAuthenticated === true`

### UI — Login/Register page (`/entrar`)

Two-panel layout (desktop: left brand panel + right form panel; mobile: single column). A `mode` state (`'login' | 'register'`) toggles between `<LoginForm>` and `<RegisterForm>`. Auth guard at the top redirects already-authenticated users to `/`.

Both forms use React Hook Form with `zodResolver`. Validation runs on submit (`noValidate` on the `<form>` disables native browser validation so Zod errors appear instead). API errors display in a Shadcn `<Alert variant="destructive">` above the fields.

---

## Data flow

```
User submits form
  → RHF validates with Zod (client-side)
  → useLogin / useRegister mutation fires
  → authService.login / register → apiClient.post
  → axios request interceptor attaches Bearer token (if present)
  → MSW intercepts in tests / real server in production
  → on success: setAuth(user, token) → Zustand store + localStorage
  → navigate({ to: '/' })
```

---

## Testing strategy

| Layer | Tool | Approach |
|---|---|---|
| Zod schemas | Vitest | `.safeParse()` directly, no React |
| Zustand store | Vitest | `useAuthStore.setState` / `getState` directly, `persist.rehydrate()` |
| `useAuth` hook | @testing-library/react `renderHook` | Exercises derived `isProfessor`/`isStudent` |
| `authService` | Vitest + MSW v2 | Real axios calls intercepted at network level |
| `useLogin` / `useRegister` / `useMe` | renderHook + MSW | Full mutation → store → localStorage cycle |
| `LoginForm` / `RegisterForm` | render + userEvent | Mocked hooks; tests validation messages and submit payload |
| Login page | render + userEvent | Mocked hooks + useAuth; tests mode toggle and auth guard |
| axios interceptor | Vitest | Interceptor handler invoked directly to assert headers |

MSW server is started globally in `src/test/setup.ts` with `onUnhandledRequest: 'error'` so unintended network calls fail loudly.

---

## Key decisions

- **`auth_token` in localStorage (not only Zustand):** The axios interceptor can't import Zustand without creating a circular dependency through the module graph. Writing the token directly to localStorage at `setAuth` / `clearAuth` keeps the service layer independent.
- **`noValidate` on forms:** jsdom enforces native browser constraint validation, which blocks the `submit` event for `type="email"` inputs with invalid values, preventing React Hook Form from running Zod validation. Adding `noValidate` disables native validation and lets Zod handle everything.
- **MSW at the `setupServer` level (not per-test):** Starting MSW once in `setup.ts` is simpler and catches accidental unhandled requests across the entire suite.
