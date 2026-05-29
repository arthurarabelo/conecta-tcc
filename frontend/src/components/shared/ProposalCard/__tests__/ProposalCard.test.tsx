// frontend/src/components/shared/ProposalCard/__tests__/ProposalCard.test.tsx
import { render, screen } from '@testing-library/react'
import { createMemoryHistory, createRouter, createRootRoute, RouterProvider } from '@tanstack/react-router'
import { ProposalCard } from '..'
import type { Proposal } from '@/types/models'

const mockProposal: Proposal = {
  id: 42,
  professor_id: 1,
  title: 'Análise de Sentimentos com PLN',
  description: 'Neste trabalho, o aluno irá explorar técnicas de Processamento de Linguagem Natural para análise de sentimentos em redes sociais, desenvolvendo modelos de aprendizado de máquina.',
  prerequisites: 'Python básico',
  max_slots: 3,
  department_id: 1,
  area_id: 2,
  status: 'open',
  professor: {
    id: 1,
    name: 'Prof. Ana Souza',
    email: 'ana@univ.br',
    role: 'professor',
    department_id: 1,
    profile_link: null,
  },
  department: { id: 1, name: 'Ciência da Computação', code: 'CC' },
  area: { id: 2, name: 'Inteligência Artificial', code: 'IA' },
  applications_count: 1,
  approved_applications_count: 1,
}

function renderWithRouter(ui: React.ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  })
  return render(<RouterProvider router={router} />)
}

describe('ProposalCard', () => {
  it('renders the proposal title', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Análise de Sentimentos com PLN')).toBeInTheDocument()
  })

  it('renders the professor name', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Prof. Ana Souza')).toBeInTheDocument()
  })

  it('renders remaining slots count', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    // max_slots=3, approved=1 → 2 remaining
    expect(await screen.findByText(/2 de 3 vagas/)).toBeInTheDocument()
  })

  it('renders a link to the proposal detail page', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    const link = await screen.findByRole('link')
    expect(link).toHaveAttribute('href', '/propostas/42')
  })

  it('renders the knowledge area badge', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('renders "Aberta" badge for open proposal', async () => {
    renderWithRouter(<ProposalCard proposal={mockProposal} />)
    expect(await screen.findByText('Aberta')).toBeInTheDocument()
  })

  it('renders "Fechada" badge for closed proposal', async () => {
    renderWithRouter(<ProposalCard proposal={{ ...mockProposal, status: 'closed' }} />)
    expect(await screen.findByText('Fechada')).toBeInTheDocument()
  })
})