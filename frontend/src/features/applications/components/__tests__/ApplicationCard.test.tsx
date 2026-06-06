import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApplicationCard } from '@/features/applications/components/ApplicationCard'
import type { Application } from '@/types/models'

// TanStack Router's Link requires a router context. Provide a minimal stub.
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const baseApplication: Application = {
  id: 100,
  student_id: 2,
  proposal_id: 10,
  status: 'pending',
  feedback: null,
  applied_at: '2025-05-10T09:00:00Z',
  reviewed_at: null,
  student: {
    id: 2,
    name: 'João Silva',
    email: 'joao@student.edu',
    role: 'student',
    department_id: null,
    profile_link: null,
  },
  proposal: {
    id: 10,
    professor_id: 1,
    title: 'ML em Biomedicina',
    description: 'Desc',
    prerequisites: null,
    max_slots: 4,
    department_id: 1,
    area_id: 1,
    status: 'open',
    professor: {
      id: 1,
      name: 'Ana Lima',
      email: 'ana@uni.edu',
      role: 'professor',
      department_id: 1,
      profile_link: null,
    },
    area: { id: 1, name: 'Inteligência Artificial', code: 'IA' },
  },
}

describe('ApplicationCard', () => {
  it('renders proposal title', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('ML em Biomedicina')).toBeInTheDocument()
  })

  it('renders professor name', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Prof. Ana Lima')).toBeInTheDocument()
  })

  it('renders area badge', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument()
  })

  it('renders applied_at date formatted in long pt-BR format', () => {
    render(<ApplicationCard application={baseApplication} />)
    // formatDateLong('2025-05-10T09:00:00Z') → "10 de maio de 2025"
    expect(screen.getByText(/10 de maio de 2025/i)).toBeInTheDocument()
  })

  it('renders "Em análise" status badge for pending', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.getByText('Em análise')).toBeInTheDocument()
  })

  it('renders "Aprovada" status badge for approved', () => {
    render(<ApplicationCard application={{ ...baseApplication, status: 'approved' }} />)
    expect(screen.getByText('Aprovada')).toBeInTheDocument()
  })

  it('does NOT show feedback section when status is pending', () => {
    render(<ApplicationCard application={baseApplication} />)
    expect(screen.queryByText(/Feedback:/i)).not.toBeInTheDocument()
  })

  it('does NOT show feedback section when status is approved', () => {
    render(<ApplicationCard application={{ ...baseApplication, status: 'approved' }} />)
    expect(screen.queryByText(/Feedback:/i)).not.toBeInTheDocument()
  })

  it('shows feedback section with text when status is rejected', () => {
    const app: Application = {
      ...baseApplication,
      status: 'rejected',
      feedback: 'Perfil não compatível',
      reviewed_at: '2025-05-11T10:00:00Z',
    }
    render(<ApplicationCard application={app} />)
    expect(screen.getByText(/Feedback:/i)).toBeInTheDocument()
    expect(screen.getByText(/Perfil não compatível/i)).toBeInTheDocument()
  })

  it('renders "Ver proposta" link pointing to /propostas/10', () => {
    render(<ApplicationCard application={baseApplication} />)
    const link = screen.getByRole('link', { name: /Ver proposta/i })
    expect(link).toHaveAttribute('href', '/propostas/10')
  })
})
