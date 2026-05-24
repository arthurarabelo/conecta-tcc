import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RegisterForm } from '../RegisterForm'

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
