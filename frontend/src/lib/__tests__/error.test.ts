import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/error'

describe('AppError', () => {
  it('sets message, status and name correctly', () => {
    const err = new AppError('Something went wrong', 500)
    expect(err.message).toBe('Something went wrong')
    expect(err.status).toBe(500)
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })
})

describe('ValidationError', () => {
  it('sets status to 422 and stores field errors', () => {
    const err = new ValidationError({
      message: 'Os dados fornecidos são inválidos.',
      errors: {
        email: ['O e-mail já está em uso.', 'O e-mail é inválido.'],
        password: ['A senha é muito curta.'],
      },
    })
    expect(err.status).toBe(422)
    expect(err.name).toBe('ValidationError')
    expect(err.message).toBe('Os dados fornecidos são inválidos.')
    expect(err.errors.email).toEqual(['O e-mail já está em uso.', 'O e-mail é inválido.'])
    expect(err.errors.password).toEqual(['A senha é muito curta.'])
  })

  it('firstError() returns the first error for a field', () => {
    const err = new ValidationError({
      message: 'Erro de validação',
      errors: { email: ['E-mail inválido', 'E-mail duplicado'] },
    })
    expect(err.firstError('email')).toBe('E-mail inválido')
  })

  it('firstError() returns undefined for an unknown field', () => {
    const err = new ValidationError({
      message: 'Erro de validação',
      errors: { email: ['E-mail inválido'] },
    })
    expect(err.firstError('name')).toBeUndefined()
  })

  it('is instanceof AppError and Error', () => {
    const err = new ValidationError({ message: 'x', errors: {} })
    expect(err).toBeInstanceOf(AppError)
    expect(err).toBeInstanceOf(Error)
  })
})

describe('AuthError', () => {
  it('has status 401 and default message', () => {
    const err = new AuthError()
    expect(err.status).toBe(401)
    expect(err.message).toBe('Não autenticado')
    expect(err.name).toBe('AuthError')
  })

  it('accepts a custom message', () => {
    const err = new AuthError('Token expirado')
    expect(err.message).toBe('Token expirado')
  })
})

describe('ForbiddenError', () => {
  it('has status 403 and default message', () => {
    const err = new ForbiddenError()
    expect(err.status).toBe(403)
    expect(err.message).toBe('Acesso negado')
    expect(err.name).toBe('ForbiddenError')
  })

  it('accepts a custom message', () => {
    const err = new ForbiddenError('Sem permissão para editar')
    expect(err.message).toBe('Sem permissão para editar')
  })
})

describe('NotFoundError', () => {
  it('has status 404 and default message', () => {
    const err = new NotFoundError()
    expect(err.status).toBe(404)
    expect(err.message).toBe('Recurso não encontrado')
    expect(err.name).toBe('NotFoundError')
  })

  it('accepts a custom message', () => {
    const err = new NotFoundError('Proposta não encontrada')
    expect(err.message).toBe('Proposta não encontrada')
  })
})