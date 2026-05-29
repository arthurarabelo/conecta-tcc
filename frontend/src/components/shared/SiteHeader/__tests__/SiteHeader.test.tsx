import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRouter,
  createRootRoute,
  RouterProvider,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { SiteHeader } from '..'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken } from '@/test/handlers'

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const ui: ReactElement = (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
    </QueryClientProvider>
  )

  const rootRoute = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  })
  return render(<RouterProvider router={router} />)
}

describe('SiteHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  it('renders the brand name', async () => {
    renderHeader()
    expect(await screen.findByText('Conecta TCC')).toBeInTheDocument()
  })

  it('renders the public nav links', async () => {
    renderHeader()
    // Home and Mural render in both desktop and mobile nav
    expect((await screen.findAllByText('Home')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Mural').length).toBeGreaterThan(0)
  })

  it('shows "Entrar" when not authenticated', async () => {
    renderHeader()
    expect((await screen.findAllByText('Entrar')).length).toBeGreaterThan(0)
  })

  it('does not show role-specific links when not authenticated', async () => {
    renderHeader()
    await screen.findByText('Conecta TCC')
    expect(screen.queryByText('Minhas Candidaturas')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('shows the user name when authenticated', async () => {
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })
    renderHeader()
    expect((await screen.findAllByText('Test User')).length).toBeGreaterThan(0)
  })

  it('does not show "Entrar" when authenticated', async () => {
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })
    renderHeader()
    await screen.findAllByText('Test User')
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
  })

  it('shows "Minhas Candidaturas" for a student', async () => {
    useAuthStore.setState({
      user: { ...mockUser, role: 'student' },
      token: mockToken,
      isAuthenticated: true,
    })
    renderHeader()
    expect((await screen.findAllByText('Minhas Candidaturas')).length).toBeGreaterThan(0)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('shows "Dashboard" for a professor', async () => {
    useAuthStore.setState({
      user: { ...mockUser, role: 'professor' },
      token: mockToken,
      isAuthenticated: true,
    })
    renderHeader()
    expect((await screen.findAllByText('Dashboard')).length).toBeGreaterThan(0)
    expect(screen.queryByText('Minhas Candidaturas')).not.toBeInTheDocument()
  })

  it('renders the user initials in the avatar', async () => {
    useAuthStore.setState({ user: mockUser, token: mockToken, isAuthenticated: true })
    renderHeader()
    // "Test User" → "TU"
    expect(await screen.findByText('TU')).toBeInTheDocument()
  })
})
