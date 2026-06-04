import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory, createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { ApplicationCard } from '../ApplicationCard'
import type { Proposal, User, Application } from '@/types/models'

function wrap(ui: React.ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui })
  const routeTree = rootRoute.addChildren([])
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({ routeTree, history })
  return render(<RouterProvider router={router} />)
}

const openProposal: Proposal = {
  id: 1, professor_id: 10, title: 'IA na saúde', description: 'Desc',
  prerequisites: null, max_slots: 4, department_id: 1, area_id: 1,
  status: 'open', applications_count: 2, approved_applications_count: 1,
}
const closedProposal: Proposal = { ...openProposal, status: 'closed' }
const fullProposal: Proposal = { ...openProposal, approved_applications_count: 4 }

const student: User = { id: 5, name: 'Aluno Teste', email: 'aluno@uni.br', role: 'student', department_id: null, profile_link: null }
const professor: User = { ...student, id: 10, role: 'professor' }

const pendingApplication: Application = { id: 100, student_id: 5, proposal_id: 1, status: 'pending', feedback: null, applied_at: '2024-01-01T00:00:00Z', reviewed_at: null }
const approvedApplication: Application = { ...pendingApplication, status: 'approved' }
const rejectedApplication: Application = { ...pendingApplication, status: 'rejected' }

describe('ApplicationCard', () => {
  it('shows slot progress bar', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={null} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    await screen.findByText('1 de 4 vagas aprovadas')
  })

  it('shows "Entrar para se candidatar" link for unauthenticated visitor', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={null} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByRole('link', { name: /entrar para se candidatar/i })).toBeInTheDocument()
  })

  it('shows "Candidatar-se" button for authenticated student with no application', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={student} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    const btn = await screen.findByRole('button', { name: /candidatar-se/i })
    expect(btn).not.toBeDisabled()
  })

  it('calls onApply when "Candidatar-se" is clicked', async () => {
    const onApply = vi.fn()
    wrap(<ApplicationCard proposal={openProposal} user={student} userApplication={null} onApply={onApply} isApplying={false} />)
    await userEvent.click(await screen.findByRole('button', { name: /candidatar-se/i }))
    expect(onApply).toHaveBeenCalledOnce()
  })

  it('shows "Em análise" badge for student with pending application', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={student} userApplication={pendingApplication} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByText('Em análise')).toBeInTheDocument()
  })

  it('shows "Aprovado" badge and link for student with approved application', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={student} userApplication={approvedApplication} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByText('Aprovado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /minhas candidaturas/i })).toBeInTheDocument()
  })

  it('shows "Rejeitado" badge for student with rejected application', async () => {
    wrap(<ApplicationCard proposal={openProposal} user={student} userApplication={rejectedApplication} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByText('Rejeitado')).toBeInTheDocument()
  })

  it('shows disabled "Proposta encerrada" button when proposal is closed', async () => {
    wrap(<ApplicationCard proposal={closedProposal} user={student} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByRole('button', { name: /proposta encerrada/i })).toBeDisabled()
  })

  it('shows disabled "Sem vagas disponíveis" when all slots are taken', async () => {
    wrap(<ApplicationCard proposal={fullProposal} user={student} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    expect(await screen.findByRole('button', { name: /sem vagas disponíveis/i })).toBeDisabled()
  })

  it('renders nothing for professor users', async () => {
    const { container } = wrap(<ApplicationCard proposal={openProposal} user={professor} userApplication={null} onApply={vi.fn()} isApplying={false} />)
    // Wait for router to settle
    await new Promise((r) => setTimeout(r, 50))
    expect(container.querySelector('[class*="card"]')).toBeNull()
  })
})
