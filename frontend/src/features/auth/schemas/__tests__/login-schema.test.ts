import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/features/auth/schemas'

describe('loginSchema', () => {
  describe('email field', () => {
    it('accepts a valid email', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'abc123' })
      expect(result.success).toBe(true)
    })

    it('rejects an empty email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError).toBeDefined()
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })

    it('rejects a malformed email (missing @)', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })

    it('rejects an email without domain', () => {
      const result = loginSchema.safeParse({ email: 'user@', password: 'abc123' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError).toBeDefined()
      }
    })

    it('rejects a missing email field', () => {
      const result = loginSchema.safeParse({ password: 'abc123' })
      expect(result.success).toBe(false)
    })
  })

  describe('password field', () => {
    it('accepts a non-empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'p' })
      expect(result.success).toBe(true)
    })

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find((i) => i.path[0] === 'password')
        expect(passwordError?.message).toBe('Senha obrigatória')
      }
    })

    it('rejects a missing password field', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br' })
      expect(result.success).toBe(false)
    })
  })

  describe('valid full payload', () => {
    it('returns the parsed data on success', () => {
      const result = loginSchema.safeParse({ email: 'user@ufmg.br', password: 'abc123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ email: 'user@ufmg.br', password: 'abc123' })
      }
    })
  })
})
