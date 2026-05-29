import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '..'

describe('StatusBadge', () => {
  it('renders "Em análise" for pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Em análise')).toBeInTheDocument()
  })

  it('renders "Aprovado" for approved status', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
  })

  it('renders "Rejeitado" for rejected status', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejeitado')).toBeInTheDocument()
  })

  it('applies yellow styling for pending', () => {
    const { container } = render(<StatusBadge status="pending" />)
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })

  it('applies green styling for approved', () => {
    const { container } = render(<StatusBadge status="approved" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('applies red styling for rejected', () => {
    const { container } = render(<StatusBadge status="rejected" />)
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})