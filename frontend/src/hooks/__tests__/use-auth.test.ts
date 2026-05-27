import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/models'

const mockProfessor: User = {
  id: 1,
  name: 'Prof. Silva',
  email: 'silva@ufmg.br',
  role: 'professor',
  department_id: 2,
  profile_link: 'https://lattes.cnpq.br/silva',
}

const mockStudent: User = {
  id: 2,
  name: 'João Aluno',
  email: 'joao@ufmg.br',
  role: 'student',
  department_id: 2,
  profile_link: null,
}

const mockToken = 'token-xyz'

describe('useAuth hook', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    localStorage.clear()
  })

  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isProfessor).toBe(false)
    expect(result.current.isStudent).toBe(false)
  })

  it('returns authenticated state after setAuth', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockStudent, mockToken)
    })

    expect(result.current.user).toEqual(mockStudent)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('isProfessor is true for professor role', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockProfessor, mockToken)
    })

    expect(result.current.isProfessor).toBe(true)
    expect(result.current.isStudent).toBe(false)
  })

  it('isStudent is true for student role', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockStudent, mockToken)
    })

    expect(result.current.isStudent).toBe(true)
    expect(result.current.isProfessor).toBe(false)
  })

  it('clears state after clearAuth', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.setAuth(mockProfessor, mockToken)
    })
    act(() => {
      result.current.clearAuth()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isProfessor).toBe(false)
    expect(result.current.isStudent).toBe(false)
  })

  it('exposes setAuth and clearAuth functions', () => {
    const { result } = renderHook(() => useAuth())

    expect(typeof result.current.setAuth).toBe('function')
    expect(typeof result.current.clearAuth).toBe('function')
  })
})
