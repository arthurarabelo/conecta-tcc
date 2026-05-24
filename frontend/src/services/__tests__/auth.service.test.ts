import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { mockUser, mockToken } from '@/test/handlers'
import type { RegisterPayload } from '@/services/auth.service'

describe('authService', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    localStorage.clear()
  })

  describe('login', () => {
    it('returns user and token on valid credentials', async () => {
      const result = await authService.login({
        email: 'test@ufmg.br',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe(mockToken)
    })

    it('throws an error on invalid credentials', async () => {
      await expect(
        authService.login({ email: 'wrong@ufmg.br', password: 'wrongpass' }),
      ).rejects.toMatchObject({ status: 401 })
    })

    it('returns an object with user and token keys', async () => {
      const result = await authService.login({
        email: 'test@ufmg.br',
        password: 'password123',
      })

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('token')
    })
  })

  describe('register', () => {
    const validRegisterPayload: RegisterPayload = {
      name: 'Novo Aluno',
      email: 'novo@ufmg.br',
      password: 'senha123',
      password_confirmation: 'senha123',
      role: 'student',
      department_id: 1,
    }

    it('returns user and token on valid payload', async () => {
      const result = await authService.register(validRegisterPayload)

      expect(result.user.name).toBe('Novo Aluno')
      expect(result.user.email).toBe('novo@ufmg.br')
      expect(result.user.role).toBe('student')
      expect(result.token).toBe(mockToken)
    })

    it('works for professor role', async () => {
      const result = await authService.register({
        ...validRegisterPayload,
        name: 'Prof. Costa',
        email: 'costa@ufmg.br',
        role: 'professor',
        profile_link: 'https://lattes.cnpq.br/costa',
      })

      expect(result.user.role).toBe('professor')
    })

    it('throws ValidationError on missing fields', async () => {
      await expect(
        authService.register({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'student',
          department_id: 1,
        }),
      ).rejects.toMatchObject({ status: 422 })
    })
  })

  describe('logout', () => {
    it('resolves without error when authenticated', async () => {
      localStorage.setItem('auth_token', mockToken)
      await expect(authService.logout()).resolves.toBeUndefined()
    })
  })

  describe('me', () => {
    it('returns current user when token is present', async () => {
      localStorage.setItem('auth_token', mockToken)
      const user = await authService.me()

      expect(user).toEqual(mockUser)
    })

    it('throws AuthError when no token provided', async () => {
      await expect(authService.me()).rejects.toMatchObject({ status: 401 })
    })

    it('returns user matching the User type structure', async () => {
      localStorage.setItem('auth_token', mockToken)
      const user = await authService.me()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('department_id')
      expect(user).toHaveProperty('profile_link')
    })
  })
})
