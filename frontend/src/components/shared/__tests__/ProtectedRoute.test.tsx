import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'

vi.mock('@/hooks/use-auth', () => ({ useAuth: vi.fn() }))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

import { useAuth } from '@/hooks/use-auth'

const student = {
  user: { id: 2, name: 'Aluno', email: 'aluno@ufmg.br', role: 'student' as const, department_id: 1, profile_link: null },
  token: 'tok', isAuthenticated: true, isProfessor: false, isStudent: true,
  setAuth: vi.fn(), clearAuth: vi.fn(),
}

const professor = {
  user: { id: 1, name: 'Prof', email: 'prof@ufmg.br', role: 'professor' as const, department_id: 1, profile_link: null },
  token: 'tok', isAuthenticated: true, isProfessor: true, isStudent: false,
  setAuth: vi.fn(), clearAuth: vi.fn(),
}

const unauthenticated = {
  user: null, token: null, isAuthenticated: false, isProfessor: false, isStudent: false,
  setAuth: vi.fn(), clearAuth: vi.fn(),
}

describe('ProtectedRoute', () => {
  beforeEach(() => { mockNavigate.mockClear() })

  describe('unauthenticated user', () => {
    beforeEach(() => { vi.mocked(useAuth).mockReturnValue(unauthenticated as any) })

    it('redirects to /entrar', () => {
      render(<ProtectedRoute><div>Content</div></ProtectedRoute>)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar', search: { mode: undefined, role: undefined } })
    })

    it('renders nothing', () => {
      const { container } = render(<ProtectedRoute><div>Content</div></ProtectedRoute>)
      expect(container).toBeEmptyDOMElement()
    })

    it('redirects to /entrar even when role is specified', () => {
      render(<ProtectedRoute role="student"><div>Content</div></ProtectedRoute>)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/entrar', search: { mode: undefined, role: undefined } })
    })
  })

  describe('student on student-only route', () => {
    beforeEach(() => { vi.mocked(useAuth).mockReturnValue(student as any) })

    it('renders children with no role restriction', () => {
      render(<ProtectedRoute><div>Content</div></ProtectedRoute>)
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('renders children when role matches', () => {
      render(<ProtectedRoute role="student"><div>Student Content</div></ProtectedRoute>)
      expect(screen.getByText('Student Content')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('redirects to / when student accesses professor route', () => {
      render(<ProtectedRoute role="professor"><div>Prof Content</div></ProtectedRoute>)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('renders nothing when student accesses professor route', () => {
      const { container } = render(<ProtectedRoute role="professor"><div>Prof Content</div></ProtectedRoute>)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('professor on professor-only route', () => {
    beforeEach(() => { vi.mocked(useAuth).mockReturnValue(professor as any) })

    it('renders children when role matches', () => {
      render(<ProtectedRoute role="professor"><div>Dashboard</div></ProtectedRoute>)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('redirects to / when professor accesses student route', () => {
      render(<ProtectedRoute role="student"><div>Applications</div></ProtectedRoute>)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })

    it('renders nothing when professor accesses student route', () => {
      const { container } = render(<ProtectedRoute role="student"><div>Applications</div></ProtectedRoute>)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders children with no role restriction', () => {
      render(<ProtectedRoute><div>General Content</div></ProtectedRoute>)
      expect(screen.getByText('General Content')).toBeInTheDocument()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
