import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '..'

function Boom({ message }: { message?: string }): never {
  throw new Error(message ?? 'kaboom')
}

describe('ErrorBoundary', () => {
  // React logs caught errors to console.error; silence it to keep test output clean.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>Conteúdo normal</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Conteúdo normal')).toBeInTheDocument()
  })

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recarregar página' })).toBeInTheDocument()
  })

  it('shows the thrown error message', () => {
    render(
      <ErrorBoundary>
        <Boom message="Falha ao carregar dados" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Falha ao carregar dados')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Fallback customizado</p>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Fallback customizado')).toBeInTheDocument()
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument()
  })

  it('logs the caught error to console.error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(console.error).toHaveBeenCalledWith(
      '[ErrorBoundary] Caught error:',
      expect.any(Error),
      expect.anything(),
    )
  })

  it('reloads the page when the reload button is clicked', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload },
    })

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar página' }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
