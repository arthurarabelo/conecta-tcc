import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { LoginForm } from '../LoginForm'

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
