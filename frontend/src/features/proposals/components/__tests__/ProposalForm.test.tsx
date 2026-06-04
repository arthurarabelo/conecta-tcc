import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { ProposalForm } from '../ProposalForm'
import type { Proposal } from '@/types/models'

vi.mock('@/features/proposals/hooks', () => ({
  useCreateProposal: vi.fn(),
  useUpdateProposal: vi.fn(),
  useDeleteProposal: vi.fn(),
  useDepartments: () => ({ data: [{ id: 1, name: 'DCC', code: 'DCC' }, { id: 2, name: 'DEE', code: 'DEE' }] }),
  useKnowledgeAreas: () => ({ data: [{ id: 1, name: 'Inteligência Artificial' }, { id: 2, name: 'Banco de Dados' }] }),
}))

import { useCreateProposal, useUpdateProposal, useDeleteProposal } from '@/features/proposals/hooks'
const mockUseCreate = vi.mocked(useCreateProposal)
const mockUseUpdate = vi.mocked(useUpdateProposal)
const mockUseDelete = vi.mocked(useDeleteProposal)

const existingProposal: Proposal = {
  id: 7, professor_id: 10, title: 'IA Aplicada à Medicina',
  description: 'Descrição completa com ao menos vinte caracteres aqui.',
  prerequisites: 'Python, Machine Learning', max_slots: 2,
  department_id: 1, area_id: 1, status: 'open',
}

function makeMutation(mutateFn = vi.fn()) {
  return { mutate: mutateFn, mutateAsync: vi.fn(), isPending: false, isError: false, error: null, isSuccess: false, data: undefined, reset: vi.fn() } as unknown
}

function renderForm(mode: 'create' | 'edit' = 'create') {
  const qc = new QueryClient()
  const rootRoute = createRootRoute()
  const formRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/propostas/nova',
    component: () => (
      <ProposalForm
        mode={mode}
        proposal={mode === 'edit' ? existingProposal : undefined}
        onSuccess={vi.fn()}
      />
    ),
  })
  const routeTree = rootRoute.addChildren([formRoute])
  const history = createMemoryHistory({ initialEntries: ['/propostas/nova'] })
  const router = createRouter({ routeTree, history })
  return render(<QueryClientProvider client={qc}><RouterProvider router={router} /></QueryClientProvider>)
}

describe('ProposalForm', () => {
  beforeEach(() => {
    mockUseCreate.mockReturnValue(makeMutation() as ReturnType<typeof useCreateProposal>)
    mockUseUpdate.mockReturnValue(makeMutation() as ReturnType<typeof useUpdateProposal>)
    mockUseDelete.mockReturnValue(makeMutation() as ReturnType<typeof useDeleteProposal>)
  })

  describe('create mode', () => {
    it('renders all form fields', async () => {
      renderForm('create')
      await waitFor(() => {
        expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/pré-requisitos/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/número de vagas/i)).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /departamento/i })).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /área/i })).toBeInTheDocument()
      })
    })

    it('shows validation errors on empty submit', async () => {
      renderForm('create')
      await waitFor(() => expect(screen.getByRole('button', { name: /criar proposta/i })).toBeInTheDocument())
      await userEvent.click(screen.getByRole('button', { name: /criar proposta/i }))
      await waitFor(() => {
        expect(screen.getByText(/título deve ter ao menos 5 caracteres/i)).toBeInTheDocument()
        expect(screen.getByText(/descrição deve ter ao menos 20 caracteres/i)).toBeInTheDocument()
      })
    })

    it('calls useCreateProposal mutate on valid submit', async () => {
      const mutateFn = vi.fn()
      mockUseCreate.mockReturnValue(makeMutation(mutateFn) as ReturnType<typeof useCreateProposal>)
      renderForm('create')
      await waitFor(() => expect(screen.getByLabelText(/título/i)).toBeInTheDocument())

      await userEvent.type(screen.getByLabelText(/título/i), 'Novo Tema Legal')
      await userEvent.type(screen.getByLabelText(/descrição/i), 'Esta é uma descrição longa o suficiente.')
      await userEvent.clear(screen.getByLabelText(/número de vagas/i))
      await userEvent.type(screen.getByLabelText(/número de vagas/i), '3')

      await userEvent.click(screen.getByRole('combobox', { name: /departamento/i }))
      await userEvent.click(screen.getByRole('option', { name: 'DCC' }))
      await userEvent.click(screen.getByRole('combobox', { name: /área/i }))
      await userEvent.click(screen.getByRole('option', { name: 'Inteligência Artificial' }))

      await userEvent.click(screen.getByRole('button', { name: /criar proposta/i }))
      await waitFor(() => expect(mutateFn).toHaveBeenCalledOnce())
      expect(mutateFn).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Novo Tema Legal', description: 'Esta é uma descrição longa o suficiente.', max_slots: 3, department_id: 1, area_id: 1 }),
        expect.any(Object),
      )
    })
  })

  describe('edit mode', () => {
    it('pre-populates fields with existing proposal data', async () => {
      renderForm('edit')
      await waitFor(() => expect(screen.getByDisplayValue('IA Aplicada à Medicina')).toBeInTheDocument())
      expect(screen.getByDisplayValue('Descrição completa com ao menos vinte caracteres aqui.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })

    it('shows delete button in edit mode', async () => {
      renderForm('edit')
      await waitFor(() => expect(screen.getByRole('button', { name: /excluir proposta/i })).toBeInTheDocument())
    })

    it('does not show delete button in create mode', async () => {
      renderForm('create')
      await waitFor(() => expect(screen.getByRole('button', { name: /criar proposta/i })).toBeInTheDocument())
      expect(screen.queryByRole('button', { name: /excluir proposta/i })).not.toBeInTheDocument()
    })
  })
})
