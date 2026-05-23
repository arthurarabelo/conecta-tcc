import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

describe('Theme and cn() integration', () => {
  it('renders Card with composed children', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Proposta de TCC</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Conteúdo da proposta</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Proposta de TCC')).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da proposta')).toBeInTheDocument()
  })

  it('renders Badge with variant', () => {
    render(<Badge variant="secondary">Em aberto</Badge>)
    expect(screen.getByText('Em aberto')).toBeInTheDocument()
  })

  it('cn() merges conflicting tailwind classes correctly', () => {
    // tailwind-merge removes bg-red-500 when bg-blue-500 is later
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('cn() handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class')
    expect(result).toBe('base-class active-class')
  })
})
