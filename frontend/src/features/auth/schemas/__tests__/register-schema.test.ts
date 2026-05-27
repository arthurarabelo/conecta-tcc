import { describe, expect, it } from 'vitest'
import { registerSchema } from '@/features/auth/schemas'

const validPayload = {
  name: 'João Silva',
  email: 'joao@ufmg.br',
  password: 'senha123',
  password_confirmation: 'senha123',
  role: 'student' as const,
  department_id: 1,
  profile_link: '',
}

describe('registerSchema', () => {
  describe('name field', () => {
    it('accepts a name with at least 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: 'Jo' })
      expect(result.success).toBe(true)
    })

    it('rejects a name with fewer than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: 'J' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const nameError = result.error.issues.find((i) => i.path[0] === 'name')
        expect(nameError?.message).toBe('Nome deve ter ao menos 2 caracteres')
      }
    })

    it('rejects an empty name', () => {
      const result = registerSchema.safeParse({ ...validPayload, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('email field', () => {
    it('rejects an invalid email', () => {
      const result = registerSchema.safeParse({ ...validPayload, email: 'not-valid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === 'email')
        expect(emailError?.message).toBe('E-mail inválido')
      }
    })
  })

  describe('password field', () => {
    it('rejects a password shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: '12345',
        password_confirmation: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find((i) => i.path[0] === 'password')
        expect(passwordError?.message).toBe('Senha deve ter ao menos 6 caracteres')
      }
    })

    it('accepts a password with exactly 6 characters', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: '123456',
        password_confirmation: '123456',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('password_confirmation field', () => {
    it('rejects when password and password_confirmation do not match', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'senha123',
        password_confirmation: 'diferente',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (i) => i.path[0] === 'password_confirmation',
        )
        expect(confirmError?.message).toBe('As senhas não coincidem')
      }
    })

    it('accepts when passwords match', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        password: 'senha123',
        password_confirmation: 'senha123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('role field', () => {
    it('accepts "student" role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'student' })
      expect(result.success).toBe(true)
    })

    it('accepts "professor" role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'professor' })
      expect(result.success).toBe(true)
    })

    it('rejects an invalid role', () => {
      const result = registerSchema.safeParse({ ...validPayload, role: 'admin' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const roleError = result.error.issues.find((i) => i.path[0] === 'role')
        expect(roleError).toBeDefined()
      }
    })
  })

  describe('department_id field', () => {
    it('accepts a positive integer', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: 5 })
      expect(result.success).toBe(true)
    })

    it('rejects zero', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: 0 })
      expect(result.success).toBe(false)
    })

    it('coerces a numeric string to number', () => {
      const result = registerSchema.safeParse({ ...validPayload, department_id: '3' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.department_id).toBe(3)
      }
    })
  })

  describe('profile_link field', () => {
    it('accepts an empty string', () => {
      const result = registerSchema.safeParse({ ...validPayload, profile_link: '' })
      expect(result.success).toBe(true)
    })

    it('accepts a valid URL', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        profile_link: 'https://lattes.cnpq.br/123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts undefined (optional)', () => {
      const { profile_link: _, ...payloadWithoutLink } = validPayload
      const result = registerSchema.safeParse(payloadWithoutLink)
      expect(result.success).toBe(true)
    })

    it('rejects a non-URL string', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        profile_link: 'not-a-url',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const linkError = result.error.issues.find((i) => i.path[0] === 'profile_link')
        expect(linkError?.message).toBe('URL inválida')
      }
    })
  })

  describe('valid full payload', () => {
    it('returns parsed data on success for student', () => {
      const result = registerSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('student')
        expect(result.data.department_id).toBe(1)
      }
    })

    it('returns parsed data on success for professor', () => {
      const result = registerSchema.safeParse({
        ...validPayload,
        role: 'professor',
        profile_link: 'https://lattes.cnpq.br/professor',
      })
      expect(result.success).toBe(true)
    })
  })
})
