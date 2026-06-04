import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import LoginPage from '../index'

vi.mock('@/features/auth/hooks', () => ({
  useLogin: vi.fn(),
  useRegister: vi.fn(),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearch: () => ({ mode: undefined, role: undefined }),
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
    expect(screen.getAllByText(/Conecta TCC/i).length).toBeGreaterThan(0)
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
