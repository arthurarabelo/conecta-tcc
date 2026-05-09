import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function HelloWorld() {
  return <h1>Conecta TCC</h1>
}

describe('Smoke test', () => {
  it('renders a simple component', () => {
    render(<HelloWorld />)
    expect(screen.getByRole('heading', { name: 'Conecta TCC' })).toBeInTheDocument()
  })

  it('verifies @/ alias resolves utils', async () => {
    const { cn } = await import('@/lib/utils')
    expect(typeof cn).toBe('function')
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
